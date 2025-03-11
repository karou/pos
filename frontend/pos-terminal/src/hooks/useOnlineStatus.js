import { useState, useEffect } from 'react';

/**
 * Custom hook to track online/offline status
 * @returns {Object} - Online status information
 */
const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [offlineSince, setOfflineSince] = useState(null);
  
  useEffect(() => {
    // Update online status when it changes
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // Reset wasOffline after some time
        setTimeout(() => {
          setWasOffline(false);
        }, 5000);
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setOfflineSince(new Date());
    };
    
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);
  
  // Calculate duration of offline status
  const getOfflineDuration = () => {
    if (!offlineSince || isOnline) return null;
    
    const now = new Date();
    const diffMs = now - offlineSince;
    
    // Convert to readable format
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    
    return `${seconds}s`;
  };
  
  // Check actual connection by making a ping request
  const checkConnection = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('/api/ping', {
        method: 'GET',
        cache: 'no-cache',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      return response.ok;
    } catch (error) {
      console.log('Connection check failed:', error);
      return false;
    }
  };
  
  return {
    isOnline,
    wasOffline,
    offlineSince,
    offlineDuration: getOfflineDuration(),
    checkConnection
  };
};

export default useOnlineStatus;