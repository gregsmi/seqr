import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { getCurrentProject } from 'redux/selectors'
import EditProjectButton from 'shared/components/buttons/EditProjectButton'
import { PageHeaderLayout } from 'shared/components/page/PageHeader'
import { HorizontalSpacer } from 'shared/components/Spacers'

import {
  getPageHeaderEntityLinks,
  getPageHeaderBreadcrumbIdSections,
  getPageHeaderFamily,
  getPageHeaderAnalysisGroup,
} from '../selectors'
import { UpdateAnalysisGroupButton, DeleteAnalysisGroupButton } from './AnalysisGroupButtons'

const PageHeader = ({ project, family, analysisGroup, breadcrumb, match, breadcrumbIdSections, entityLinks }) => {

  if (!project) {
    return null
  }

  let { description } = project
  let button = null
  if (match.params.breadcrumb === 'project_page') {
    button = <EditProjectButton project={project} />
  } else if (match.params.breadcrumb === 'family_page') {
    if (match.params.breadcrumbIdSection === 'matchmaker_exchange') {
      description = ''
    } else {
      description = family.description //eslint-disable-line prefer-destructuring
    }
  } else if (match.params.breadcrumb === 'analysis_group') {
    description = analysisGroup.description //eslint-disable-line prefer-destructuring
    button =
      <span>
        <UpdateAnalysisGroupButton analysisGroup={analysisGroup} />
        <HorizontalSpacer width={10} />
        <DeleteAnalysisGroupButton analysisGroup={analysisGroup} />
      </span>
  }

  const headerProps = breadcrumbIdSections ? { breadcrumbIdSections } : match.params

  return (
    <PageHeaderLayout
      entity="project"
      entityGuid={project.projectGuid}
      title={project.name}
      description={description}
      button={button}
      entityLinkPath={null}
      entityGuidLinkPath="project_page"
      breadcrumb={breadcrumb}
      entityLinks={entityLinks}
      {...headerProps}
    />
  )
}

PageHeader.propTypes = {
  project: PropTypes.object,
  family: PropTypes.object,
  analysisGroup: PropTypes.object,
  match: PropTypes.object,
  breadcrumb: PropTypes.string,
  breadcrumbIdSections: PropTypes.string,
  entityLinks: PropTypes.array,
}

const mapStateToProps = (state, ownProps) => ({
  project: getCurrentProject(state),
  family: getPageHeaderFamily(state, ownProps),
  analysisGroup: getPageHeaderAnalysisGroup(state, ownProps),
  breadcrumbIdSections: getPageHeaderBreadcrumbIdSections(state, ownProps),
  entityLinks: getPageHeaderEntityLinks(state, ownProps),
})

export default connect(mapStateToProps)(PageHeader)
