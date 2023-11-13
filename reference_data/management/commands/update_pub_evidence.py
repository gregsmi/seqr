import logging
import os
import tempfile

from reference_data.management.commands.utils.update_utils import GeneCommand, ReferenceDataHandler
from reference_data.models import PubEvidence
from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient

logger = logging.getLogger(__name__)


class PubEvReferenceDataHandler(ReferenceDataHandler):

    model_cls = PubEvidence
    url = "https://msseqr01sa.blob.core.windows.net/reference/evagg/truth_set_small_10-10-23.tsv"
    account_url = "https://msseqr01sa.blob.core.windows.net"
    container_name = "reference"
    blob_name = "evagg/truth_set_small_10-10-23.tsv"

    def download_from_url(self):
        local_file_path = os.path.join(tempfile.gettempdir(), os.path.basename(self.url))

        # Download from Azure blob storage to local file using DefaultAzureCredential
        blob_service_client = BlobServiceClient(account_url=self.account_url, credential=DefaultAzureCredential())
        container_client = blob_service_client.get_container_client(self.container_name)
        blob_client = container_client.get_blob_client(self.blob_name)

        with open(local_file_path, "wb") as f:
            download_stream = blob_client.download_blob()
            f.write(download_stream.readall())

        return local_file_path

    @staticmethod
    def parse_record(record):
        yield record


class Command(GeneCommand):
    reference_data_handler = PubEvReferenceDataHandler
