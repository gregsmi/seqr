import base64
from collections import defaultdict
from datetime import datetime
import gzip
import json
import os
import re
import requests
import urllib3

from django.contrib.postgres.aggregates import ArrayAgg
from django.db.models import Max,  prefetch_related_objects
from django.http.response import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from requests.exceptions import ConnectionError as RequestConnectionError

from seqr.utils.elasticsearch.utils import get_es_client, get_index_metadata
from seqr.utils.file_utils import file_iter, does_file_exist
from seqr.utils.logging_utils import SeqrLogger, log_model_bulk_update

from seqr.views.utils.dataset_utils import match_and_update_samples, load_mapping_file_content
from seqr.views.utils.file_utils import parse_file, get_temp_upload_directory, load_uploaded_file
from seqr.views.utils.json_utils import create_json_response, _to_camel_case
from seqr.views.utils.permissions_utils import data_manager_required

from seqr.models import Sample, Individual, Project, RnaSeqOutlier

from settings import ELASTICSEARCH_SERVER, KIBANA_SERVER, KIBANA_ELASTICSEARCH_PASSWORD, DEMO_PROJECT_CATEGORY, \
    ANALYST_PROJECT_CATEGORY

logger = SeqrLogger(__name__)


@data_manager_required
def elasticsearch_status(request):
    client = get_es_client()

    disk_status = {
        disk['node']: disk for disk in
        _get_es_meta(client, 'allocation', ['node', 'shards', 'disk.avail', 'disk.used', 'disk.percent'])
    }

    for node in  _get_es_meta(
            client, 'nodes', ['name', 'heap.percent'], filter_rows=lambda node: node['name'] in disk_status):
        disk_status[node.pop('name')].update(node)

    indices, seqr_index_projects = _get_es_indices(client)

    errors = ['{} does not exist and is used by project(s) {}'.format(
        index, ', '.join(['{} ({} samples)'.format(p.name, len(indivs)) for p, indivs in project_individuals.items()])
    ) for index, project_individuals in seqr_index_projects.items() if project_individuals]

    return create_json_response({
        'indices': indices,
        'diskStats': list(disk_status.values()),
        'elasticsearchHost': ELASTICSEARCH_SERVER,
        'errors': errors,
    })


def _get_es_meta(client, meta_type, fields, filter_rows=None):
    return [{
        _to_camel_case(field.replace('.', '_')): o[field] for field in fields
    } for o in getattr(client.cat, meta_type)(format="json", h=','.join(fields))
        if filter_rows is None or filter_rows(o)]

def _get_es_indices(client):
    indices = _get_es_meta(
        client, 'indices', ['index', 'docs.count', 'store.size', 'creation.date.string'],
        filter_rows=lambda index: all(
            not index['index'].startswith(omit_prefix) for omit_prefix in ['.', 'index_operations_log']))

    aliases = defaultdict(list)
    for alias in _get_es_meta(client, 'aliases', ['alias', 'index']):
        aliases[alias['alias']].append(alias['index'])

    index_metadata = get_index_metadata('_all', client, use_cache=False)

    active_samples = Sample.objects.filter(is_active=True).select_related('individual__family__project')

    seqr_index_projects = defaultdict(lambda: defaultdict(set))
    es_projects = set()
    for sample in active_samples:
        for index_name in sample.elasticsearch_index.split(','):
            project = sample.individual.family.project
            es_projects.add(project)
            if index_name in aliases:
                for aliased_index_name in aliases[index_name]:
                    seqr_index_projects[aliased_index_name][project].add(sample.individual.guid)
            else:
                seqr_index_projects[index_name.rstrip('*')][project].add(sample.individual.guid)

    for index in indices:
        index_name = index['index']
        index.update(index_metadata[index_name])

        projects_for_index = []
        for index_prefix in list(seqr_index_projects.keys()):
            if index_name.startswith(index_prefix):
                projects_for_index += list(seqr_index_projects.pop(index_prefix).keys())
        index['projects'] = [
            {'projectGuid': project.guid, 'projectName': project.name} for project in projects_for_index]

    return indices, seqr_index_projects


@data_manager_required
def delete_index(request):
    index = json.loads(request.body)['index']
    active_index_samples = Sample.objects.filter(is_active=True, elasticsearch_index=index)
    if active_index_samples:
        projects = {
            sample.individual.family.project.name for sample in active_index_samples.select_related('individual__family__project')
        }
        return create_json_response({'error': 'Index "{}" is still used by: {}'.format(index, ', '.join(projects))}, status=403)

    client = get_es_client()
    client.indices.delete(index)
    updated_indices, _ = _get_es_indices(client)

    return create_json_response({'indices': updated_indices})


