import {
    getPendingRequests,
    removePendingRequest,
    getOfflineOrders,
    removeOfflineOrder,
    saveSetting
  } from './offline';
  import { syncAPI, ordersAPI } from './api';
  
  /**
   * Synchronize offline data with server
   * @returns {Promise<Object>} - Sync summary with counts and errors
   */
  export const syncData = async () => {
    console.log('Starting data synchronization...');
    
    const syncSummary = {
      startTime: new Date(),
      endTime: null,
      requestsProcessed: 0,
      ordersProcessed: 0,
      errors: [],
      completed: false
    };
    
    try {
      // 1. Create a sync session on the server
      const sessionResponse = await syncAPI.startSyncSession({
        client: 'pos-terminal',
        store: localStorage.getItem('storeId'),
        totalRecords: 0, // Will be updated during sync
        metadata: {
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform
          }
        }
      });
      
      const syncSessionId = sessionResponse.data.data._id;
      console.log(`Sync session created with ID: ${syncSessionId}`);
      
      // 2. Process pending orders
      const offlineOrders = await getOfflineOrders();
      if (offlineOrders.length > 0) {
        console.log(`Processing ${offlineOrders.length} offline orders...`);
        
        try {
          const processOrdersResponse = await ordersAPI.processSyncedOrders(offlineOrders);
          syncSummary.ordersProcessed = offlineOrders.length;
          
          // Remove successfully processed orders
          const results = processOrdersResponse.data.data;
          for (const result of results) {
            if (result.status === 'success' || result.status === 'skipped') {
              await removeOfflineOrder(result.offlineId);
            } else {
              syncSummary.errors.push({
                type: 'order',
                id: result.offlineId,
                message: result.message
              });
            }
          }
        } catch (error) {
          console.error('Error processing offline orders:', error);
          syncSummary.errors.push({
            type: 'orders',
            message: error.message || 'Failed to process offline orders'
          });
        }
        
        // Update sync progress
        await syncAPI.updateSyncProgress(syncSessionId, {
          processedRecords: syncSummary.ordersProcessed,
          status: 'in_progress',
          metadata: {
            phase: 'orders',
            details: `Processed ${syncSummary.ordersProcessed} orders`
          }
        });
      }
      
      // 3. Process other pending requests
      const pendingRequests = await getPendingRequests();
      if (pendingRequests.length > 0) {
        console.log(`Processing ${pendingRequests.length} pending requests...`);
        
        for (const request of pendingRequests) {
          try {
            // Reconstruct and execute the request
            const response = await fetch(request.url, {
              method: request.method,
              headers: request.headers,
              body: JSON.stringify(request.data)
            });
            
            if (response.ok) {
              syncSummary.requestsProcessed++;
              await removePendingRequest(request.id);
            } else {
              const errorData = await response.json();
              syncSummary.errors.push({
                type: 'request',
                id: request.id,
                url: request.url,
                status: response.status,
                message: errorData.message || 'Request failed'
              });
            }
          } catch (error) {
            console.error(`Error processing request ${request.id}:`, error);
            syncSummary.errors.push({
              type: 'request',
              id: request.id,
              url: request.url,
              message: error.message || 'Request failed'
            });
          }
        }
        
        // Update sync progress
        await syncAPI.updateSyncProgress(syncSessionId, {
          processedRecords: syncSummary.requestsProcessed + syncSummary.ordersProcessed,
          status: 'in_progress',
          metadata: {
            phase: 'requests',
            details: `Processed ${syncSummary.requestsProcessed} requests`
          }
        });
      }
      
      // 4. Complete sync session
      syncSummary.completed = true;
      syncSummary.endTime = new Date();
      
      await syncAPI.completeSyncSession(syncSessionId, {
        metadata: {
          summary: {
            ordersProcessed: syncSummary.ordersProcessed,
            requestsProcessed: syncSummary.requestsProcessed,
            errorCount: syncSummary.errors.length,
            duration: syncSummary.endTime - syncSummary.startTime
          }
        }
      });
      
      console.log('Synchronization completed successfully');
      
      // Update last sync time
      await saveSetting('lastSyncTime', new Date().toISOString());
      
      return syncSummary;
    } catch (error) {
      console.error('Synchronization failed:', error);
      
      syncSummary.completed = false;
      syncSummary.endTime = new Date();
      syncSummary.errors.push({
        type: 'sync',
        message: error.message || 'Synchronization failed'
      });
      
      return syncSummary;
    }
  };
  
  /**
   * Register for background sync
   * @returns {Promise<boolean>} - Whether registration was successful
   */
  export const registerBackgroundSync = async () => {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-pending-requests');
        console.log('Background sync registered successfully');
        return true;
      } catch (error) {
        console.error('Background sync registration failed:', error);
        return false;
      }
    }
    
    console.warn('Background sync not supported in this browser');
    return false;
  };