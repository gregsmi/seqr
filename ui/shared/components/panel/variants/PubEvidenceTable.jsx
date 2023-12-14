import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Grid } from 'semantic-ui-react'
import { EVIDENCE_TABLE_COLUMNS } from 'shared/utils/constants'
import DataTable from '../../table/DataTable'
import EditEvAggButton from './EditEvAggButton'
import { GENE_ID_MAPPING } from './GeneReader'

const getPubsFilterVal = row => Object.values(row).join('-')

const PubEvidenceTable = ({ showPubs, mainGeneId, evAggData }) => {
  if (!showPubs) {
    return null
  }

  return (
    <>
      <Grid.Column width={16}>
        <DataTable
          striped
          idField="hgvsc"
          defaultSortColumn="status"
          data={evAggData[GENE_ID_MAPPING[mainGeneId]]}
          columns={EVIDENCE_TABLE_COLUMNS}
          getRowFilterVal={getPubsFilterVal}
          fixedWidth={false}
        />
      </Grid.Column>
      <Grid.Column width={12}>
        <EditEvAggButton geneId={mainGeneId} />
      </Grid.Column>
    </>
  )
}

PubEvidenceTable.propTypes = {
  showPubs: PropTypes.bool.isRequired,
  evAggData: PropTypes.object.isRequired,
  mainGeneId: PropTypes.string.isRequired,
}

const mapStateToProps = state => ({ evAggData: state.evAggState })

export default connect(mapStateToProps)(PubEvidenceTable)
