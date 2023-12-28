import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Grid, Icon } from 'semantic-ui-react'
import DataLoader from 'shared/components/DataLoader'
import { loadPubEvidence } from 'pages/Project/reducers'
import { getPubEvidenceArray, getPubEvidenceNotesForGene, getPubEvidenceTableLoading } from 'pages/Project/selectors'
import DataTable from '../../table/DataTable'
import EditEvAggButton from './EditEvAggButton'
import PubEvidenceUpdateButton from './PubEvidenceUpdateButton'

const getPubsFilterVal = row => Object.values(row).join('-')

export const EVIDENCE_TABLE_COLUMNS = [
  { name: 'updateNote', content: '', format: pub => (<PubEvidenceUpdateButton note={pub.note} />) },
  {
    name: 'status',
    content: 'Verified',
    format: pub => (pub.note.noteStatus === 'V' && <Icon color="green" name="check circle" />),
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
  // { name: 'status', content: 'Status' },
  // {
  //   name: 'status',
  //   content: 'Status',
  //   format: (status) => {
  //     const statusStr = status.status.toString()
  //     console.log(statusStr)
  //     let color
  //     switch (statusStr) {
  //       case 'AI Generated':
  //         color = 'purple'
  //         console.log(color)
  //         break
  //       case 'Verified':
  //         color = 'green'
  //         console.log(color)
  //         break
  //       default:
  //         color = 'black'
  //         console.log(color)
  //     }
  //     return <span style={color}>{status}</span>
  //   },
  // },
  // { name: 'notes', content: 'Notes' },
]

// eslint-disable-next-line no-unused-vars
const PubEvidenceTable = ({ showPubs, mainGeneId, loading, load, pubEvidence, pubEvidenceNotes }) => {
  if (!showPubs) {
    return null
  }

  return (
    <DataLoader content load={load} loading={false}>
      <Grid.Column width={16}>
        <DataTable
          striped
          singleLine
          loading={loading}
          idField="hgvsc"
          defaultSortColumn="status"
          data={pubEvidence}
          columns={EVIDENCE_TABLE_COLUMNS}
          getRowFilterVal={getPubsFilterVal}
        />
      </Grid.Column>
      <Grid.Column width={12}>
        <EditEvAggButton geneId={mainGeneId} />
      </Grid.Column>
    </DataLoader>
  )
}

PubEvidenceTable.propTypes = {
  showPubs: PropTypes.bool.isRequired,
  mainGeneId: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
  load: PropTypes.func.isRequired,
  pubEvidence: PropTypes.arrayOf(PropTypes.object).isRequired,
  pubEvidenceNotes: PropTypes.arrayOf(PropTypes.object).isRequired,
}

const mapStateToProps = (state, ownProps) => ({
  loading: getPubEvidenceTableLoading(state),
  pubEvidence: getPubEvidenceArray(state, ownProps.mainGeneId),
  pubEvidenceNotes: getPubEvidenceNotesForGene(state, ownProps.mainGeneId),
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  load: () => dispatch(loadPubEvidence(ownProps.mainGeneId)),
})

export default connect(mapStateToProps, mapDispatchToProps)(PubEvidenceTable)
