const logger = require('../utils/logger');

/**
 * Global error handler middleware
 * Catches all errors and returns consistent error responses
 */
const errorHandler = (err, req, res, next) => {
  // Log error with full context
  const errorContext = {
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    user: req.user ? { id: req.user.id, username: req.user.username } : null,
    ip: req.ip
  };

  // Determine log level based on status code
  const statusCode = err.statusCode || err.status || 500;
  
  if (statusCode >= 500) {
    logger.error('Server error', errorContext);
  } else if (statusCode >= 400) {
    logger.warn('Client error', errorContext);
  }

  // Prepare error response
  const errorResponse = {
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: statusCode >= 500 
        ? 'An internal server error occurred' 
        : err.message || 'An error occurred',
      ...(process.env.NODE_ENV === 'development' && statusCode >= 500 && {
        details: {
          message: err.message,
          stack: err.stack
        }
      })
    },
    timestamp: new Date().toISOString()
  };

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
  logger.warn('Route not found', {
    method: req.method,
    path: req.path,
    ip: req.ip
  });

  res.status(404).json({
    success: false,
    error: {
      code: 'RESOURCE_NOT_FOUND',
      message: 'The requested resource was not found'
    },
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
