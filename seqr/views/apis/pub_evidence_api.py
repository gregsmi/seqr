from django.db.models import Count

from reference_data.models import PubEvidence
from seqr.models import PubEvidenceNote
from seqr.views.utils.json_utils import create_json_response
from seqr.views.utils.note_utils import create_note_handler, update_note_handler, delete_note_handler
from seqr.views.utils.orm_to_json_utils import get_json_for_pub_evidence, get_json_for_pub_ev_note
from seqr.views.utils.permissions_utils import login_and_policies_required


@login_and_policies_required
def pub_evidence_all_gene_ids(request):
    ids = PubEvidence.objects.values('gene__gene_id').annotate(count=Count('gene__gene_id'))
    # Return a mapping of gene IDs to the number of PubEvidence records for each gene.
    return create_json_response({'pubEvidenceGeneIds': {gene['gene__gene_id']: gene['count'] for gene in ids}})


@login_and_policies_required
def pub_evidence_for_gene(request, gene_id):
    evidence = {gene_id: get_json_for_pub_evidence(PubEvidence.objects.filter(gene__gene_id=gene_id), request.user)}
    gene_notes = PubEvidenceNote.objects.filter(gene_id=gene_id)
    notes = { note.guid: get_json_for_pub_ev_note(note, request.user) for note in gene_notes }
    return create_json_response({'pubEvidenceByGene': evidence, 'pubEvidenceNotesByGuid': notes})


@login_and_policies_required
def create_pub_evidence_note(request):
    return create_note_handler(
        request, PubEvidenceNote,
        get_response_json=lambda note: _get_pub_evidence_note_by_guid(note.guid, note, request.user),
        required_fields=['geneId', 'noteType'], optional_fields=['evidenceId', 'note', 'noteStatus'],
    )


@login_and_policies_required
def update_pub_evidence_note(request, note_guid):
    return update_note_handler(
        request, PubEvidenceNote, note_guid,
        get_response_json=lambda note: _get_pub_evidence_note_by_guid(note.guid, note, request.user),
    )


@login_and_policies_required
def delete_pub_evidence_note(request, note_guid):
    return delete_note_handler(
        request, PubEvidenceNote, note_guid,
        get_response_json=lambda: _get_pub_evidence_note_by_guid(note_guid, None, request.user)
    )


def _get_pub_evidence_note_by_guid(note_guid, note, user):
    note_body = None if note is None else get_json_for_pub_ev_note(note, user)
    return {'pubEvidenceNotesByGuid': {note_guid: note_body}}
