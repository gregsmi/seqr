import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

// import DataLoader from 'shared/components/DataLoader'
import EditRecordsForm from 'shared/components/form/EditRecordsForm'
import { NOTES_ID, STATUS_ID } from 'shared/utils/constants'
import { EVIDENCE_TABLE_FIELDS } from '../../constants'
// import { updateEvAgg } from '../../reducers'
import { getEvAgg } from '../../selectors' // getting data for this table

const EditEvAggForm = React.memo(props => (
  <EditRecordsForm
    modalName={props.modalName}
    idField="hgvsc"
    entityKey="hgvsp"
    defaultSortColumn={STATUS_ID}
    filterColumn={NOTES_ID}
    columns={EVIDENCE_TABLE_FIELDS}
    {...props}
  />
))

// component
EditEvAggForm.propTypes = {
  records: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  modalName: PropTypes.string,
}

// This enables access to the state from the Redux store.
// The "state" is passed in as a parameter, and the function
// returns an object that gets passed as props to the connected component.
// Here, it’s returning an object with a single property
// "records", which is set to the result of calling getEvAggByGuid(state).
// Thus, within the EditEvAggForm component, we can access this.props.records.
// Further, it will have the data returned by getEvAggByGuid(state).
const mapStateToProps = state => ({
  records: getEvAgg(state),
})

// This enables dispatching (calling the store's dispatch function and passing
// it an action object) actions to the store.
// The mapDispatchToProps function returns an object that gets passed as "props" to the connected component.
// It is returning an object with a single property "onSubmit" that is set
// to the action creator function "updateEvAgg".
// This means that within the "EditEvAggForm" component, we can call
// "this.props.onSubmit()" to dispatch the "updateEvAgg" action.
const mapDispatchToProps = {
  onSubmit: (values) => {
    console.log('evAgg form values', JSON.stringify(values))
  },
}

export default connect(mapStateToProps, mapDispatchToProps)(EditEvAggForm)
