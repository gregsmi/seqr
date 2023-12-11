from django.urls.base import reverse

from seqr.views.apis.pub_evidence_api import pub_evidence
from seqr.views.utils.test_utils import AuthenticationTestCase


GENE_ID = 'ENSG00000223972'


class PubEvidenceAPITest(AuthenticationTestCase):
    fixtures = ['users', 'reference_data']

    def test_pub_evidence(self):
        url = reverse(pub_evidence, args=[GENE_ID])
        self.check_require_login(url)

        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

        evs = response.json()['pubEvById']
        self.assertEqual(len(evs), 3)
