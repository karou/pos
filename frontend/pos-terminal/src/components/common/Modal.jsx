import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

/**
 * Modal component for showing content in a popup dialog
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size, 
  showCloseButton = true,
  closeOnBackdropClick = true
}) => {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    
    // Prevent body scrolling when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);
  
  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      onClose();
    }
  };
  
  // Don't render if modal is not open
  if (!isOpen) return null;
  
  // Determine modal size class
  const modalSizeClass = `modal-${size}`;
  
  // Create portal to render modal at the end of the document body
  return ReactDOM.createPortal(
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className={`modal-container ${modalSizeClass}`}>
        <div className="modal-header">
          {title && <h2 className="modal-title">{title}</h2>}
          {showCloseButton && (
            <button
              type="button"
              className="modal-close-button"
              onClick={onClose}
              aria-label="Close"
            >
              &times;
            </button>
          )}
        </div>
        
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large', 'fullscreen']),
  showCloseButton: PropTypes.bool,
  closeOnBackdropClick: PropTypes.bool
};

Modal.defaultProps = {
  size: 'medium',
  showCloseButton: true,
  closeOnBackdropClick: true
};

export default Modal;