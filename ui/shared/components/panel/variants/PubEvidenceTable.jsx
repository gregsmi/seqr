import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Grid, Icon, Popup, Segment } from 'semantic-ui-react'
import DataLoader from 'shared/components/DataLoader'
import { loadPubEvidence } from 'pages/Project/reducers'
import { getPubEvidenceArray, getPubEvidenceFeedbackForGene, getPubEvidenceLoading } from 'pages/Project/selectors'
import DataTable from '../../table/DataTable'
import PubEvidenceUpdateButton from './PubEvidenceUpdateButton'

const getPubsFilterVal = row => Object.values(row).join('-')

const getHeader = publication => (
  <Segment>
    <Grid columns={2}>
      <Grid.Row>
        <Grid.Column>
          <p>
            <b>Paper ID:&nbsp;</b>
            {publication.paperId}
          </p>
          <p>
            <b>HGVS C:&nbsp;</b>
            {publication.hgvsC}
          </p>
          <p>
            <b>HGVS P:&nbsp;</b>
            {publication.hgvsP}
          </p>
          <p>
            <b>Study Type:&nbsp;</b>
            {publication.studyType}
          </p>
        </Grid.Column>
        <Grid.Column>
          <p>
            <b>Phenotype:&nbsp;</b>
            {publication.phenotype}
          </p>
          <p>
            <b>Zygosity:&nbsp;</b>
            {publication.zygosity}
          </p>
          <p>
            <b>Inheritance:&nbsp;</b>
            {publication.variantInheritance}
          </p>
          <p>
            <b>Variant Type:&nbsp;</b>
            {publication.variantType}
          </p>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  </Segment>
)

export const EVIDENCE_TABLE_COLUMNS = [
  {
    name: 'status',
    format: pub => (pub.note.noteStatus === 'V' &&
      <Popup content="Verified" trigger={<Icon color="green" name="check circle" />} />
    ),
  },
  {
    name: 'updateNote',
    format: pub => (<PubEvidenceUpdateButton header={getHeader(pub)} note={pub.note} />),
  },
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
const PubEvidenceTable = ({ showPubs, loading, load, pubEvidence, pubEvidenceFeedback }) => {
  if (!showPubs) {
    return null
  }

  return (
    <DataLoader content load={load} loading={false}>
      <DataTable
        striped
        singleLine
        horizontalScroll
        compact="very"
        collapsing
        loading={loading}
        idField="hgvsC"
        defaultSortColumn="paperId"
        emptyContent="No publications found"
        data={pubEvidence}
        columns={EVIDENCE_TABLE_COLUMNS}
        getRowFilterVal={getPubsFilterVal}
      />
    </DataLoader>
  )
}

PubEvidenceTable.propTypes = {
  showPubs: PropTypes.bool.isRequired,
  mainGeneId: PropTypes.string.isRequired, // eslint-disable-line react/no-unused-prop-types
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
