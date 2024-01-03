import React from 'react'
import PropTypes from 'prop-types'

import { connect } from 'react-redux'
import { Popup } from 'semantic-ui-react'

import { updatePubEvidenceNote } from 'pages/Project/reducers'
import UpdateButton from 'shared/components/buttons/UpdateButton'
import RichTextEditor from 'shared/components/form/RichTextEditor'
import { RadioGroup } from 'shared/components/form/Inputs'

const PUB_NOTE_TITLE = 'Edit Publication Evidence Note'
const PUB_NOTE_STATUS_OPTIONS = ['Verified', 'Not Verified'].map(text => ({ text, value: text[0] }))
const PUB_NOTE_FIELDS = [
  { name: 'noteStatus', label: 'Status', component: RadioGroup, options: PUB_NOTE_STATUS_OPTIONS },
  { name: 'note', label: 'Feedback', component: RichTextEditor },
]
const PUB_NOTE_POPUP = 'Add or edit a note on this publication evidence.'
const PUB_FEEDBACK_TITLE = 'Submit Publication Evidence Feedback'
const PUB_FEEDBACK_FIELDS = [
  { name: 'note', label: 'Note', component: RichTextEditor },
]
const PUB_FEEDBACK_POPUP = 'Submit feedback on this publication evidence.'

const NOTE_TYPE_MAPPING = {
  N: { title: PUB_NOTE_TITLE, fields: PUB_NOTE_FIELDS, icon: 'write', popup: PUB_NOTE_POPUP },
  F: { title: PUB_FEEDBACK_TITLE, fields: PUB_FEEDBACK_FIELDS, icon: 'commenting', popup: PUB_FEEDBACK_POPUP },
}

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

const PubEvidenceUpdateButton = React.memo(({ header, note, onSubmit }) => {
  const { title, fields, icon, popup } = NOTE_TYPE_MAPPING[note.noteType]
  return (
    <Popup
      content={popup}
      position="top center"
      basic
      trigger={
        <UpdateButton
          editIconName={icon}
          modalTitle={title}
          modalId={`pub-ev-${note.pubEvId}-${note.geneId}-${note.noteType}`}
          onSubmit={onSubmit}
          initialValues={note}
          formFields={fields}
          formContainer={<PubEvNoteContainer header={header} />}
          showErrorPanel
        />
      }
    />
  )
})

PubEvidenceUpdateButton.propTypes = {
  note: PropTypes.object,
  header: PropTypes.node,
  onSubmit: PropTypes.func.isRequired,
}

const mapDispatchToProps = {
  onSubmit: updatePubEvidenceNote,
}

export default connect(null, mapDispatchToProps)(PubEvidenceUpdateButton)
