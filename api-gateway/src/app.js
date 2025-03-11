require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { logger } = require('./utils/logger');
//const errorHandler = require('./middlewares/error-handler');
const authMiddleware = require('./middlewares/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Basic rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api/', limiter);

const axios = require('axios');

// Health check endpoint with service status
app.get('/health', async (req, res) => {
  const services = [
    { name: 'Auth', url: process.env.AUTH_SERVICE_URL },
    { name: 'Product', url: process.env.PRODUCT_SERVICE_URL },
    { name: 'Inventory', url: process.env.INVENTORY_SERVICE_URL },
    { name: 'Order', url: process.env.ORDER_SERVICE_URL },
    { name: 'Payment', url: process.env.PAYMENT_SERVICE_URL },
    { name: 'Store', url: process.env.STORE_SERVICE_URL },
    { name: 'Sync', url: process.env.SYNC_SERVICE_URL },
    { name: 'Notification', url: process.env.NOTIFICATION_SERVICE_URL }
  ];

  const serviceStatuses = await Promise.all(
    services.map(async (service) => {
      try {
        const response = await axios.get(`${service.url}/health`, { 
          timeout: 3000 
        });
        return {
          name: service.name,
          status: response.status === 200 ? 'healthy' : 'unhealthy',
          details: response.data
        };
      } catch (error) {
        return {
          name: service.name,
          status: 'unavailable',
          details: error.message
        };
      }
    })
  );

  const overallStatus = serviceStatuses.every(
    service => service.status === 'healthy'
  ) ? 'healthy' : 'degraded';

  res.status(overallStatus === 'healthy' ? 200 : 503).json({
    status: overallStatus,
    services: serviceStatuses
  });
});

// Validate service URLs
const requiredServiceUrls = [
  'AUTH_SERVICE_URL',
  'PRODUCT_SERVICE_URL',
  'INVENTORY_SERVICE_URL',
  'ORDER_SERVICE_URL',
  'PAYMENT_SERVICE_URL',
  'STORE_SERVICE_URL',
  'SYNC_SERVICE_URL',
  'NOTIFICATION_SERVICE_URL'
];


// Check for missing service URLs
const missingUrls = requiredServiceUrls.filter(url => !process.env[url]);
if (missingUrls.length > 0) {
  logger.error(`Missing service URLs: ${missingUrls.join(', ')}`);
  throw new Error(`Missing service URLs: ${missingUrls.join(', ')}`);
}

// Create service proxy middleware
const createServiceProxy = (path, url, requiresAuth = true) => {
  // Validate URL
  if (!url) {
    throw new Error(`No URL provided for service: ${path}`);
  }

  const middleware = [];
  
  if (requiresAuth) {
    middleware.push(authMiddleware);
  }
  
  middleware.push(
    createProxyMiddleware({
      target: url,
      changeOrigin: true,
      pathRewrite: {
        [`^/api/${path}`]: '',
      },
      onError: (err, req, res) => {
        logger.error(`Service proxy error for ${path}: ${err.message}`);
        res.status(503).json({
          status: 'error',
          message: `Service ${path} is currently unavailable`,
          details: err.message
        });
      },
      // Improved configuration for POST requests
      onProxyReq: (proxyReq, req, res) => {
        // Log incoming request details
        logger.info(`Proxying ${req.method} request to ${url}`, {
          path: req.path,
          body: req.body
        });

        // Ensure content-type is set correctly
        if (req.body) {
          const bodyData = JSON.stringify(req.body);
          proxyReq.setHeader('Content-Type', 'application/json');
          proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
        }
      },
      onProxyRes: (proxyRes, req, res) => {
        // Log response details
        logger.info(`Received response from ${url}`, {
          status: proxyRes.statusCode
        });
      },
      // Timeout and retry configurations
      timeout: 10000,  // 10 seconds
      proxyTimeout: 10000,
      
      // Modify request and response handling
      followRedirects: true,
      changeOrigin: true,
      ws: true,  // Enable websocket support if needed
      
      // Additional proxy options
      secure: false,  // Disable SSL verification in development
      debug: process.env.NODE_ENV === 'development'
    })
  );
  
  return middleware;
};

// Add body parsing middleware before proxy routes
app.use(express.json({
  limit: '10mb',
  // Add strict parsing to catch JSON errors early
  strict: true
}));

// Error handling middleware for JSON parsing
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid JSON payload'
    });
  }
  next();
});

// Detailed request logging middleware
app.use((req, res, next) => {
  if (req.method === 'POST') {
    logger.info('Incoming POST request', {
      path: req.path,
      headers: req.headers,
      body: req.body
    });
  }
  next();
});

// API Routes
// Auth service routes (no auth required)
app.use(
  '/api/auth',
  createServiceProxy('auth', process.env.AUTH_SERVICE_URL, false)
);

// Product service routes
app.use(
  '/api/products',
  createServiceProxy('products', process.env.PRODUCT_SERVICE_URL)
);

// Inventory service routes
app.use(
  '/api/inventory',
  createServiceProxy('inventory', process.env.INVENTORY_SERVICE_URL)
);

// Order service routes
app.use(
  '/api/orders',
  createServiceProxy('orders', process.env.ORDER_SERVICE_URL)
);

// Payment service routes
app.use(
  '/api/payments',
  createServiceProxy('payments', process.env.PAYMENT_SERVICE_URL)
);

// Store service routes
app.use(
  '/api/stores',
  createServiceProxy('stores', process.env.STORE_SERVICE_URL)
);

// Sync service routes
app.use(
  '/api/sync',
  createServiceProxy('sync', process.env.SYNC_SERVICE_URL)
);

// Notification service routes
app.use(
  '/api/notifications',
  createServiceProxy('notifications', process.env.NOTIFICATION_SERVICE_URL)
);

const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Error handling middleware
app.use(errorHandler);

// Start the server
const server = app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});