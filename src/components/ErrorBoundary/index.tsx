import React, { ErrorInfo } from 'react';
import ErrorFallback from '../ErrorFallback';

class ErrorBoundary extends React.Component {
  state = {
    error: null,
    errorInfo: null,
  };

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });
  }

  resetErrorState = () => {
    this.setState({
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.error) {
      return <ErrorFallback resetErrorState={this.resetErrorState} />;
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
