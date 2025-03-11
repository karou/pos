/**
 * Application configuration
 * Values are taken from .env or defaults are used
 */

const config = {
    // Application info
    app: {
      name: process.env.REACT_APP_NAME || 'POS Terminal',
      version: process.env.REACT_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    },
    
    // API settings
    api: {
      baseUrl: process.env.REACT_APP_API_URL || '/api',
      timeout: parseInt(process.env.REACT_APP_API_TIMEOUT, 10) || 10000
    },
    
    // Auth settings
    auth: {
      storageKey: process.env.REACT_APP_AUTH_STORAGE_KEY || 'pos_auth',
      tokenExpiry: parseInt(process.env.REACT_APP_AUTH_TOKEN_EXPIRY, 10) || 8, // Hours
    },
    
    // Offline settings
    offline: {
      enabled: process.env.REACT_APP_ENABLE_OFFLINE !== 'false',
      autoSyncInterval: parseInt(process.env.REACT_APP_AUTO_SYNC_INTERVAL, 10) || 5, // Minutes
      syncOnConnection: process.env.REACT_APP_SYNC_ON_CONNECTION !== 'false'
    },
    
    // Feature flags
    features: {
      multiStore: process.env.REACT_APP_FEATURE_MULTI_STORE !== 'false',
      productCustomization: process.env.REACT_APP_FEATURE_PRODUCT_CUSTOMIZATION !== 'false',
      kitchenDisplay: process.env.REACT_APP_FEATURE_KITCHEN_DISPLAY === 'true',
      customerDisplay: process.env.REACT_APP_FEATURE_CUSTOMER_DISPLAY === 'true'
    },
    
    // Tax settings
    tax: {
      defaultRate: parseFloat(process.env.REACT_APP_DEFAULT_TAX_RATE || '7.0')
    },
    
    // Locale settings
    locale: {
      language: process.env.REACT_APP_DEFAULT_LANGUAGE || 'en',
      currency: process.env.REACT_APP_DEFAULT_CURRENCY || 'USD'
    },
    
    // Default values
    defaults: {
      storeId: process.env.REACT_APP_DEFAULT_STORE_ID || '1'
    }
  };
  
  export default config;