import logging
import os
import tempfile

from reference_data.management.commands.utils.update_utils import GeneCommand, ReferenceDataHandler
from reference_data.models import PubEvidence
from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient

from settings import AZURE_REF_STORAGE_ACCOUNT

logger = logging.getLogger(__name__)


ACCOUNT_URL = f"https://{AZURE_REF_STORAGE_ACCOUNT}.blob.core.windows.net"
CONTAINER_NAME = "reference"
BLOB_NAME = "evagg/pub_evidence_latest.tsv"


class PubEvReferenceDataHandler(ReferenceDataHandler):

    model_cls = PubEvidence
    url = f"{ACCOUNT_URL}/{CONTAINER_NAME}/{BLOB_NAME}"

    def download_from_url(self):
        local_file_path = os.path.join(tempfile.gettempdir(), os.path.basename(self.url))

        # Download from Azure blob storage to local file using DefaultAzureCredential
        blob_service_client = BlobServiceClient(account_url=ACCOUNT_URL, credential=DefaultAzureCredential())
        container_client = blob_service_client.get_container_client(CONTAINER_NAME)
        blob_client = container_client.get_blob_client(BLOB_NAME)

        with open(local_file_path, "wb") as f:
            download_stream = blob_client.download_blob()
            f.write(download_stream.readall())

        return local_file_path

    @staticmethod
    def get_file_header(f):
        while True:
            # Skip '#'-prefixed header lines to get to the column names.
            line = next(f).rstrip('\n\r').split('\t')
            if not line[0].startswith('#'):
                break
            logger.info(f'PubEvidence header: {line}')
        return line

    def get_gene_for_record(self, record):
        gene_symbol = record.pop('gene', None)
        if not (gene := self.gene_reference['gene_symbols_to_gene'].get(gene_symbol)):
            raise ValueError('Gene "{}" not found in the GeneInfo table'.format(gene_symbol))
        return gene

    @staticmethod
    def parse_record(record):
        record['engineered_cells'] = True if record['engineered_cells'] == 'True' else False
        record['patient_cells_tissues'] = True if record['patient_cells_tissues'] == 'True' else False
        record['animal_model'] = True if record['animal_model'] == 'True' else False
        if record['individual_id'] == 'unknown':
            record['individual_id'] = ''
        if record['variant_inheritance'] == 'unknown':
            record['variant_inheritance'] = ''
        if record['zygosity'] == 'unknown' or record['zygosity'] == 'none':
            record['zygosity'] = ''
        if record['hgvs_c'] == 'NA':
            record['hgvs_c'] = ''
        if record['hgvs_p'] == 'NA':
            record['hgvs_p'] = ''
        if record['study_type'] == 'other':
            record['study_type'] = ''
        yield record


class Command(GeneCommand):
    reference_data_handler = PubEvReferenceDataHandler
