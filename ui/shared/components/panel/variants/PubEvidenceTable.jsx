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

const getFuncStudy = (pub) => {
  const functionalStudy = []
  if (pub.engineeredCells) {
    functionalStudy.push('engineered cells')
  }
  if (pub.patientCellsTissues) {
    functionalStudy.push('patient cells')
  }
  if (pub.animalModel) {
    functionalStudy.push('animal model')
  }
  return functionalStudy.join(', ')
}

// If the item length is greater than 25, show the first 25 characters and the rest in a popup
const overflowStyle = { maxWidth: '800px' }
const fmtPopup = (item) => {
  if (item.length > 25) {
    return (
      <Popup
        style={overflowStyle}
        content={item}
        trigger={
          <span>
            {item.substring(0, 25)}
            ...
          </span>
        }
      />
    )
  }
  return item
}

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
    format: ({ note, validationError }) => (
      <span>
        {note.noteStatus === 'V' && <Popup content="Verified" trigger={<Icon color="green" name="check circle" />} />}
        {note.note && <Popup content={note.note} trigger={<Icon name="sticky note outline" />} />}
        {validationError && <Popup content={`Variant validation error: ${validationError}`} trigger={<Icon color="yellow" name="exclamation triangle" />} />}
      </span>
    ),
  },
  { name: 'individualId', content: 'Individual' },
  { name: 'phenotype', content: 'Phenotype', noFormatExport: true, format: pub => fmtPopup(pub.phenotype) },
  { name: 'hgvsC', content: 'HGVS C' },
  { name: 'hgvsP', content: 'HGVS P' },
  { name: 'gnomadFrequency', content: 'Frequency' },
  { name: 'variantType', content: 'Variant Type' },
  { name: 'zygosity', content: 'Zygosity' },
  { name: 'variantInheritance', content: 'Inheritance', noFormatExport: true, format: pub => fmtPopup(pub.variantInheritance) },
  {
    name: 'citation',
    content: 'Paper',
    noFormatExport: true,
    format: pub => (
      <Popup
        style={overflowStyle}
        content={`${pub.citation}: ${pub.paperTitle}`}
        trigger={
          <a href={pub.link} target="_blank" rel="noopener noreferrer">
            {pub.citation.length > 30 ? `${pub.citation.substring(0, 30)}...` : pub.citation}
          </a>
        }
      />
    ),
  },
  { name: 'studyType', content: 'Type' },
  { name: 'functionalStudy', content: 'Functional Study', noFormatExport: true, format: pub => fmtPopup(getFuncStudy(pub)) },
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
        idField="evidenceId"
        defaultSortColumn="citation"
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