@data_manager_required
def upload_qc_pipeline_output(request):
    file_path = json.loads(request.body)['file'].strip()
    if not does_file_exist(file_path, user=request.user):
        return create_json_response({'errors': ['File not found: {}'.format(file_path)]}, status=400)
    raw_records = parse_file(file_path, file_iter(file_path, user=request.user))

    json_records = [dict(zip(raw_records[0], row)) for row in raw_records[1:]]

    try:
        dataset_type, data_type, records_by_sample_id = _parse_raw_qc_records(json_records)
    except ValueError as e:
        return create_json_response({'errors': [str(e)]}, status=400, reason=str(e))

    info_message = 'Parsed {} {} samples'.format(
        len(json_records), 'SV' if dataset_type == Sample.DATASET_TYPE_SV_CALLS else data_type)
    logger.info(info_message, request.user)
    info = [info_message]
    warnings = []

    samples = Sample.objects.filter(
        sample_id__in=records_by_sample_id.keys(),
        sample_type=Sample.SAMPLE_TYPE_WES if data_type == 'exome' else Sample.SAMPLE_TYPE_WGS,
        dataset_type=dataset_type,
    ).exclude(
        individual__family__project__name__in=EXCLUDE_PROJECTS
    ).exclude(individual__family__project__projectcategory__name=DEMO_PROJECT_CATEGORY)

    sample_individuals = {
        agg['sample_id']: agg['individuals'] for agg in
        samples.values('sample_id').annotate(individuals=ArrayAgg('individual_id', distinct=True))
    }

    sample_individual_max_loaded_date = {
        agg['individual_id']: agg['max_loaded_date'] for agg in
        samples.values('individual_id').annotate(max_loaded_date=Max('loaded_date'))
    }
    individual_latest_sample_id = {
        s.individual_id: s.sample_id for s in samples
        if s.loaded_date == sample_individual_max_loaded_date.get(s.individual_id)
    }

    for sample_id, record in records_by_sample_id.items():
        record['individual_ids'] = list({
            individual_id for individual_id in sample_individuals.get(sample_id, [])
            if individual_latest_sample_id[individual_id] == sample_id
        })

    missing_sample_ids = {sample_id for sample_id, record in records_by_sample_id.items() if not record['individual_ids']}
    if missing_sample_ids:
        individuals = Individual.objects.filter(individual_id__in=missing_sample_ids).exclude(
            family__project__name__in=EXCLUDE_PROJECTS).exclude(
            family__project__projectcategory__name=DEMO_PROJECT_CATEGORY).filter(
            sample__sample_type=Sample.SAMPLE_TYPE_WES if data_type == 'exome' else Sample.SAMPLE_TYPE_WGS).distinct()
        individual_db_ids_by_id = defaultdict(list)
        for individual in individuals:
            individual_db_ids_by_id[individual.individual_id].append(individual.id)
        for sample_id, record in records_by_sample_id.items():
            if not record['individual_ids'] and len(individual_db_ids_by_id[sample_id]) >= 1:
                record['individual_ids'] = individual_db_ids_by_id[sample_id]
                missing_sample_ids.remove(sample_id)

    multi_individual_samples = {
        sample_id: len(record['individual_ids']) for sample_id, record in records_by_sample_id.items()
        if len(record['individual_ids']) > 1}
    if multi_individual_samples:
        logger.warning('Found {} multi-individual samples from qc output'.format(len(multi_individual_samples)),
                    request.user)
        warnings.append('The following {} samples were added to multiple individuals: {}'.format(
            len(multi_individual_samples), ', '.join(
                sorted(['{} ({})'.format(sample_id, count) for sample_id, count in multi_individual_samples.items()]))))

    if missing_sample_ids:
        logger.warning('Missing {} samples from qc output'.format(len(missing_sample_ids)), request.user)
        warnings.append('The following {} samples were skipped: {}'.format(
            len(missing_sample_ids), ', '.join(sorted(list(missing_sample_ids)))))

    records_with_individuals = [
        record for sample_id, record in records_by_sample_id.items() if sample_id not in missing_sample_ids
    ]

    if dataset_type == Sample.DATASET_TYPE_SV_CALLS:
        _update_individuals_sv_qc(records_with_individuals, request.user)
    else:
        _update_individuals_variant_qc(records_with_individuals, data_type, warnings, request.user)

    message = 'Found and updated matching seqr individuals for {} samples'.format(len(json_records) - len(missing_sample_ids))
    info.append(message)

    return create_json_response({
        'errors': [],
        'warnings': warnings,
        'info': info,
    })


