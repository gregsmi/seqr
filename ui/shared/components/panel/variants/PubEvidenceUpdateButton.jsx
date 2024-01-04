import React from 'react'
import PropTypes from 'prop-types'

import { connect } from 'react-redux'
import { Popup } from 'semantic-ui-react'

import { updatePubEvidenceNote } from 'pages/Project/reducers'
import RichTextEditor from 'shared/components/form/RichTextEditor'
import { RadioGroup } from 'shared/components/form/Inputs'
import { ButtonLink } from 'shared/components/StyledComponents'
import FormWrapper from 'shared/components/form/FormWrapper'
import Modal from 'shared/components/modal/Modal'

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

const PubEvidenceUpdateButton = React.memo(({ header, note, onSubmit }) => {
  const { title, fields, icon, popup } = NOTE_TYPE_MAPPING[note.noteType]
  const modalName = `pub-ev-${note.pubEvId}-${note.geneId}-${note.noteType}`
  return (
    <Popup
      content={popup}
      trigger={
        // Without a <span> here, the Popup will not render - possibly related to
        // https://github.com/Semantic-Org/Semantic-UI-React/issues/1413
        // With the <span>, the Popup reopens itself on click of the Modal:
        // https://github.com/Semantic-Org/Semantic-UI-React/issues/4176
        <Modal title={title} modalName={modalName} trigger={<ButtonLink icon={icon} size="small" />}>
          <div>
            {header}
            <FormWrapper
              onSubmit={onSubmit}
              modalName={modalName}
              initialValues={note}
              fields={fields}
            />
          </div>
        </Modal>
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
