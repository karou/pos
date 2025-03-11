import React, { createContext, useState, useContext, useCallback } from 'react';
import PropTypes from 'prop-types';

// Create notification context
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  
  // Generate a unique ID for notifications
  const generateId = () => {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };
  
  // Add a notification
  const addNotification = useCallback((notification) => {
    const id = notification.id || generateId();
    const type = notification.type || 'info';
    const autoHideDuration = notification.autoHideDuration || 5000;
    
    const newNotification = {
      id,
      type,
      message: notification.message,
      title: notification.title,
      autoHideDuration,
      timestamp: new Date()
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-hide notification after duration
    if (autoHideDuration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, autoHideDuration);
    }
    
    return id;
  }, []);
  
  // Success notification shorthand
  const showSuccess = useCallback((message, options = {}) => {
    return addNotification({
      type: 'success',
      title: options.title || 'Success',
      message,
      autoHideDuration: options.autoHideDuration
    });
  }, [addNotification]);
  
  // Error notification shorthand
  const showError = useCallback((message, options = {}) => {
    return addNotification({
      type: 'error',
      title: options.title || 'Error',
      message,
      autoHideDuration: options.autoHideDuration || 8000 // Error messages stay longer
    });
  }, [addNotification]);
  
  // Info notification shorthand
  const showInfo = useCallback((message, options = {}) => {
    return addNotification({
      type: 'info',
      title: options.title || 'Information',
      message,
      autoHideDuration: options.autoHideDuration
    });
  }, [addNotification]);
  
  // Warning notification shorthand
  const showWarning = useCallback((message, options = {}) => {
    return addNotification({
      type: 'warning',
      title: options.title || 'Warning',
      message,
      autoHideDuration: options.autoHideDuration || 7000 // Warnings stay longer
    });
  }, [addNotification]);
  
  // Remove a notification by ID
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);
  
  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);
  
  // Context value
  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showInfo,
    showWarning
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired
};

// Custom hook to use notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;