const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { getConnectionStatus } = require('./config/database');
const requestLogger = require('./middleware/requestLogger');
const requireDatabaseConnection = require('./middleware/requireDatabaseConnection');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { smartRateLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const comicRoutes = require('./routes/comics');
const chapterRoutes = require('./routes/chapters');
const commentRoutes = require('./routes/comments');
const followRoutes = require('./routes/follows');
const readingProgressRoutes = require('./routes/readingProgress');
const genreRoutes = require('./routes/genres');

/**
 * Create and configure Express application
 */
const createApp = () => {
  const app = express();

  const mountApiRoute = (path, router, options = {}) => {
    const handlers = options.requiresDatabase
      ? [requireDatabaseConnection, router]
      : [router];

    app.use(path, ...handlers);
    app.use(`/api${path}`, ...handlers);
  };

  // Trust proxy - required for Railway and other reverse proxies
  app.set('trust proxy', 1);

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Disable for Swagger UI
    crossOriginEmbedderPolicy: false
  }));

  // CORS configuration
  const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    optionsSuccessStatus: 200
  };
  app.use(cors(corsOptions));

  // Compression middleware
  app.use(compression({
    threshold: 1024, // Only compress responses larger than 1KB
    level: 6 // Compression level (0-9)
  }));

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging
  app.use(requestLogger);

  // Rate limiting
  app.use(smartRateLimiter);

  // Ignore automatic browser favicon probes to reduce noisy 404 logs.
  app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    const dbStatus = getConnectionStatus();
    const isHealthy = dbStatus === 'connected';

    res.status(isHealthy ? 200 : 503).json({
      success: isHealthy,
      status: isHealthy ? 'healthy' : 'degraded',
      database: {
        status: dbStatus,
      },
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Comic Backend API is running',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/health',
        documentation: '/api-docs',
        legacyApiPrefix: '/api/*',
        auth: '/auth',
        profile: '/profile',
        comics: '/comics',
        chapters: '/chapters',
        comments: '/comments',
        follows: '/follows',
        'reading-progress': '/reading-progress',
        genres: '/genres'
      }
    });
  });

  // API documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }'
  }));

  // Mount API routes
  mountApiRoute('/auth', authRoutes, { requiresDatabase: true });
  mountApiRoute('/profile', profileRoutes, { requiresDatabase: true });
  mountApiRoute('/comics', comicRoutes, { requiresDatabase: true });
  mountApiRoute('/chapters', chapterRoutes, { requiresDatabase: true });
  mountApiRoute('/comments', commentRoutes, { requiresDatabase: true });
  mountApiRoute('/follows', followRoutes, { requiresDatabase: true });
  mountApiRoute('/reading-progress', readingProgressRoutes, { requiresDatabase: true });
  mountApiRoute('/genres', genreRoutes, { requiresDatabase: true });

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
