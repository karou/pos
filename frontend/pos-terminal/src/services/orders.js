import api from './api';
import { saveOfflineOrder, getOfflineOrders, removeOfflineOrder } from './offline';
import { useOfflineSync } from '../hooks/useOfflineSync';
import config from '../config';

/**
 * Service for handling orders
 */

// Create a new order
export const createOrder = async (orderData, isOffline = false) => {
  try {
    if (isOffline) {
      // Save order for offline processing
      return await saveOfflineOrder({
        ...orderData,
        offlineCreated: true,
        offlineId: `offline_${Date.now()}`,
        createdAt: new Date().toISOString()
      });
    } else {
      // Send to API
      const response = await api.post('/orders', orderData);
      return response.data.data;
    }
  } catch (error) {
    console.error('Error creating order:', error);
    
    // If network error, try saving offline
    if (!error.response && !isOffline) {
      return createOrder(orderData, true);
    }
    
    throw error;
  }
};

// Get order by ID
export const getOrderById = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    throw error;
  }
};

// Get all orders with filtering options
export const getOrders = async (filters = {}) => {
  try {
    const { storeId, startDate, endDate, status, page, limit } = filters;
    
    // Build query parameters
    const params = {};
    
    if (storeId) {
      params.storeId = storeId;
    } else {
      // Default to current store
      params.storeId = localStorage.getItem('storeId') || config.defaults.storeId;
    }
    
    if (startDate) {
      params.startDate = startDate instanceof Date 
        ? startDate.toISOString() 
        : startDate;
    }
    
    if (endDate) {
      params.endDate = endDate instanceof Date 
        ? endDate.toISOString() 
        : endDate;
    }
    
    if (status) {
      params.status = status;
    }
    
    if (page) {
      params.page = page;
    }
    
    if (limit) {
      params.limit = limit;
    }
    
    const response = await api.get('/orders', { params });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId, status, notes = '') => {
  try {
    const response = await api.patch(`/orders/${orderId}/status`, {
      status,
      notes
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error updating order ${orderId} status:`, error);
    throw error;
  }
};

// Sync offline orders
export const syncOfflineOrders = async () => {
  try {
    // Get all offline orders
    const offlineOrders = await getOfflineOrders();
    
    if (offlineOrders.length === 0) {
      return { success: true, synced: 0, errors: 0 };
    }
    
    // Send orders to API for batch processing
    const response = await api.post('/orders/sync-offline', {
      orders: offlineOrders
    });
    
    const results = response.data.data || [];
    let syncedCount = 0;
    let errorCount = 0;
    
    // Process results
    for (const result of results) {
      if (result.status === 'success' || result.status === 'skipped') {
        // Remove from offline storage
        await removeOfflineOrder(result.offlineId);
        syncedCount++;
      } else {
        errorCount++;
      }
    }
    
    return {
      success: true,
      synced: syncedCount,
      errors: errorCount
    };
  } catch (error) {
    console.error('Error syncing offline orders:', error);
    return {
      success: false,
      error: error.message || 'Unknown error during sync'
    };
  }
};

// Get receipt for order
export const getOrderReceipt = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}/receipt`);
    return response.data.data;
  } catch (error) {
    console.error(`Error getting receipt for order ${orderId}:`, error);
    throw error;
  }
};

// Generate order summary for date range
export const getOrdersSummary = async (filters = {}) => {
  try {
    const response = await api.get('/orders/summary', { params: filters });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching orders summary:', error);
    throw error;
  }
};