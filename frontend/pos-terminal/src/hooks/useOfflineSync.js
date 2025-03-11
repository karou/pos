import { useState, useEffect, useCallback } from 'react';
import { getOfflineOrders, removeOfflineOrder } from '../services/offline';
import { syncOfflineOrders } from '../services/orders';
import api from '../services/api';
import config from '../config';

/**
 * Custom hook for managing offline functionality and data synchronization
 * Tracks online status and provides methods for synchronizing data
 */
const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(
    localStorage.getItem('lastSyncTime') ? 
    new Date(localStorage.getItem('lastSyncTime')) : 
    null
  );
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  
  // Monitor online status
  useEffect(() => {
    // Update online status
    const handleOnline = () => {
      console.log('App is online');
      setIsOnline(true);
      // Auto-sync when coming back online if enabled
      if (config.offline.syncOnConnection && pendingSyncCount > 0) {
        sync();
      }
    };
    
    const handleOffline = () => {
      console.log('App is offline');
      setIsOnline(false);
    };
    
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check pending sync items
    checkPendingSyncItems();
    
    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingSyncCount]);
  
  // Auto-sync at intervals if enabled
  useEffect(() => {
    let intervalId;
    
    if (config.offline.autoSyncInterval > 0 && isOnline && pendingSyncCount > 0) {
      intervalId = setInterval(() => {
        sync();
      }, config.offline.autoSyncInterval * 60 * 1000); // Convert minutes to milliseconds
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isOnline, pendingSyncCount]);
  
  // Check IndexedDB for pending sync items
  const checkPendingSyncItems = useCallback(async () => {
    try {
      // Get count of offline orders
      const offlineOrders = await getOfflineOrders();
      setPendingSyncCount(offlineOrders.length);
    } catch (error) {
      console.error('Error checking pending sync items:', error);
      setPendingSyncCount(0);
    }
  }, []);
  
  // Sync data with the server
  const sync = useCallback(async () => {
    if (!isOnline || isSyncing) return { success: false, message: 'Cannot sync while offline or already syncing' };
    
    try {
      setIsSyncing(true);
      
      // Sync offline orders
      const result = await syncOfflineOrders();
      
      // Check if sync was successful
      if (result.success) {
        // Update last sync time
        const now = new Date();
        setLastSyncTime(now);
        localStorage.setItem('lastSyncTime', now.toISOString());
        
        // Recheck pending items
        await checkPendingSyncItems();
      }
      
      setIsSyncing(false);
      
      return result;
    } catch (error) {
      console.error('Sync error:', error);
      setIsSyncing(false);
      
      return {
        success: false,
        error: error.message || 'Unknown error during sync'
      };
    }
  }, [isOnline, isSyncing, checkPendingSyncItems]);
  
  // Register a background sync if supported
  const registerBackgroundSync = useCallback(() => {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready
        .then((registration) => {
          registration.sync.register('sync-pending-requests')
            .then(() => {
              console.log('Background sync registered');
            })
            .catch((err) => {
              console.error('Background sync registration failed:', err);
            });
        });
    }
  }, []);
  
  // Check if application can work offline
  const canWorkOffline = useCallback(() => {
    return config.offline.enabled;
  }, []);
  
  return {
    isOnline,
    isSyncing,
    lastSyncTime,
    pendingSyncCount,
    sync,
    registerBackgroundSync,
    checkPendingSyncItems,
    canWorkOffline
  };
};

export default useOfflineSync;