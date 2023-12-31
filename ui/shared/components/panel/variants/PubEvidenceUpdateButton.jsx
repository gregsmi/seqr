import React from 'react'
import PropTypes from 'prop-types'

import { connect } from 'react-redux'

import { updatePubEvidenceNote } from 'pages/Project/reducers'
import UpdateButton from 'shared/components/buttons/UpdateButton'
import RichTextEditor from 'shared/components/form/RichTextEditor'
import { RadioGroup } from 'shared/components/form/Inputs'

const PubEvNoteContainer = ({ header, children }) => (
  <div>
    {header}
    {children}
  </div>
)

PubEvNoteContainer.propTypes = {
  header: PropTypes.node,
  children: PropTypes.node,
}

const PUB_EV_STATUS_OPTIONS = ['Verified', 'Not Verified'].map(text => ({ text, value: text[0] }))

const PUB_EVIDENCE_FIELDS = [
  { name: 'noteStatus', label: 'Status', component: RadioGroup, options: PUB_EV_STATUS_OPTIONS },
  { name: 'note', label: 'Note', component: RichTextEditor },
]

const PubEvidenceUpdateButton = React.memo(({ header, note, onSubmit }) => (
  <UpdateButton
    editIconName="write"
    modalTitle="Edit Publication Evidence"
    modalId={`pub-ev-${note.pubEvId}-${note.geneId}-${note.noteType}}}`}
    onSubmit={onSubmit}
    initialValues={note}
    formFields={PUB_EVIDENCE_FIELDS}
    formContainer={<PubEvNoteContainer header={header} />}
    showErrorPanel
  />
))

PubEvidenceUpdateButton.propTypes = {
  note: PropTypes.object,
  header: PropTypes.node,
  onSubmit: PropTypes.func.isRequired,
}

const mapDispatchToProps = {
  onSubmit: updatePubEvidenceNote,
}

export default connect(null, mapDispatchToProps)(PubEvidenceUpdateButton)
