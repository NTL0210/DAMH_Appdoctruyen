const { getConnectionStatus } = require('../config/database');

const requireDatabaseConnection = (req, res, next) => {
  const status = getConnectionStatus();

  if (status === 'connected') {
    return next();
  }

  return res.status(503).json({
    success: false,
    error: {
      code: 'DATABASE_UNAVAILABLE',
      message: 'Database is currently unavailable',
      details: {
        status
      }
    },
    timestamp: new Date().toISOString()
  });
};

module.exports = requireDatabaseConnection;