import axios from 'axios';
import { getStoredAuthToken, clearAuthToken } from '../utils/auth';
import { saveOfflineRequest } from './offline';
import mockAPI from './mockApi';
import config from '../config';

// Determine if we should use mock data as fallback
// Use mock data only if explicitly enabled via env var, AND in development mode
const USE_MOCK_API = process.env.NODE_ENV === 'development' && 
                     process.env.REACT_APP_USE_MOCK_API === 'true';

// Track pending requests to prevent duplicates during rate limiting
const pendingRequests = new Map();

// Create axios instance with defaults
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT, 10) || 10000,
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

    // Create a unique key for this request
    const requestKey = `${config.method}:${config.url}${JSON.stringify(config.params || {})}`;
    
    // Check if we have a pending request for this exact URL and params
    if (pendingRequests.has(requestKey)) {
      // Return a canceled request to prevent duplication during rate limiting
      const source = axios.CancelToken.source();
      config.cancelToken = source.token;
      source.cancel('Duplicate request during rate limiting');
    }
    
    // Mark this request as pending
    pendingRequests.set(requestKey, true);
    
    // Add cleanup when request is complete
    const originalCompleteHandler = config.complete;
    config.complete = function() {
      pendingRequests.delete(requestKey);
      if (originalCompleteHandler) {
        originalCompleteHandler();
      }
    };
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Clear pending request marker
    const requestKey = `${response.config.method}:${response.config.url}${JSON.stringify(response.config.params || {})}`;
    pendingRequests.delete(requestKey);
    
    return response;
  },
  async (error) => {
    // Clear pending request marker
    if (error.config) {
      const requestKey = `${error.config.method}:${error.config.url}${JSON.stringify(error.config.params || {})}`;
      pendingRequests.delete(requestKey);
    }
    
    // Handle rate limiting (429 Too Many Requests)
    if (error.response && error.response.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 2; // Default to 2 seconds if not provided
      console.log(`Rate limited. Retrying after ${retryAfter} seconds...`);
      
      // Use mock data immediately if available and configured
      if (USE_MOCK_API) {
        const mockEndpoint = Object.keys(mockAPI).find(endpoint => 
          error.config.url.includes(endpoint)
        );
        
        if (mockEndpoint) {
          console.log(`Using mock data for ${error.config.url} (rate limited)`);
          const mockData = error.config.method.toLowerCase() === 'post'
            ? mockAPI[mockEndpoint](JSON.parse(error.config.data || '{}'))
            : mockAPI[mockEndpoint]();
            
          return mockData;
        }
      }
      
      // Otherwise, for important requests, we can implement retry with exponential backoff
      // This is disabled by default to prevent overwhelming the server
      if (error.config._retry !== true && error.config.important === true) {
        error.config._retry = true;
        
        // Wait before retrying (using the Retry-After header value)
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        
        // Retry the request
        return api(error.config);
      }
      
      // Return a friendly error message for rate limiting
      return Promise.reject({
        isRateLimited: true,
        message: 'Too many requests. Please try again in a few moments.',
        retryAfter
      });
    }
    
    // Check if we should use mock API and if the URL matches a mock endpoint
    if (USE_MOCK_API && (error.response?.status === 404 || !error.response)) {
      const mockEndpoint = Object.keys(mockAPI).find(endpoint => 
        error.config.url.includes(endpoint)
      );
      
      if (mockEndpoint) {
        console.log(`Using mock data for ${error.config.url}`);
        const mockData = error.config.method.toLowerCase() === 'post'
          ? mockAPI[mockEndpoint](JSON.parse(error.config.data || '{}'))
          : mockAPI[mockEndpoint]();
          
        return mockData;
      }
    }
    
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
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

// Helper to check if the app is in development mode with mock API enabled
export const isMockMode = () => USE_MOCK_API;

// API endpoints
// Authentication
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  logout: () => api.post('/api/auth/logout'),
  getProfile: () => api.get('/api/auth/profile')
};

// Products
export const productsAPI = {
  getAllProducts: () => api.get('/api/products'),
  getCategories: () => api.get('/api/products/categories'),
  getProductsByCategory: (categoryId) => api.get(`/api/products/category/${categoryId}`),
  getProduct: (id) => api.get(`/api/products/${id}`),
  calculatePrice: (productId, variations, toppings) => 
    api.post('/api/products/calculate-price', { productId, variations, toppings })
};

// Orders
export const ordersAPI = {
  createOrder: (orderData) => api.post('/api/orders', orderData, { important: true }), // Mark as important
  getOrders: (params) => api.get('/api/orders', { params }),
  getOrder: (id) => api.get(`/api/orders/${id}`),
  updateOrderStatus: (id, status, note) => 
    api.patch(`/api/orders/${id}/status`, { status, note }, { important: true }),
  processSyncedOrders: (orders) => api.post('/api/orders/sync', { orders }, { important: true })
};

// Inventory
export const inventoryAPI = {
  getInventory: (params) => api.get('/api/inventory', { params }),
  updateInventory: (itemId, quantity, type, reason) => 
    api.post('/api/inventory/update', { itemId, quantity, type, reason }, { important: true })
};

// Payments
export const paymentsAPI = {
  processPayment: (paymentData) => api.post('/api/payments', paymentData, { important: true }),
  getPayment: (id) => api.get(`/api/payments/${id}`)
};

// Stores
export const storesAPI = {
  getStores: () => api.get('/api/stores'),
  getStore: (id) => api.get(`/api/stores/${id}`)
};

// Sync
export const syncAPI = {
  startSyncSession: (data) => api.post('/api/sync/start', data),
  updateSyncProgress: (sessionId, data) => api.patch(`/api/sync/${sessionId}/progress`, data),
  completeSyncSession: (sessionId, data) => api.post(`/api/sync/${sessionId}/complete`, data),
  resolveConflicts: (data) => api.post('/api/sync/resolve-conflicts', data),
  getSyncHistory: (params) => api.get('/api/sync/history', { params })
};

// Notifications
export const notificationsAPI = {
  getNotifications: () => api.get('/api/notifications'),
  markAsRead: (id) => api.post(`/api/notifications/${id}/read`)
};

export default api;