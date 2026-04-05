const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for unauthenticated requests
 * 100 requests per 15 minutes per IP
 */
const unauthenticatedLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later'
    }
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later'
      },
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Rate limiter for authenticated requests
 * 1000 requests per 15 minutes per user
 */
const authenticatedLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use user ID as key for authenticated requests
  keyGenerator: (req) => {
    return req.user ? req.user.id : req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later'
      },
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Smart rate limiter that applies different limits based on authentication
 */
const smartRateLimiter = (req, res, next) => {
  if (req.user) {
    return authenticatedLimiter(req, res, next);
  }
  return unauthenticatedLimiter(req, res, next);
};

module.exports = {
  unauthenticatedLimiter,
  authenticatedLimiter,
  smartRateLimiter
};
