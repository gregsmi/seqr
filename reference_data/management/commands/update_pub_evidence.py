import logging

from reference_data.management.commands.utils.update_utils import GeneCommand, ReferenceDataHandler
from reference_data.models import PubEvidence

logger = logging.getLogger(__name__)


class PubEvReferenceDataHandler(ReferenceDataHandler):

    model_cls = PubEvidence
    url = 'https://not-there-yet'

    @staticmethod
    def parse_record(record):
        yield record


class Command(GeneCommand):
    reference_data_handler = PubEvReferenceDataHandler
