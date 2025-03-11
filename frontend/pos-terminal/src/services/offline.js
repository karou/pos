/**
 * Service for handling offline functionality and local data storage
 * Uses IndexedDB for persistent storage
 */

// IndexedDB database name and version
const DB_NAME = 'PosOfflineDB';
const DB_VERSION = 1;

// Object store names
const STORES = {
  PENDING_REQUESTS: 'pendingRequests',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  ORDERS: 'orders',
  SETTINGS: 'settings'
};

/**
 * Open IndexedDB database
 * @returns {Promise<IDBDatabase>} - IndexedDB database instance
 */
const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    // Create object stores on database upgrade
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.PENDING_REQUESTS)) {
        db.createObjectStore(STORES.PENDING_REQUESTS, { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains(STORES.PRODUCTS)) {
        db.createObjectStore(STORES.PRODUCTS, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.CATEGORIES)) {
        db.createObjectStore(STORES.CATEGORIES, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.ORDERS)) {
        db.createObjectStore(STORES.ORDERS, { keyPath: 'offlineId' });
      }
      
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
      }
    };
    
    // Success callback
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    
    // Error callback
    request.onerror = (event) => {
      console.error('IndexedDB open error:', event.target.error);
      reject(event.target.error);
    };
  });
};

/**
 * Save a request for offline processing
 * @param {Object} request - Request to save
 * @returns {Promise<Object>} - Saved request with ID
 */
export const saveOfflineRequest = async (request) => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.PENDING_REQUESTS, 'readwrite');
      const store = transaction.objectStore(STORES.PENDING_REQUESTS);
      
      // Add timestamp
      const requestToSave = {
        ...request,
        timestamp: new Date().toISOString()
      };
      
      const addRequest = store.add(requestToSave);
      
      addRequest.onsuccess = (event) => {
        const savedRequest = { ...requestToSave, id: event.target.result };
        resolve(savedRequest);
      };
      
      addRequest.onerror = (event) => {
        reject(event.target.error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error saving offline request:', error);
    throw error;
  }
};

/**
 * Get all pending offline requests
 * @returns {Promise<Array>} - Array of pending requests
 */
export const getPendingRequests = async () => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.PENDING_REQUESTS, 'readonly');
      const store = transaction.objectStore(STORES.PENDING_REQUESTS);
      
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result);
      };
      
      getAllRequest.onerror = (event) => {
        reject(event.target.error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error getting pending requests:', error);
    throw error;
  }
};

/**
 * Remove a pending request from the store
 * @param {number} id - Request ID
 * @returns {Promise<void>}
 */
export const removePendingRequest = async (id) => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.PENDING_REQUESTS, 'readwrite');
      const store = transaction.objectStore(STORES.PENDING_REQUESTS);
      
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => {
        resolve();
      };
      
      deleteRequest.onerror = (event) => {
        reject(event.target.error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error removing pending request:', error);
    throw error;
  }
};

/**
 * Save products for offline use
 * @param {Array} products - Products to cache
 * @returns {Promise<void>}
 */
export const cacheProducts = async (products) => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.PRODUCTS, 'readwrite');
      const store = transaction.objectStore(STORES.PRODUCTS);
      
      // Clear existing products
      const clearRequest = store.clear();
      
      clearRequest.onsuccess = () => {
        // Add each product
        let completed = 0;
        
        products.forEach((product) => {
          const addRequest = store.add(product);
          
          addRequest.onsuccess = () => {
            completed++;
            if (completed === products.length) {
              resolve();
            }
          };
          
          addRequest.onerror = (event) => {
            reject(event.target.error);
          };
        });
        
        // If no products to add
        if (products.length === 0) {
          resolve();
        }
      };
      
      clearRequest.onerror = (event) => {
        reject(event.target.error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error caching products:', error);
    throw error;
  }
};

/**
 * Get cached products
 * @returns {Promise<Array>} - Cached products
 */
export const getCachedProducts = async () => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.PRODUCTS, 'readonly');
      const store = transaction.objectStore(STORES.PRODUCTS);
      
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result);
      };
      
      getAllRequest.onerror = (event) => {
        reject(event.target.error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error getting cached products:', error);
    throw error;
  }
};

