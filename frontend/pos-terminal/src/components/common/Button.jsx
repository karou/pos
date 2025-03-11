import React from 'react';
import PropTypes from 'prop-types';
import LoadingSpinner from './LoadingSpinner';

/**
 * Reusable Button component with different variants and loading state
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  type = 'button',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  icon,
  onClick,
  className,
  ...rest
}) => {
  // Base class
  const baseClass = 'btn';
  
  // Variant classes
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    success: 'btn-success',
    warning: 'btn-warning',
    info: 'btn-info',
    link: 'btn-link',
    outline: 'btn-outline'
  };
  
  // Size classes
  const sizeClasses = {
    small: 'btn-sm',
    medium: 'btn-md',
    large: 'btn-lg'
  };
  
  // Construct class string
  const buttonClass = [
    baseClass,
    variantClasses[variant] || variantClasses.primary,
    sizeClasses[size] || sizeClasses.medium,
    fullWidth ? 'btn-full-width' : '',
    isLoading ? 'btn-loading' : '',
    icon && !children ? 'btn-icon-only' : '',
    className || ''
  ].filter(Boolean).join(' ');
  
  return (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        <LoadingSpinner 
          size={size === 'large' ? 'small' : 'small'} 
          color={variant === 'primary' ? '#fff' : '#4a6cfa'} 
        />
      ) : (
        <>
          {icon && <span className="btn-icon">{icon}</span>}
          {children && <span className="btn-text">{children}</span>}
        </>
      )}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf([
    'primary',
    'secondary',
    'danger',
    'success',
    'warning',
    'info',
    'link',
    'outline'
  ]),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  icon: PropTypes.node,
  onClick: PropTypes.func,
  className: PropTypes.string
};

export default Button;