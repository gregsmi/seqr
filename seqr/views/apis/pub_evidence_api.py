from django.db.models import Count

from reference_data.models import PubEvidence
from seqr.views.utils.json_utils import create_json_response
#from seqr.views.utils.note_utils import create_note_handler, update_note_handler, delete_note_handler
from seqr.views.utils.orm_to_json_utils import get_json_for_pub_evidence
from seqr.views.utils.permissions_utils import login_and_policies_required


def get_pub_evidence(gene_id):
    return PubEvidence.objects.filter(gene__gene_id=gene_id)


@login_and_policies_required
def pub_evidence(request):
    gene_ids = PubEvidence.objects.values_list('gene__gene_id', flat=True).distinct()
    pub_evidence = { gene_id: get_json_for_pub_evidence(get_pub_evidence(gene_id), user=request.user) for gene_id in gene_ids }
    return create_json_response({'pubEvidenceByGene': pub_evidence})


@login_and_policies_required
def pub_evidence_for_gene(request, gene_id):
    evidences = get_pub_evidence(gene_id)
    pub_evidence = {gene_id: get_json_for_pub_evidence(evidences, user=request.user)}
    return create_json_response({'pubEvidenceByGene': pub_evidence})


@login_and_policies_required
def create_pub_evidence_note_handler(request, gene_id):
    return { 'error': 'Not implemented'}


@login_and_policies_required
def update_pub_evidence_note_handler(request, gene_id, note_guid):
    return { 'error': 'Not implemented'}


@login_and_policies_required
def delete_pub_evidence_note_handler(request, gene_id, note_guid):
    return { 'error': 'Not implemented'}