def _parse_raw_qc_records(json_records):
    # Parse SV QC
    if all(field in json_records[0] for field in ['sample', 'lt100_raw_calls', 'lt10_highQS_rare_calls']):
        records_by_sample_id = {
            re.search('(\d+)_(?P<sample_id>.+)_v\d_Exome_GCP', record['sample']).group('sample_id'): record
            for record in json_records}
        return Sample.DATASET_TYPE_SV_CALLS, 'exome', records_by_sample_id

    # Parse regular variant QC
    missing_columns = [field for field in ['seqr_id', 'data_type', 'filter_flags', 'qc_metrics_filters', 'qc_pop']
                       if field not in json_records[0]]
    if missing_columns:
        raise ValueError('The following required columns are missing: {}'.format(', '.join(missing_columns)))

    data_types = {record['data_type'].lower() for record in json_records if record['data_type'].lower() != 'n/a'}
    if len(data_types) == 0:
        raise ValueError('No data type detected')
    elif len(data_types) > 1:
        raise ValueError('Multiple data types detected: {}'.format(' ,'.join(sorted(data_types))))
    elif list(data_types)[0] not in DATA_TYPE_MAP:
        message = 'Unexpected data type detected: "{}" (should be "exome" or "genome")'.format(list(data_types)[0])
        raise ValueError(message)

    data_type = DATA_TYPE_MAP[list(data_types)[0]]
    records_by_sample_id = {record['seqr_id']: record for record in json_records}

    return Sample.DATASET_TYPE_VARIANT_CALLS, data_type, records_by_sample_id


def _update_individuals_variant_qc(json_records, data_type, warnings, user):
    unknown_filter_flags = set()
    unknown_pop_filter_flags = set()

    inidividuals_by_population = defaultdict(list)
    for record in json_records:
        filter_flags = {}
        for flag in json.loads(record['filter_flags']):
            flag = '{}_{}'.format(flag, data_type) if flag == 'coverage' else flag
            flag_col = FILTER_FLAG_COL_MAP.get(flag, flag)
            if flag_col in record:
                filter_flags[flag] = record[flag_col]
            else:
                unknown_filter_flags.add(flag)

        pop_platform_filters = {}
        for flag in json.loads(record['qc_metrics_filters']):
            flag_col = 'sample_qc.{}'.format(flag)
            if flag_col in record:
                pop_platform_filters[flag] = record[flag_col]
            else:
                unknown_pop_filter_flags.add(flag)

        if filter_flags or pop_platform_filters:
            Individual.bulk_update(user, {
                'filter_flags': filter_flags or None, 'pop_platform_filters': pop_platform_filters or None,
            }, id__in=record['individual_ids'])

        inidividuals_by_population[record['qc_pop'].upper()] += record['individual_ids']

    for population, indiv_ids in inidividuals_by_population.items():
        Individual.bulk_update(user, {'population': population}, id__in=indiv_ids)

    if unknown_filter_flags:
        message = 'The following filter flags have no known corresponding value and were not saved: {}'.format(
            ', '.join(unknown_filter_flags))
        logger.warning(message, user)
        warnings.append(message)

    if unknown_pop_filter_flags:
        message = 'The following population platform filters have no known corresponding value and were not saved: {}'.format(
            ', '.join(unknown_pop_filter_flags))
        logger.warning(message, user)
        warnings.append(message)


def _update_individuals_sv_qc(json_records, user):
    inidividuals_by_qc = defaultdict(list)
    for record in json_records:
        inidividuals_by_qc[(record['lt100_raw_calls'], record['lt10_highQS_rare_calls'])] += record['individual_ids']

    for raw_flags, indiv_ids in inidividuals_by_qc.items():
        lt100_raw_calls, lt10_highQS_rare_calls = raw_flags
        sv_flags = []
        if lt100_raw_calls == 'FALSE':
            sv_flags.append('raw_calls:_>100')
        if lt10_highQS_rare_calls == 'FALSE':
            sv_flags.append('high_QS_rare_calls:_>10')
        Individual.bulk_update(user, {'sv_flags': sv_flags or None}, id__in=indiv_ids)


