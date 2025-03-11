import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Error Boundary component for handling errors in child components
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      error
    };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      errorInfo
    });
    
    // If there's an onError callback, call it
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // If there's an onReset callback, call it
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h2>Something went wrong</h2>
            <p>{this.props.errorMessage || 'An unexpected error occurred'}</p>
            
            {this.props.showDetails && this.state.error && (
              <details className="error-details">
                <summary>Error Details</summary>
                <p>{this.state.error.toString()}</p>
                <div className="error-stack">
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </div>
              </details>
            )}
            
            <button 
              className="error-reset-button"
              onClick={this.handleReset}
            >
              {this.props.resetButtonText || 'Try Again'}
            </button>
          </div>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  errorMessage: PropTypes.string,
  resetButtonText: PropTypes.string,
  showDetails: PropTypes.bool,
  onError: PropTypes.func,
  onReset: PropTypes.func
};

ErrorBoundary.defaultProps = {
  showDetails: false
};

export default ErrorBoundary;