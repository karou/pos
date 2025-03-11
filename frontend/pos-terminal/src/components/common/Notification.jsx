import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNotification } from '../../context/NotificationContext';

/**
 * Notification component that displays toast notifications
 */
const Notification = () => {
  const { notifications, removeNotification } = useNotification();
  
  return (
    <div className="notifications-container">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

/**
 * Individual notification item
 */
const NotificationItem = ({ notification, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const [timeLeft, setTimeLeft] = useState(notification.autoHideDuration);
  
  // Handle notification auto-hide animation
  useEffect(() => {
    if (notification.autoHideDuration > 0) {
      const startTime = Date.now();
      const endTime = startTime + notification.autoHideDuration;
      
      const interval = setInterval(() => {
        const now = Date.now();
        const remaining = endTime - now;
        
        // Calculate progress percentage
        const newProgress = Math.max(0, (remaining / notification.autoHideDuration) * 100);
        setProgress(newProgress);
        setTimeLeft(remaining);
        
        if (remaining <= 0) {
          clearInterval(interval);
          handleClose();
        }
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [notification.autoHideDuration]);
  
  // Handle notification close with animation
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300); // Animation duration
  };
  
  // Determine icon based on notification type
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };
  
  return (
    <div className={`notification-item notification-${notification.type} ${isExiting ? 'exiting' : ''}`}>
      <div className="notification-content">
        <div className="notification-icon">
          {getIcon()}
        </div>
        <div className="notification-text">
          {notification.title && (
            <div className="notification-title">{notification.title}</div>
          )}
          <div className="notification-message">{notification.message}</div>
        </div>
        <button className="notification-close" onClick={handleClose} aria-label="Close">
          &times;
        </button>
      </div>
      
      {notification.autoHideDuration > 0 && (
        <div 
          className="notification-progress"
          style={{ width: `${progress}%` }}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['success', 'error', 'info', 'warning']).isRequired,
    title: PropTypes.string,
    message: PropTypes.string.isRequired,
    autoHideDuration: PropTypes.number
  }).isRequired,
  onClose: PropTypes.func.isRequired
};

export default Notification;