FILTER_FLAG_COL_MAP = {
    'callrate': 'filtered_callrate',
    'contamination': 'PCT_CONTAMINATION',
    'chimera': 'AL_PCT_CHIMERAS',
    'coverage_exome': 'HS_PCT_TARGET_BASES_20X',
    'coverage_genome': 'WGS_MEAN_COVERAGE'
}

DATA_TYPE_MAP = {
    'exome': 'exome',
    'genome': 'genome',
    'wes': 'exome',
    'wgs': 'genome',
}

EXCLUDE_PROJECTS = [
    '[DISABLED_OLD_CMG_Walsh_WES]', 'Old Engle Lab All Samples 352S', 'Old MEEI Engle Samples',
    'kl_temp_manton_orphan-diseases_cmg-samples_exomes_v1', 'Interview Exomes', 'v02_loading_test_project',
]

@data_manager_required
def receive_rna_seq_table(request):
    if len(request.FILES) != 1:
        return create_json_response({'errors': [f'Received {len(request.FILES)} files instead of 1']}, status=400)

    stream = next(iter(request.FILES.values()))
    filename = stream._name
    if not filename.endswith('.tsv.gz'):
        return create_json_response({'errors': [f'Invalid file extension for {filename}: expected ".tsv.gz"']}, status=400)

    # save gzipped data to temporary file
    uploaded_file_id = f'tmp_-_{datetime.now().isoformat()}_-_{request.user}_-_{filename}'
    serialized_file_path = _get_upload_file_path(uploaded_file_id)
    with open(serialized_file_path, 'wb') as f:
        f.write(stream.read())

    return create_json_response({
        'uploadedFileId': uploaded_file_id,
        'info': [f'Loaded gzipped file {filename}'],
    })

RNA_COLUMNS = {'geneID': 'gene_id', 'pValue': 'p_value', 'padjust': 'p_adjust', 'zScore': 'z_score'}

@data_manager_required
def update_rna_seq(request, upload_file_id):
    serialized_file_path = _get_upload_file_path(upload_file_id)

    request_json = json.loads(request.body)
    sample_id_to_individual_id_mapping = {}
    ignore_extra_samples = request_json.get('ignoreExtraSamples')
    try:
        uploaded_mapping_file_id = request_json.get('mappingFile', {}).get('uploadedFileId')
        if uploaded_mapping_file_id:
            sample_id_to_individual_id_mapping = load_mapping_file_content(load_uploaded_file(uploaded_mapping_file_id))
    except ValueError as e:
        return create_json_response({'errors': [str(e)]}, status=400)

    samples_by_id = defaultdict(dict)
    with gzip.open(serialized_file_path, 'rt') as f:
        header =  _parse_tsv_row(next(f))
        header_index_map = {key: i for i, key in enumerate(header)}
        missing_cols = ', '.join([col for col in ['sampleID'] + list(RNA_COLUMNS.keys()) if col not in header_index_map])
        if missing_cols:
            return create_json_response({'errors': [f'Invalid file: missing column(s) {missing_cols}']}, status=400)

        for line in f:
            row = _parse_tsv_row(line)
            sample_id = row[header_index_map['sampleID']]
            row_dict = {mapped_key: row[header_index_map[key]] for key, mapped_key in RNA_COLUMNS.items()}
            gene_id = row_dict['gene_id']
            existing_data = samples_by_id[sample_id].get(gene_id)
            if existing_data and existing_data != row_dict:
                return create_json_response({'errors': [f'Error in {sample_id} data for {gene_id}: mismatched entires {existing_data} and {row_dict}']}, status=400)
            samples_by_id[sample_id][gene_id] = row_dict

    message = f'Parsed {len(samples_by_id)} RNA-seq samples'
    info = [message]
    logger.info(message, request.user)

    try:
        samples, matched_individual_ids, activated_sample_guids, inactivated_sample_guids, updated_family_guids, remaining_sample_ids = match_and_update_samples(
            projects=Project.objects.filter(projectcategory__name=ANALYST_PROJECT_CATEGORY),
            user=request.user,
            sample_ids=samples_by_id.keys(),
            elasticsearch_index=upload_file_id.split('_-_')[-1],
            sample_type=Sample.SAMPLE_TYPE_RNA,
            sample_id_to_individual_id_mapping=sample_id_to_individual_id_mapping,
            raise_unmatched_error_template=None if ignore_extra_samples else 'Unable to find matches for the following samples: {sample_ids}'
        )
    except ValueError as e:
        return create_json_response({'errors': [str(e)]}, status=400)

    # Delete old data
    RnaSeqOutlier.bulk_delete(request.user, sample__guid__in=inactivated_sample_guids)
    to_delete = RnaSeqOutlier.objects.filter(sample__guid__in=inactivated_sample_guids)
    log_model_bulk_update(logger, to_delete, request.user, 'delete')
    to_delete.delete()

    # Create new models
    for sample in samples:
        logger.info(f'Loading outlier data for {sample.sample_id}', request.user)
        models = RnaSeqOutlier.objects.bulk_create([
            RnaSeqOutlier(sample=sample, **data) for data in samples_by_id[sample.sample_id].values()
        ])
        log_model_bulk_update(logger, models, request.user, 'create')

    prefetch_related_objects(samples, 'individual__family__project')
    projects = {sample.individual.family.project.name for sample in samples}
    project_names = ', '.join(sorted(projects))
    message = f'Loaded data for {len(samples)} RNA-seq samples ({len(activated_sample_guids)} new) in the following {len(projects)} projects: {project_names}'
    info.append(message)
    logger.info(message, request.user)

    warnings = []
    if remaining_sample_ids:
        skipped_samples = ', '.join(sorted(remaining_sample_ids))
        warnings.append(f'Skipped loading for the following {len(remaining_sample_ids)} unmatched samples: {skipped_samples}')

    os.remove(serialized_file_path)
    return create_json_response({
        'info': info,
        'warnings': warnings,
    })

