from django.urls.base import reverse

from seqr.views.apis.pub_evidence_api import pub_evidence, pub_evidences
from seqr.views.utils.test_utils import AuthenticationTestCase


GENE_ID = 'ENSG00000223972'


class PubEvidenceAPITest(AuthenticationTestCase):
    fixtures = ['users', 'reference_data']

    def test_pub_evidence(self):
        url = reverse(pub_evidence, args=[GENE_ID])
        self.check_require_login(url)

        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

        evs = response.json()['pubEvidenceByGene']
        self.assertEqual(len(evs), 1)
        self.assertTrue(GENE_ID in evs)
        self.assertEqual(len(evs[GENE_ID]), 4)

    def test_all_pub_evidence(self):
        url = reverse(pub_evidences)
        self.check_require_login(url)

        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

        evs = response.json()['pubEvidenceByGene']
        self.assertEqual(len(evs), 4)
        self.assertTrue(GENE_ID in evs)
        self.assertEqual(len(evs[GENE_ID]), 4)

