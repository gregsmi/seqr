import React from 'react'
import PropTypes from 'prop-types'

import { connect } from 'react-redux'
import { Button, Popup, Icon } from 'semantic-ui-react'

import RichTextEditor from 'shared/components/form/RichTextEditor'
import { RadioGroup } from 'shared/components/form/Inputs'
import { ButtonLink } from 'shared/components/StyledComponents'
import FormWrapper from 'shared/components/form/FormWrapper'
import Modal from 'shared/components/modal/Modal'

import { getPubEvidenceGeneIds, getPubEvidenceGeneIdsLoading } from 'pages/Project/selectors'
import { loadPubEvidenceGeneIds, updatePubEvidenceNote } from 'pages/Project/reducers'
import DataLoader from '../../DataLoader'

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

const PubEvidenceUpdate = React.memo(({ header, note, onSubmit }) => {
  const { title, fields, icon, popup } = NOTE_TYPE_MAPPING[note.noteType]
  const modalName = `pub-ev-${note.evidenceId}-${note.geneId}-${note.noteType}`
  return (
    <Popup
      basic
      content={popup}
      on="hover"
      trigger={
        // Without a <div> or <span> here, the Popup will not render:
        // https://github.com/Semantic-Org/Semantic-UI-React/issues/1413
        <span>
          <Modal title={title} modalName={modalName} trigger={<ButtonLink icon={icon} />}>
            {header}
            <FormWrapper
              onSubmit={onSubmit}
              modalName={modalName}
              initialValues={note}
              fields={fields}
            />
          </Modal>
        </span>
      }
    />
  )
})

PubEvidenceUpdate.propTypes = {
  note: PropTypes.object,
  header: PropTypes.node,
  onSubmit: PropTypes.func.isRequired,
}

const mapDispatchToProps = {
  onSubmit: updatePubEvidenceNote,
}

export const PubEvidenceUpdateButton = connect(null, mapDispatchToProps)(PubEvidenceUpdate)

const overflowStyle = { maxWidth: '800px' }

const PubEvidenceShow = ({ toggleShowPubs, mainGeneId, geneIds, load, loading }) => {
  if (!mainGeneId) {
    return null
  }
  return (
    <DataLoader content load={load} loading={loading}>
      {geneIds && geneIds[mainGeneId] ? (
        <div>
          <Button color="blue" size="tiny" onClick={toggleShowPubs}>
            AI Evidence Aggregator
          </Button>
          <Popup
            style={overflowStyle}
            content="The Evidence Aggregator is intended to be one tool within a genomic analyst's toolkit to review
            literature related to a variant of interest. It is the user's responsibility to verify the accuracy of the
            information returned by the Evidence Aggregator. The Evidence Aggregator is not designed, intended, or made
            available for use in the diagnosis, prevention, mitigation, or treatment of a disease or medical condition
            nor to perform any medical function and the performance of the Evidence Aggregator for such purposes has not
            been established. You bear sole responsibility for any use of the Evidence Aggregator, including incorporation
            into any product intended for a medical purpose."
            trigger={<Icon name="info circle" color="blue" size="large" />}
            hoverable
          />
        </div>
      ) : null}
    </DataLoader>
  )
}

PubEvidenceShow.propTypes = {
  toggleShowPubs: PropTypes.func.isRequired,
  mainGeneId: PropTypes.string.isRequired,
  geneIds: PropTypes.object.isRequired,
  load: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
}

const mapStateToProps = state => ({
  geneIds: getPubEvidenceGeneIds(state),
  loading: getPubEvidenceGeneIdsLoading(state),
})

const mapLoadDispatchToProps = {
  load: loadPubEvidenceGeneIds,
}

export const PubEvidenceShowButton = connect(mapStateToProps, mapLoadDispatchToProps)(PubEvidenceShow)
