import json
from django.urls.base import reverse
import mock

from seqr.views.apis.pub_evidence_api import pub_evidence_for_gene, \
    create_pub_evidence_note, update_pub_evidence_note, delete_pub_evidence_note
from seqr.views.utils.test_utils import AuthenticationTestCase


GENE_ID = 'ENSG00000223972'
EVIDENCE_ID = '10.1002/ana.21207_TWNK_c.1370C>T'.replace('/', '-').replace('>', '-')
PUB_EV_NOTE_FIELDS = {'noteGuid', 'note', 'geneId', 'lastModifiedDate', 'createdBy', 'evidenceId', 'noteType', 'noteStatus'}


class PubEvidenceAPITest(AuthenticationTestCase):
    fixtures = ['users', 'reference_data']

    def test_pub_evidence_for_gene(self):
        url = reverse(pub_evidence_for_gene, args=[GENE_ID])
        self.check_require_login(url)

        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

        evs = response.json()['pubEvidenceByGene']
        self.assertEqual(len(evs), 1)
        self.assertTrue(GENE_ID in evs)
        self.assertEqual(len(evs[GENE_ID]), 4)

    def test_create_update_and_delete_pub_ev_note(self):
        for type, note in [
            ('feedback note', {'noteType': 'F', 'geneId': GENE_ID, 'note': 'new feedback note'}),
            ('pub_ev note', {'noteType': 'N', 'geneId': GENE_ID, 'evidenceId': EVIDENCE_ID, 'noteStatus': 'V'})
        ]:
            with self.subTest(type):
                create_note_url = reverse(create_pub_evidence_note)
                self.check_require_login(create_note_url)

                response = self.client.post(create_note_url, content_type='application/json', data=json.dumps({}))
                self.assertEqual(response.status_code, 400)
                self.assertDictEqual(response.json(), {'error': 'Missing required field(s): geneId, noteType'})

                response = self.client.post(create_note_url, content_type='application/json', data=json.dumps(note))
                self.assertEqual(response.status_code, 200)
                response_json = response.json()

                self.assertSetEqual(set(response_json.keys()), {'pubEvidenceNotesByGuid'})
                self.assertEqual(len(response_json['pubEvidenceNotesByGuid']), 1)
                new_note_guid = list(response_json['pubEvidenceNotesByGuid'].keys())[0]
                new_note_response = list(response_json['pubEvidenceNotesByGuid'].values())[0]
                self.assertSetEqual(set(new_note_response.keys()), PUB_EV_NOTE_FIELDS)
                self.assertEqual(new_note_response['noteGuid'], new_note_guid)
                self.assertEqual(new_note_response['noteType'], note['noteType'])
                self.assertEqual(new_note_response['geneId'], note['geneId'])
                self.assertEqual(new_note_response['evidenceId'], note.get('evidenceId', ''))
                self.assertEqual(new_note_response['noteStatus'], note.get('noteStatus', 'N'))
                self.assertEqual(new_note_response['note'], note.get('note', ''))
                self.assertEqual(new_note_response['createdBy'], 'Test No Access User')

                # update the note
                update_note_url = reverse(update_pub_evidence_note, args=[new_note_guid])
                response = self.client.post(update_note_url, content_type='application/json',  data=json.dumps(
                    {'note': 'updated note'}))

                self.assertEqual(response.status_code, 200)
                response_json = response.json()
                self.assertDictEqual(response_json, {'pubEvidenceNotesByGuid': {new_note_guid: mock.ANY}})
                updated_note_response = response_json['pubEvidenceNotesByGuid'][new_note_guid]
                self.assertEqual(updated_note_response['note'], 'updated note')

                # delete the note
                delete_note_url = reverse(delete_pub_evidence_note, args=[new_note_guid])
                response = self.client.post(delete_note_url, content_type='application/json')
                self.assertEqual(response.status_code, 200)
                self.assertDictEqual(response.json(), {'pubEvidenceNotesByGuid': {new_note_guid: None}})

                self.client.logout()