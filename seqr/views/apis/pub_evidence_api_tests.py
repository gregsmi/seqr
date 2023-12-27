import json
from django.urls.base import reverse
import mock

from seqr.views.apis.pub_evidence_api import pub_evidence, pub_evidence_for_gene, create_pub_evidence_gene_note, \
    create_pub_evidence_note, update_pub_evidence_note, delete_pub_evidence_note
from seqr.views.utils.test_utils import AuthenticationTestCase


GENE_ID = 'ENSG00000223972'
PUB_EV_ID = '10.1002/ana.21207_TWNK_c.1370C>T'.replace('/', '-').replace('>', '-')
PUB_EV_NOTE_FIELDS = {'noteGuid', 'note', 'geneId', 'lastModifiedDate', 'createdBy', 'pubEvId', 'noteType', 'noteStatus'}


class PubEvidenceAPITest(AuthenticationTestCase):
    fixtures = ['users', 'reference_data']

    def test_pub_evidence(self):
        url = reverse(pub_evidence)
        self.check_require_login(url)

        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

        evs = response.json()['pubEvidenceByGene']
        self.assertEqual(len(evs), 4)
        self.assertTrue(GENE_ID in evs)
        self.assertEqual(len(evs[GENE_ID]), 4)

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
        for create_note_url in [
            reverse(create_pub_evidence_gene_note, args=[GENE_ID]),
            reverse(create_pub_evidence_note),
        ]:
            with self.subTest(create_note_url):
                # create the note
                self.check_require_login(create_note_url)
                response = self.client.post(create_note_url, content_type='application/json', data=json.dumps({}))

                self.assertEqual(response.status_code, 400)
                self.assertDictEqual(response.json(), {'error': 'Missing required field(s): note, pubEvId, noteType'})

                response = self.client.post(create_note_url, content_type='application/json', data=json.dumps(
                    {'note': 'new pubEv note', 'noteType': 'F', 'pubEvId': PUB_EV_ID}
                ))
                self.assertEqual(response.status_code, 200)
                response_json = response.json()
                self.assertSetEqual(set(response_json.keys()), {'pubEvidenceNotesByGuid'})
                self.assertEqual(len(response_json['pubEvidenceNotesByGuid']), 1)
                new_note_guid = list(response_json['pubEvidenceNotesByGuid'].keys())[0]
                new_note_response = list(response_json['pubEvidenceNotesByGuid'].values())[0]
                self.assertSetEqual(set(new_note_response.keys()), PUB_EV_NOTE_FIELDS)
                self.assertEqual(new_note_response['pubEvId'], PUB_EV_ID)
                self.assertEqual(new_note_response['noteGuid'], new_note_guid)
                self.assertEqual(new_note_response['note'], 'new pubEv note')
                self.assertEqual(new_note_response['noteType'], 'F')
                self.assertEqual(new_note_response['noteStatus'], 'N')
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