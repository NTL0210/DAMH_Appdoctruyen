const socketAuth = require('./socketAuth');
const logger = require('../utils/logger');

/**
 * Initialize Socket.io notification hub
 * @param {Object} io - Socket.io server instance
 */
const initializeNotificationHub = (io) => {
  // Apply authentication middleware
  io.use(socketAuth);

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    const username = socket.data.username;

    logger.info(`User connected to notification hub`, {
      userId,
      username,
      socketId: socket.id
    });

    // Join user-specific room for targeted notifications
    socket.join(`user:${userId}`);

    // Handle client disconnect
    socket.on('disconnect', (reason) => {
      logger.info(`User disconnected from notification hub`, {
        userId,
        username,
        socketId: socket.id,
        reason
      });

      // Leave user room
      socket.leave(`user:${userId}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error for user ${userId}`, {
        userId,
        error: error.message,
        stack: error.stack
      });
    });

    // Send connection confirmation
    socket.emit('connected', {
      message: 'Connected to notification hub',
      userId,
      timestamp: new Date().toISOString()
    });
  });

  // Handle connection errors
  io.on('connect_error', (error) => {
    logger.error('Socket.io connection error', {
      error: error.message,
      stack: error.stack
    });
  });

  logger.info('Notification hub initialized');
};

module.exports = initializeNotificationHub;
