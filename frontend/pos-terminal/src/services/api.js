import axios from 'axios';
import { getStoredAuthToken, clearAuthToken } from '../utils/auth';
import { saveOfflineRequest } from './offline';

// Create axios instance with defaults
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = getStoredAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle network errors
    if (!error.response) {
      console.log('Network error detected, saving request for offline processing');
      
      // For GET requests, we need to handle differently
      if (error.config.method.toLowerCase() === 'get') {
        // For GET requests, we'll throw an error to be caught by the component
        return Promise.reject({ 
          isOffline: true, 
          message: 'You are currently offline. This data will be available when you reconnect.' 
        });
      }
      
      // For non-GET requests, save for later sync
      try {
        await saveOfflineRequest({
          url: error.config.url,
          method: error.config.method,
          data: error.config.data ? JSON.parse(error.config.data) : {},
          headers: error.config.headers
        });
        
        // Return a "fake" successful response
        return Promise.resolve({
          data: {
            success: true,
            offline: true,
            message: 'Your request has been saved and will be processed when you are back online.'
          }
        });
      } catch (offlineError) {
        return Promise.reject({
          isOffline: true,
          message: 'Failed to save request for offline processing',
          originalError: error,
          offlineError
        });
      }
    }
    
    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response && error.response.status === 401) {
      // Clear invalid token
      clearAuthToken();
      
      // Redirect to login page
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
// Authentication
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile')
};

// Products
export const productsAPI = {
  getAllProducts: () => api.get('/products'),
  getProductsByCategory: (categoryId) => api.get(`/products/category/${categoryId}`),
  getProduct: (id) => api.get(`/products/${id}`),
  calculatePrice: (productId, variations, toppings) => 
    api.post('/products/calculate-price', { productId, variations, toppings })
};

// Orders
export const ordersAPI = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getOrders: (params) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, status, note) => 
    api.patch(`/orders/${id}/status`, { status, note }),
  processSyncedOrders: (orders) => api.post('/orders/sync-offline', { orders })
};

// Inventory
export const inventoryAPI = {
  getInventory: (params) => api.get('/inventory', { params }),
  updateInventory: (itemId, quantity, type, reason) => 
    api.post('/inventory/update', { itemId, quantity, type, reason })
};

// Payments
export const paymentsAPI = {
  processPayment: (paymentData) => api.post('/payments', paymentData),
  getPayment: (id) => api.get(`/payments/${id}`)
};

// Stores
export const storesAPI = {
  getStores: () => api.get('/stores'),
  getStore: (id) => api.get(`/stores/${id}`)
};

// Sync
export const syncAPI = {
  startSyncSession: (data) => api.post('/sync/start', data),
  updateSyncProgress: (sessionId, data) => api.patch(`/sync/${sessionId}/progress`, data),
  completeSyncSession: (sessionId, data) => api.post(`/sync/${sessionId}/complete`, data),
  resolveConflicts: (data) => api.post('/sync/resolve-conflicts', data),
  getSyncHistory: (params) => api.get('/sync/history', { params })
};

export default api;