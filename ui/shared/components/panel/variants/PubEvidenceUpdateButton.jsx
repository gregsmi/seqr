import React from 'react'
import PropTypes from 'prop-types'

import { connect } from 'react-redux'

import { updatePubEvidenceNote } from 'pages/Project/reducers'
import UpdateButton from 'shared/components/buttons/UpdateButton'
import RichTextEditor from 'shared/components/form/RichTextEditor'
import { RadioGroup } from 'shared/components/form/Inputs'

const PUB_EV_STATUS_OPTIONS = ['Verified', 'Not Verified'].map(text => ({ text, value: text[0] }))

const PUB_EVIDENCE_FIELDS = [
  { name: 'noteStatus', label: 'Status', component: RadioGroup, options: PUB_EV_STATUS_OPTIONS },
  { name: 'note', label: 'Note', component: RichTextEditor },
]

const PubEvidenceUpdateButton = React.memo(({ note, onSubmit }) => (
  <UpdateButton
    editIconName="write"
    modalTitle="Edit Publication Evidence"
    modalId={`pub-ev-${note.pubEvId}-${note.geneId}`}
    onSubmit={onSubmit}
    initialValues={note}
    formFields={PUB_EVIDENCE_FIELDS}
    showErrorPanel
  />
))

PubEvidenceUpdateButton.propTypes = {
  note: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
}

const mapDispatchToProps = {
  onSubmit: updatePubEvidenceNote,
}

export default connect(null, mapDispatchToProps)(PubEvidenceUpdateButton)
