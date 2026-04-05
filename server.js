require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const createApp = require('./src/app');
const { connectDatabase } = require('./src/config/database');
const logger = require('./src/utils/logger');
const initializeNotificationHub = require('./src/sockets/notificationHub');
const notificationService = require('./src/services/notificationService');

/**
 * Validate required environment variables
 */
const validateEnv = () => {
  const required = [
    'MONGODB_URI',
    'JWT_SECRET'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    logger.error('Missing required environment variables', { missing });
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Check optional Google OAuth configuration
  const hasGoogleOAuth = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;
  if (hasGoogleOAuth) {
    logger.info('Google OAuth is enabled');
  } else {
    logger.warn('Google OAuth is disabled - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET not configured');
  }

  logger.info('Environment configuration validated');
};

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Validate environment
    validateEnv();

    // Connect to database
    await connectDatabase();

    // Create Express app
    const app = createApp();

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.io
    const io = new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    // Initialize notification hub
    initializeNotificationHub(io);

    // Initialize notification service with Socket.io instance
    notificationService.initialize(io);

    // Start server
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      logger.info(`Server started successfully`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version
      });
      logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
      logger.info(`Health check available at http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received, starting graceful shutdown`);

      server.close(async () => {
        logger.info('HTTP server closed');

        // Close Socket.io connections
        io.close(() => {
          logger.info('Socket.io connections closed');
        });

        // Close database connection
        const mongoose = require('mongoose');
        await mongoose.connection.close();
        logger.info('Database connection closed');

        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', {
        error: error.message,
        stack: error.stack
      });
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection', {
        reason,
        promise
      });
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
};

// Start the server
startServer();
