import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Icon, Popup } from 'semantic-ui-react'
import DataLoader from 'shared/components/DataLoader'
import { loadPubEvidence } from 'pages/Project/reducers'
import { getPubEvidenceArray, getPubEvidenceFeedbackForGene, getPubEvidenceLoading } from 'pages/Project/selectors'
import DataTable from '../../table/DataTable'
import PubEvidenceUpdateButton from './PubEvidenceUpdateButton'

const getPubsFilterVal = row => Object.values(row).join('-')

export const EVIDENCE_TABLE_COLUMNS = [
  {
    name: 'status',
    format: pub => (pub.note.noteStatus === 'V' &&
      <Popup content="Verified" trigger={<Icon color="green" name="check circle" />} />
    ),
  },
  { name: 'updateNote', format: pub => (<PubEvidenceUpdateButton note={pub.note} />) },
  {
    name: 'hasNote',
    format: pub => (pub.note.note &&
      <Popup content={pub.note.note} trigger={<Icon name="sticky note outline" />} />
    ),
  },
  { name: 'paperId', content: 'Paper ID' },
  { name: 'hgvsC', content: 'HGVS C' },
  { name: 'hgvsP', content: 'HGVS P' },
  { name: 'phenotype', content: 'Phenotype' },
  { name: 'zygosity', content: 'Zygosity' },
  { name: 'variantInheritance', content: 'Inheritance' },
  { name: 'studyType', content: 'Study Type' },
  { name: 'variantType', content: 'Variant Type' },
  {
    name: 'paperTitle',
    content: 'Paper',
    format: pub => (
      <a href={pub.link} target="_blank" rel="noopener noreferrer">{pub.paperTitle}</a>
    ),
    noFormatExport: true,
  },
]

// eslint-disable-next-line no-unused-vars
const PubEvidenceTable = ({ showPubs, mainGeneId, loading, load, pubEvidence, pubEvidenceFeedback }) => {
  if (!showPubs) {
    return null
  }

  return (
    <DataLoader content load={load} loading={false}>
      <DataTable
        striped
        singleLine
        compact="very"
        collapsing
        loading={loading}
        idField="hgvsC"
        defaultSortColumn="paperId"
        data={pubEvidence}
        columns={EVIDENCE_TABLE_COLUMNS}
        getRowFilterVal={getPubsFilterVal}
      />
    </DataLoader>
  )
}

PubEvidenceTable.propTypes = {
  showPubs: PropTypes.bool.isRequired,
  mainGeneId: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
  load: PropTypes.func.isRequired,
  pubEvidence: PropTypes.arrayOf(PropTypes.object).isRequired,
  pubEvidenceFeedback: PropTypes.arrayOf(PropTypes.object).isRequired,
}

const mapStateToProps = (state, ownProps) => ({
  loading: getPubEvidenceLoading(state, ownProps.mainGeneId),
  pubEvidence: getPubEvidenceArray(state, ownProps.mainGeneId),
  pubEvidenceFeedback: getPubEvidenceFeedbackForGene(state, ownProps.mainGeneId),
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  load: () => dispatch(loadPubEvidence(ownProps.mainGeneId)),
})

export default connect(mapStateToProps, mapDispatchToProps)(PubEvidenceTable)
