import React from 'react'
import PropTypes from 'prop-types'
import { Tab } from 'semantic-ui-react'
import styled from 'styled-components'
import Modal from 'shared/components/modal/Modal'
import { ButtonLink } from 'shared/components/StyledComponents'
import { EditFamiliesBulkForm, EditIndividualsBulkForm, EditIndividualMetadataBulkForm } from 'pages/Project/components/edit-families-and-individuals/BulkEditForm'
import EditIndividualsForm from 'pages/Project/components/edit-families-and-individuals/EditIndividualsForm'
import EditFamiliesForm from 'pages/Project/components/edit-families-and-individuals/EditFamiliesForm'
// commented out evidence agg.
import EditEvidenceAggForm from './EditEvidenceAggForm'

const TabPane = styled(Tab.Pane)`
  padding: 1em 0 !important;
`

const MODAL_NAME = 'editEvidenceAggregation'
const PANE_DETAILS = [
  // {
  //   menuItem: 'Edit Families',
  //   formClass: EditFamiliesForm,
  // },
  // commented out evidence agg.
  {
    menuItem: 'Edit Evidence Aggregations',
    formClass: EditEvidenceAggForm,
  },
  // {
  //   menuItem: 'Edit Individuals',
  //   formClass: EditIndividualsForm,
  // },
  // {
  //   menuItem: 'Bulk Edit Families',
  //   formClass: EditFamiliesBulkForm,
  // },
  // {
  //   menuItem: 'Bulk Edit Individuals',
  //   formClass: EditIndividualsBulkForm,
  // },
  // {
  //   menuItem: 'Bulk Edit Individual Metadata',
  //   formClass: EditIndividualMetadataBulkForm,
  // },
]
// const PANES = PANE_DETAILS.map(({ formClass, menuItem }) => ({
//   render: () => <TabPane key={menuItem}>{React.createElement(formClass, { modalName: MODAL_NAME })}</TabPane>,
//   menuItem,
// }))

const getPanes = geneId => (PANE_DETAILS.map(({ formClass, menuItem }) => ({
  render: () => <TabPane key={menuItem}>{React.createElement(formClass, { modalName: MODAL_NAME, geneId })}</TabPane>,
  menuItem,
})))

const Pane = React.memo(props => (
  <Modal
    modalName={MODAL_NAME}
    title="AI Evidence Aggrigator"
    size="large"
    trigger={<ButtonLink>Edit Evidence Aggrigation</ButtonLink>}
  >
    <Tab panes={getPanes(props.geneId)} />
  </Modal>
))

// component
Pane.propTypes = {
  geneId: PropTypes.string.isRequired,
}

export default Pane
