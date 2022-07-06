import React from 'react'
import PropTypes from 'prop-types'

import FormWrapper from './FormWrapper'

class FormWizard extends React.PureComponent {

  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    pages: PropTypes.arrayOf(PropTypes.object),
  }

  state = { pageIndex: 0, asyncValues: {} }

  navigateNext = () => {
    this.setState(prevState => ({
      pageIndex: prevState.pageIndex + 1,
    }))
  }

  onPageSubmitSucceeded = values => this.setState(prevState => ({
    asyncValues: { ...prevState.asyncValues, ...(values || {}) },
  }))

  resolvedPageSubmit = () => Promise.resolve()

  onFormSubmit = (values) => {
    const { onSubmit } = this.props
    const { asyncValues } = this.state
    onSubmit({ ...asyncValues, ...values })
  }

  render() {
    const { pages, onSubmit, ...props } = this.props
    const { pageIndex } = this.state

    const { fields, onPageSubmit } = pages[pageIndex]

    const formProps = pageIndex === pages.length - 1 ? { onSubmit: this.onFormSubmit } : {
      onSubmit: onPageSubmit(this.onPageSubmitSucceeded) || this.resolvedPageSubmit,
      onSubmitSucceeded: this.navigateNext,
      submitButtonText: 'Next',
      submitButtonIcon: 'angle double right',
    }

    return (
      <FormWrapper
        {...props}
        {...formProps}
        fields={fields}
        showErrorPanel
        hideButtonStatus
      />
    )
  }

}

export default FormWizard
