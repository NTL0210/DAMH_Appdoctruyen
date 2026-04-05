const jwt = require('jsonwebtoken');

/**
 * JWT Authentication Middleware
 * Verifies JWT token from Authorization header and attaches user data to request
 * Returns 401 for missing, expired, or invalid tokens
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authorization header missing'
        },
        timestamp: new Date().toISOString()
      });
    }

    // Check if header follows "Bearer <token>" format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authorization header must be in format: Bearer <token>'
        },
        timestamp: new Date().toISOString()
      });
    }

    const token = parts[1];

    // Verify JWT token
    const secret = process.env.JWT_SECRET || 'default-secret-change-in-production';
    
    try {
      const decoded = jwt.verify(token, secret);
      
      // Attach user data to request object
      req.user = {
        userId: decoded.userId,
        username: decoded.username,
        email: decoded.email
      };

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'JWT token has expired'
          },
          timestamp: new Date().toISOString()
        });
      }

      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: {
            code: 'TOKEN_INVALID',
            message: 'Invalid JWT token'
          },
          timestamp: new Date().toISOString()
        });
      }

      // Other JWT errors
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Token verification failed'
        },
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    // Unexpected errors
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred during authentication'
      },
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = authMiddleware;
