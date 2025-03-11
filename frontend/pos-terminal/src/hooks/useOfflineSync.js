import { useState, useEffect, useCallback } from 'react';
import { syncData } from '../services/sync';

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
      // Auto-sync when coming back online
      if (pendingSyncCount > 0) {
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
  
  // Check IndexedDB for pending sync items
  const checkPendingSyncItems = useCallback(async () => {
    try {
      // Open IndexedDB
      const dbPromise = indexedDB.open('PosOfflineDB', 1);
      
      dbPromise.onsuccess = (event) => {
        const db = event.target.result;
        
        // Check if the object store exists
        if (!db.objectStoreNames.contains('pendingRequests')) {
          setPendingSyncCount(0);
          return;
        }
        
        const transaction = db.transaction('pendingRequests', 'readonly');
        const store = transaction.objectStore('pendingRequests');
        
        // Count number of items
        const countRequest = store.count();
        
        countRequest.onsuccess = () => {
          setPendingSyncCount(countRequest.result);
        };
        
        transaction.oncomplete = () => {
          db.close();
        };
      };
      
      dbPromise.onerror = (error) => {
        console.error('Error opening IndexedDB:', error);
        setPendingSyncCount(0);
      };
    } catch (error) {
      console.error('Error checking pending sync items:', error);
      setPendingSyncCount(0);
    }
  }, []);
  
  // Sync data with the server
  const sync = useCallback(async () => {
    if (!isOnline || isSyncing) return;
    
    try {
      setIsSyncing(true);
      
      // Perform sync operation
      const syncResult = await syncData();
      
      // Update last sync time
      const now = new Date();
      setLastSyncTime(now);
      localStorage.setItem('lastSyncTime', now.toISOString());
      
      // Recheck pending items
      await checkPendingSyncItems();
      
      setIsSyncing(false);
      
      return syncResult;
    } catch (error) {
      console.error('Sync error:', error);
      setIsSyncing(false);
      throw error;
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
  
  return {
    isOnline,
    isSyncing,
    lastSyncTime,
    pendingSyncCount,
    sync,
    registerBackgroundSync
  };
};

export default useOfflineSync;