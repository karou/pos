const { logger } = require('../utils/logger');

/**
 * Error handling middleware for the API Gateway
 */
const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  // Set status code
  const statusCode = err.statusCode || 500;
  
  // Send error response
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    errors: err.errors || null,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;
