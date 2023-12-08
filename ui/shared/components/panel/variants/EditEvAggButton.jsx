import React from 'react'
import PropTypes from 'prop-types'
import { Tab } from 'semantic-ui-react'
import styled from 'styled-components'
import Modal from 'shared/components/modal/Modal'
import { ButtonLink } from 'shared/components/StyledComponents'
import EditEvidenceAggForm from './EditEvidenceAggForm'

const TabPane = styled(Tab.Pane)`
  padding: 1em 0 !important;
`

const MODAL_NAME = 'editEvidenceAggregation'
const PANE_DETAILS = [
  {
    menuItem: 'Edit Evidence Aggregations',
    formClass: EditEvidenceAggForm,
  },
]

const getPanes = geneId => (PANE_DETAILS.map(({ formClass, menuItem }) => ({
  render: () => <TabPane key={menuItem}>{React.createElement(formClass, { modalName: MODAL_NAME, geneId })}</TabPane>,
  menuItem,
})))

const Pane = React.memo(props => (
  <Modal
    modalName={MODAL_NAME}
    title="AI Evidence Aggregator"
    size="large"
    trigger={<ButtonLink>Edit Evidence Aggregation Table</ButtonLink>}
  >
    <Tab panes={getPanes(props.geneId)} />
  </Modal>
))

// component
Pane.propTypes = {
  geneId: PropTypes.string.isRequired,
}

export default Pane