def _parse_tsv_row(row):
    return [s.strip().strip('"') for s in row.rstrip('\n').split('\t')]

def _get_upload_file_path(uploaded_file_id):
    upload_directory = get_temp_upload_directory()
    return os.path.join(upload_directory, uploaded_file_id)


# Hop-by-hop HTTP response headers shouldn't be forwarded.
# More info at: http://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html#sec13.5.1
EXCLUDE_HTTP_RESPONSE_HEADERS = {
    'connection', 'keep-alive', 'proxy-authenticate',
    'proxy-authorization', 'te', 'trailers', 'transfer-encoding', 'upgrade',
}

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


@data_manager_required
@csrf_exempt
def proxy_to_kibana(request):
    headers = _convert_django_meta_to_http_headers(request.META)
    headers['Host'] = KIBANA_SERVER
    if KIBANA_ELASTICSEARCH_PASSWORD:
        token = base64.b64encode('kibana:{}'.format(KIBANA_ELASTICSEARCH_PASSWORD).encode('utf-8'))
        headers['Authorization'] = 'Basic {}'.format(token.decode('utf-8'))

    url = "http://{host}{path}".format(host=KIBANA_SERVER, path=request.get_full_path())

    request_method = getattr(requests.Session(), request.method.lower())

    try:
        # use stream=True because kibana returns gziped responses, and this prevents the requests module from
        # automatically unziping them
        response = request_method(url, headers=headers, data=request.body, stream=True, verify=True)
        response_content = response.raw.read()
        # make sure the connection is released back to the connection pool
        # (based on http://docs.python-requests.org/en/master/user/advanced/#body-content-workflow)
        response.close()

        proxy_response = HttpResponse(
            content=response_content,
            status=response.status_code,
            reason=response.reason,
            charset=response.encoding
        )

        for key, value in response.headers.items():
            if key.lower() not in EXCLUDE_HTTP_RESPONSE_HEADERS:
                proxy_response[key.title()] = value

        return proxy_response
    except (ConnectionError, RequestConnectionError) as e:
        logger.error(str(e), request.user)
        return HttpResponse("Error: Unable to connect to Kibana {}".format(e), status=400)


def _convert_django_meta_to_http_headers(request_meta_dict):
    """Converts django request.META dictionary into a dictionary of HTTP headers."""

    def convert_key(key):
        # converting Django's all-caps keys (eg. 'HTTP_RANGE') to regular HTTP header keys (eg. 'Range')
        return key.replace("HTTP_", "").replace('_', '-').title()

    http_headers = {
        convert_key(key): str(value).lstrip()
        for key, value in request_meta_dict.items()
        if key.startswith("HTTP_") or (key in ('CONTENT_LENGTH', 'CONTENT_TYPE') and value)
    }

    return http_headers
