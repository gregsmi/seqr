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
BLOB_NAME = "evagg/truth_set_test.csv"


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
    def parse_record(record):
        yield record


class Command(GeneCommand):
    reference_data_handler = PubEvReferenceDataHandler
