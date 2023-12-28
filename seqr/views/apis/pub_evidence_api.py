from django.db.models import Count

from reference_data.models import PubEvidence
from seqr.models import PubEvidenceNote
from seqr.views.utils.json_utils import create_json_response
from seqr.views.utils.note_utils import create_note_handler, update_note_handler, delete_note_handler
from seqr.views.utils.orm_to_json_utils import get_json_for_pub_evidence, get_json_for_pub_ev_note
from seqr.views.utils.permissions_utils import login_and_policies_required


def _get_pub_evidence(gene_id):
    return PubEvidence.objects.filter(gene__gene_id=gene_id)


def _get_pub_evidence_note_by_guid(note, user):
    return {'pubEvidenceNotesByGuid': {note.guid: get_json_for_pub_ev_note(note, user)}}


@login_and_policies_required
def pub_evidence(request):
    gene_ids = PubEvidence.objects.values_list('gene__gene_id', flat=True).distinct()
    pub_evidence = { gene_id: get_json_for_pub_evidence(_get_pub_evidence(gene_id), request.user) for gene_id in gene_ids }
    return create_json_response({'pubEvidenceByGene': pub_evidence})


@login_and_policies_required
def pub_evidence_for_gene(request, gene_id):
    evidences = _get_pub_evidence(gene_id)
    pub_evidence = {gene_id: get_json_for_pub_evidence(evidences, request.user)}
    return create_json_response({'pubEvidenceByGene': pub_evidence})


@login_and_policies_required
def pub_evidence_notes_for_gene(request, gene_id):
    notes = PubEvidenceNote.objects.filter(gene_id=gene_id)
    notes_by_gene = {gene_id: get_json_for_pub_ev_note(note, request.user) for note in notes}
    return create_json_response({'pubEvidenceNotesByGene': notes_by_gene})


@login_and_policies_required
def create_pub_evidence_gene_note(request, gene_id):
    return create_note_handler(
        request, PubEvidenceNote,
        get_response_json=lambda note: _get_pub_evidence_note_by_guid(note, request.user),
        required_fields=['noteType', 'note'], optional_fields=['pubEvId'],
        gene_id=gene_id,
    )


@login_and_policies_required
def create_pub_evidence_note(request):
    return create_note_handler(
        request, PubEvidenceNote,
        get_response_json=lambda note: _get_pub_evidence_note_by_guid(note, request.user),
        required_fields=['noteType', 'pubEvId'], optional_fields=['note'],
    )


@login_and_policies_required
def update_pub_evidence_note(request, note_guid):
    return update_note_handler(
        request, PubEvidenceNote, note_guid,
        get_response_json=lambda note: _get_pub_evidence_note_by_guid(note, request.user),
    )


@login_and_policies_required
def delete_pub_evidence_note(request, note_guid):
    return delete_note_handler(
        request, PubEvidenceNote, note_guid,
        get_response_json=lambda: {'pubEvidenceNotesByGuid': {note_guid: None}},
    )
