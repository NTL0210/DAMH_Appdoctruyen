const logger = require('../utils/logger');

/**
 * Request logging middleware
 * Logs all incoming requests with timing information
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    user: req.user ? { id: req.user.id, username: req.user.username } : null
  });

  // Capture response
  const originalSend = res.send;
  res.send = function (data) {
    res.send = originalSend;
    
    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Log response with appropriate level
    const logData = {
      method: req.method,
      path: req.path,
      statusCode,
      responseTime: `${responseTime}ms`,
      user: req.user ? { id: req.user.id, username: req.user.username } : null
    };

    if (statusCode >= 500) {
      logger.error('Request completed with server error', logData);
    } else if (statusCode >= 400) {
      logger.warn('Request completed with client error', logData);
    } else {
      logger.info('Request completed successfully', logData);
    }

    return originalSend.call(this, data);
  };

  next();
};

module.exports = requestLogger;
