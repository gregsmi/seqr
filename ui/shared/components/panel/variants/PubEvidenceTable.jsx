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

const getPubEvDisplay = publication => (
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
    name: 'updateNote',
    format: pub => (
      <span>
        <PubEvidenceUpdateButton header={getPubEvDisplay(pub)} note={pub.feedback} />
        <PubEvidenceUpdateButton header={getPubEvDisplay(pub)} note={pub.note} />
      </span>
    ),
  },
  {
    name: 'status',
    format: ({ note }) => (
      <span>
        {note.noteStatus === 'V' && <Popup content="Verified" trigger={<Icon color="green" name="check circle" />} />}
        {note.note && <Popup content={note.note} trigger={<Icon name="sticky note outline" />} />}
      </span>
    ),
  },
  {
    name: 'paperId',
    content: 'Paper ID',
    noFormatExport: true,
    format: pub => (
      <Popup
        content={pub.citation}
        trigger={<a href={pub.link} target="_blank" rel="noopener noreferrer">{pub.paperId}</a>}
      />
    ),
  },
  // {
  //   name: 'citation',
  //   content: 'Paper',
  //   noFormatExport: true,
  //   format: pub => (<a href={pub.link} target="_blank" rel="noopener noreferrer">{pub.citation}</a>),
  // },
  { name: 'hgvsC', content: 'HGVS C' },
  { name: 'hgvsP', content: 'HGVS P' },
  { name: 'individualId', content: 'Individual' },
  {
    name: 'phenotype',
    content: 'Phenotype',
    noFormatExport: true,
    format: pub => (
      <Popup
        content={pub.phenotype}
        trigger={<span>{pub.phenotype.length > 30 ? `${pub.phenotype.substring(0, 30)}...` : pub.phenotype}</span>}
      />
    ),
  },
  { name: 'zygosity', content: 'Zygosity' },
  { name: 'variantInheritance', content: 'Inheritance' },
  { name: 'variantType', content: 'Variant Type' },
  { name: 'studyType', content: 'Study Type' },
  {
    name: 'paperTitle',
    content: 'Title',
    noFormatExport: true,
    format: pub => (
      <Popup
        content={pub.paperTitle}
        trigger={<span>{pub.paperTitle.length > 40 ? `${pub.paperTitle.substring(0, 40)}...` : pub.paperTitle}</span>}
      />
    ),
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
