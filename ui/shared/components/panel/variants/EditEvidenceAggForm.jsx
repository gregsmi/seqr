import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

// import DataLoader from 'shared/components/DataLoader'
import EditRecordsFormEvAgg from 'shared/components/form/EditRecordsFormEvAgg'
import { ID_ID } from 'shared/utils/constants'
import { EVIDENCE_TABLE_FIELDS } from 'pages/Project/constants'
import { updateEvAgg } from 'pages/Project/reducers'
import { GENE_ID_MAPPING } from './GeneReader'

const EditEvAggForm = React.memo(props => (
  <EditRecordsFormEvAgg
    modalName={props.modalName}
    idField={ID_ID}
    entityKey={GENE_ID_MAPPING[props.geneId]}
    defaultSortColumn="status"
    // filterColumn="hgvsp"
    columns={EVIDENCE_TABLE_FIELDS}
    {...props}
  />
))

// component
EditEvAggForm.propTypes = {
  records: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  modalName: PropTypes.string,
  geneId: PropTypes.string.isRequired,
}

// This enables access to the state from the Redux store.
// The "state" is passed in as a parameter, and the function
// returns an object that gets passed as props to the connected component.
// Here, it’s returning an object with a single property
// "records", which is set to the result of calling getEvAggByGuid(state).
// Thus, within the EditEvAggForm component, we can access this.props.records.
// Further, it will have the data returned by getEvAggByGuid(state).
const mapStateToProps = (state, ownProps) => {
  const { geneId } = ownProps
  console.log('state before reducer: ', JSON.stringify(state.evAggState))
  const preRecords = state.evAggState[GENE_ID_MAPPING[geneId]]
  // eslint-disable-next-line no-console
  // console.log('map state preRecords: ', JSON.stringify(preRecords))
  const records = preRecords.reduce((res, item) => ({ ...res, [item.id]: item }), {})
  // eslint-disable-next-line no-console
  // console.log('getEvidenceForTable: ', JSON.stringify(records))
  // if ('evAggState' in state === false || !state.evAggState) {
  //   console.log('in props: evaggstate is empty')
  //   return ({ records })
  // }
  return ({ records })
}

// This enables dispatching (calling the store's dispatch function and passing
// it an action object) actions to the store.
// The mapDispatchToProps function returns an object that gets passed as "props" to the connected component.
// It is returning an object with a single property "onSubmit" that is set
// to the action creator function "updateEvAgg".
// This means that within the "EditEvAggForm" component, we can call
// "this.props.onSubmit()" to dispatch the "updateEvAgg" action.
const mapDispatchToProps = {
  // onSubmit: (values) => {
  //   console.log('before dispatch: ')
  //   dispatch({ type: 'UPDATE_DATA_EVAGG', updates: values })
  // },
  // onSubmit: (values) => {
  //   console.log('evAgg form values', JSON.stringify(values))
  //   updateEvAgg(values)
  // },
  onSubmit: updateEvAgg,
}

export default connect(mapStateToProps, mapDispatchToProps)(EditEvAggForm)
