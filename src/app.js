const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const requestLogger = require('./middleware/requestLogger');
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

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // API documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }'
  }));

  // Mount API routes
  app.use('/auth', authRoutes);
  app.use('/profile', profileRoutes);
  app.use('/comics', comicRoutes);
  app.use('/chapters', chapterRoutes);
  app.use('/comments', commentRoutes);
  app.use('/follows', followRoutes);
  app.use('/reading-progress', readingProgressRoutes);
  app.use('/genres', genreRoutes);

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
