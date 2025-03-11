/**
 * Utility functions for handling local storage
 */

// Storage key prefix to avoid collisions
const STORAGE_PREFIX = 'pos_';

/**
 * Store data in localStorage with prefix
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 */
export const setStorageItem = (key, value) => {
  try {
    const storageKey = `${STORAGE_PREFIX}${key}`;
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(storageKey, serializedValue);
  } catch (error) {
    console.error(`Error storing data for key ${key}:`, error);
  }
};

/**
 * Retrieve data from localStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if not found
 * @returns {any} - Retrieved value or default value
 */
export const getStorageItem = (key, defaultValue = null) => {
  try {
    const storageKey = `${STORAGE_PREFIX}${key}`;
    const serializedValue = localStorage.getItem(storageKey);
    if (serializedValue === null) {
      return defaultValue;
    }
    return JSON.parse(serializedValue);
  } catch (error) {
    console.error(`Error retrieving data for key ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 */
export const removeStorageItem = (key) => {
  try {
    const storageKey = `${STORAGE_PREFIX}${key}`;
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error(`Error removing data for key ${key}:`, error);
  }
};

/**
 * Clear all POS-related items from localStorage
 */
export const clearPosStorage = () => {
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing POS storage:', error);
  }
};

/**
 * Store session data (with expiration)
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @param {number} expiresInMinutes - Minutes until expiration
 */
export const setSessionItem = (key, value, expiresInMinutes = 60) => {
  try {
    const storageKey = `${STORAGE_PREFIX}${key}`;
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);
    
    const sessionData = {
      value,
      expiresAt: expiresAt.toISOString()
    };
    
    localStorage.setItem(storageKey, JSON.stringify(sessionData));
  } catch (error) {
    console.error(`Error storing session data for key ${key}:`, error);
  }
};

/**
 * Get session data (with expiration check)
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if not found or expired
 * @returns {any} - Retrieved value or default value
 */
export const getSessionItem = (key, defaultValue = null) => {
  try {
    const storageKey = `${STORAGE_PREFIX}${key}`;
    const data = localStorage.getItem(storageKey);
    
    if (!data) {
      return defaultValue;
    }
    
    const sessionData = JSON.parse(data);
    const now = new Date();
    const expiresAt = new Date(sessionData.expiresAt);
    
    if (now > expiresAt) {
      // Session expired, remove it
      localStorage.removeItem(storageKey);
      return defaultValue;
    }
    
    return sessionData.value;
  } catch (error) {
    console.error(`Error retrieving session data for key ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Get the storage usage information
 * @returns {Object} - Storage usage information
 */
export const getStorageUsage = () => {
  try {
    let posItemsCount = 0;
    let totalPosSize = 0;
    let totalSize = 0;
    
    Object.keys(localStorage).forEach(key => {
      const item = localStorage.getItem(key);
      const itemSize = item ? (item.length * 2) / 1024 : 0; // Size in KB
      totalSize += itemSize;
      
      if (key.startsWith(STORAGE_PREFIX)) {
        posItemsCount++;
        totalPosSize += itemSize;
      }
    });
    
    return {
      posItemsCount,
      totalPosSize: totalPosSize.toFixed(2), // In KB
      totalSize: totalSize.toFixed(2), // In KB
      percentUsed: ((totalSize / 5120) * 100).toFixed(2) // Assuming 5MB limit
    };
  } catch (error) {
    console.error('Error calculating storage usage:', error);
    return {
      posItemsCount: 0,
      totalPosSize: 0,
      totalSize: 0,
      percentUsed: 0
    };
  }
};