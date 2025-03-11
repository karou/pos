import React from 'react';
import PropTypes from 'prop-types';

/**
 * Loading spinner component with configurable size and color
 */
const LoadingSpinner = ({ size, color, className }) => {
  const spinnerSize = size === 'small' ? 16 : size === 'large' ? 48 : 24;
  const borderWidth = size === 'small' ? 2 : size === 'large' ? 4 : 3;
  
  const spinnerStyle = {
    width: `${spinnerSize}px`,
    height: `${spinnerSize}px`,
    border: `${borderWidth}px solid rgba(255, 255, 255, 0.3)`,
    borderTop: `${borderWidth}px solid ${color}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    display: 'inline-block'
  };
  
  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div className={`loading-spinner ${className}`} style={spinnerStyle} aria-label="Loading"></div>
    </>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  color: PropTypes.string,
  className: PropTypes.string
};

LoadingSpinner.defaultProps = {
  size: 'medium',
  color: '#ffffff',
  className: ''
};

export default LoadingSpinner;