/**
 * Save categories for offline use
 * @param {Array} categories - Categories to cache
 * @returns {Promise<void>}
 */
export const cacheCategories = async (categories) => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.CATEGORIES, 'readwrite');
      const store = transaction.objectStore(STORES.CATEGORIES);
      
      // Clear existing categories
      const clearRequest = store.clear();
      
      clearRequest.onsuccess = () => {
        // Add each category
        let completed = 0;
        
        categories.forEach((category) => {
          const addRequest = store.add(category);
          
          addRequest.onsuccess = () => {
            completed++;
            if (completed === categories.length) {
              resolve();
            }
          };
          
          addRequest.onerror = (event) => {
            reject(event.target.error);
          };
        });
        
        // If no categories to add
        if (categories.length === 0) {
          resolve();
        }
      };
      
      clearRequest.onerror = (event) => {
        reject(event.target.error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error caching categories:', error);
    throw error;
  }
};

/**
 * Get cached categories
 * @returns {Promise<Array>} - Cached categories
 */
export const getCachedCategories = async () => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.CATEGORIES, 'readonly');
      const store = transaction.objectStore(STORES.CATEGORIES);
      
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result);
      };
      
      getAllRequest.onerror = (event) => {
        reject(event.target.error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error getting cached categories:', error);
    throw error;
  }
};

/**
 * Save an offline order
 * @param {Object} order - Order to save
 * @returns {Promise<Object>} - Saved order with ID
 */
export const saveOfflineOrder = async (order) => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.ORDERS, 'readwrite');
      const store = transaction.objectStore(STORES.ORDERS);
      
      // Add offline ID and timestamp if not present
      const orderToSave = {
        ...order,
        offlineId: order.offlineId || `offline_${Date.now()}`,
        offlineCreated: true,
        createdAt: order.createdAt || new Date().toISOString()
      };
      
      const addRequest = store.add(orderToSave);
      
      addRequest.onsuccess = () => {
        resolve(orderToSave);
      };
      
      addRequest.onerror = (event) => {
        reject(event.target.error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error saving offline order:', error);
    throw error;
  }
};

/**
 * Get all offline orders
 * @returns {Promise<Array>} - Array of offline orders
 */
export const getOfflineOrders = async () => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.ORDERS, 'readonly');
      const store = transaction.objectStore(STORES.ORDERS);
      
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result);
      };
      
      getAllRequest.onerror = (event) => {
        reject(event.target.error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error getting offline orders:', error);
    throw error;
  }
};

/**
 * Remove an offline order
 * @param {string} offlineId - Offline order ID
 * @returns {Promise<void>}
 */
export const removeOfflineOrder = async (offlineId) => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.ORDERS, 'readwrite');
      const store = transaction.objectStore(STORES.ORDERS);
      
      const deleteRequest = store.delete(offlineId);
      
      deleteRequest.onsuccess = () => {
        resolve();
      };
      
      deleteRequest.onerror = (event) => {
        reject(event.target.error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error removing offline order:', error);
    throw error;
  }
};

/**
 * Save a setting value
 * @param {string} key - Setting key
 * @param {any} value - Setting value
 * @returns {Promise<void>}
 */
export const saveSetting = async (key, value) => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SETTINGS, 'readwrite');
      const store = transaction.objectStore(STORES.SETTINGS);
      
      const putRequest = store.put({ key, value });
      
      putRequest.onsuccess = () => {
        resolve();
      };
      
      putRequest.onerror = (event) => {
        reject(event.target.error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error saving setting:', error);
    throw error;
  }
};

/**
 * Get a setting value
 * @param {string} key - Setting key
 * @returns {Promise<any>} - Setting value
 */
export const getSetting = async (key) => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SETTINGS, 'readonly');
      const store = transaction.objectStore(STORES.SETTINGS);
      
      const getRequest = store.get(key);
      
      getRequest.onsuccess = () => {
        resolve(getRequest.result ? getRequest.result.value : null);
      };
      
      getRequest.onerror = (event) => {
        reject(event.target.error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error getting setting:', error);
    throw error;
  }
};

// Export database constants
export const DATABASE = {
  NAME: DB_NAME,
  VERSION: DB_VERSION,
  STORES
};