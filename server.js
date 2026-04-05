require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const createApp = require('./src/app');
const { connectDatabase, disconnectDatabase } = require('./src/config/database');
const logger = require('./src/utils/logger');
const initializeNotificationHub = require('./src/sockets/notificationHub');
const notificationService = require('./src/services/notificationService');

/**
 * Validate required environment variables
 */
const validateEnv = () => {
  // Railway provides MONGO_URL, but code uses MONGODB_URI
  // So we set MONGODB_URI from MONGO_URL if needed
  if (process.env.MONGO_URL && !process.env.MONGODB_URI) {
    process.env.MONGODB_URI = process.env.MONGO_URL;
  }

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

const shouldRequireDatabaseOnStartup = () => {
  return process.env.REQUIRE_DB_ON_STARTUP === 'true';
};

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Validate environment
    validateEnv();


    const allowStartWithoutDb = process.env.ALLOW_START_WITHOUT_DB === 'true';


    try {
      await connectDatabase();
    } catch (dbError) {
      logger.error('Database connection failed during startup', {
        error: dbError.message
      });


      if (shouldRequireDatabaseOnStartup()) {
        throw dbError;
      }

      logger.warn('Starting server in degraded mode because database is unavailable');

      if (!allowStartWithoutDb) {
        throw dbError;
      }

      logger.warn('Starting server in limited mode because ALLOW_START_WITHOUT_DB=true');

    }

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
      // Determine base URL - use API_URL from env if available (for cloud), otherwise localhost
      const baseUrl = process.env.API_URL || `http://localhost:${PORT}`;
      
      logger.info(`Server started successfully`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        baseUrl: baseUrl
      });
      logger.info(`API Documentation available at ${baseUrl}/api-docs`);
      logger.info(`Health check available at ${baseUrl}/health`);
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
        await disconnectDatabase();
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
