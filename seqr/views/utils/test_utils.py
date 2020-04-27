# Utilities used for unit and integration tests.
from django.contrib.auth.models import User

def _check_login(test_case, url):
    """For integration tests of django views that can only be accessed by a logged-in user,
    the 1st step is to authenticate. This function checks that the given url redirects requests
    if the user isn't logged-in, and then authenticates a test user.

    Args:
        test_case (object): the django.TestCase or unittest.TestCase object
        url (string): The url of the django view being tested.
     """
    response = test_case.client.get(url)
    test_case.assertEqual(response.status_code, 302)  # check that it redirects if you don't login

    test_user = User.objects.get(username='test_user')
    test_case.client.force_login(test_user)


def login_non_staff_user(test_case):
    test_user = User.objects.get(username='test_user_non_staff')
    test_case.client.force_login(test_user)


USER_FIELDS = {'dateJoined', 'email', 'firstName', 'isStaff', 'lastLogin', 'lastName', 'username', 'displayName', 'id'}

PROJECT_FIELDS = {
    'projectGuid', 'projectCategoryGuids', 'canEdit', 'name', 'description', 'createdDate', 'lastModifiedDate',
    'lastAccessedDate',  'mmeContactUrl', 'genomeVersion', 'mmePrimaryDataOwner', 'mmeContactInstitution',
    'isMmeEnabled',
}

FAMILY_FIELDS = {
    'projectGuid', 'familyGuid', 'analysedBy', 'pedigreeImage', 'familyId', 'displayName', 'description',
    'analysisNotes', 'analysisSummary', 'analysisStatus', 'pedigreeImage', 'createdDate', 'assignedAnalyst',
    'codedPhenotype', 'postDiscoveryOmimNumber', 'pubmedIds', 'mmeNotes',
}

INTERNAL_FAMILY_FIELDS = {
    'internalAnalysisStatus', 'internalCaseReviewNotes', 'internalCaseReviewSummary', 'individualGuids', 'successStory',
    'successStoryTypes',
}
INTERNAL_FAMILY_FIELDS.update(FAMILY_FIELDS)

INDIVIDUAL_FIELDS = {
    'projectGuid', 'familyGuid', 'individualGuid', 'caseReviewStatusLastModifiedBy', 'individualId',
    'paternalId', 'maternalId', 'sex', 'affected', 'displayName', 'notes', 'createdDate', 'lastModifiedDate',
    'paternalGuid', 'maternalGuid', 'popPlatformFilters', 'filterFlags', 'population', 'birthYear', 'deathYear',
    'onsetAge', 'maternalEthnicity', 'paternalEthnicity', 'consanguinity', 'affectedRelatives', 'expectedInheritance',
    'features', 'absentFeatures', 'nonstandardFeatures', 'absentNonstandardFeatures', 'disorders', 'candidateGenes',
    'rejectedGenes', 'arFertilityMeds', 'arIui', 'arIvf', 'arIcsi', 'arSurrogacy', 'arDonoregg', 'arDonorsperm',
}

INTERNAL_INDIVIDUAL_FIELDS = {
    'caseReviewStatus', 'caseReviewDiscussion', 'caseReviewStatusLastModifiedDate', 'caseReviewStatusLastModifiedBy',
}
INTERNAL_INDIVIDUAL_FIELDS.update(INDIVIDUAL_FIELDS)

SAMPLE_FIELDS = {
    'projectGuid', 'individualGuid', 'sampleGuid', 'createdDate', 'sampleType', 'sampleId', 'isActive',
    'loadedDate', 'datasetType',
}

IGV_SAMPLE_FIELDS = {
    'projectGuid', 'individualGuid', 'sampleGuid', 'filePath',
}

SAVED_VARIANT_FIELDS = {'variantGuid', 'variantId', 'familyGuids', 'xpos', 'ref', 'alt', 'selectedMainTranscriptId'}

TAG_FIELDS = {'tagGuid', 'name', 'category', 'color', 'searchHash', 'lastModifiedDate', 'createdBy', 'variantGuids'}

VARIANT_NOTE_FIELDS = {'noteGuid', 'note', 'submitToClinvar', 'lastModifiedDate', 'createdBy', 'variantGuids'}

FUNCTIONAL_FIELDS = {
    'tagGuid', 'name', 'color', 'metadata', 'metadataTitle', 'lastModifiedDate', 'createdBy', 'variantGuids',
}

SAVED_SEARCH_FIELDS = {'savedSearchGuid', 'name', 'search', 'createdById'}

LOCUS_LIST_FIELDS = {
    'locusListGuid', 'description', 'lastModifiedDate', 'numEntries', 'isPublic', 'createdBy', 'createdDate', 'canEdit',
    'name',
}
LOCUS_LIST_DETAIL_FIELDS = {'items', 'intervalGenomeVersion'}
LOCUS_LIST_DETAIL_FIELDS.update(LOCUS_LIST_FIELDS)

GENE_FIELDS = {
    'chromGrch37', 'chromGrch38', 'codingRegionSizeGrch37', 'codingRegionSizeGrch38',  'endGrch37', 'endGrch38',
    'gencodeGeneType', 'geneId', 'geneSymbol', 'startGrch37', 'startGrch38',
}

GENE_DETAIL_FIELDS = {
    'constraints', 'diseaseDesc', 'functionDesc', 'notes', 'omimPhenotypes', 'mimNumber', 'mgiMarkerId', 'geneNames',
}
GENE_DETAIL_FIELDS.update(GENE_FIELDS)
