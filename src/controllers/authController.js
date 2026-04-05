const authService = require('../services/authService');

/**
 * Auth Controller
 * Handles authentication operations
 */

/**
 * Register a new user
 * @route POST /auth/register
 */
exports.register = async (req, res, next) => {
  try {
    const email = req.body.email || req.body.mail;
    const username = req.body.username || req.body.userName;
    const { password } = req.body;

    // Validate input
    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Email, username, and password are required'
        }
      });
    }

    // Register user
    const user = await authService.register(email, username, password);

    // Generate token
    const token = await authService.generateJWT(user._id, user.username, user.email);

    const responseUser = {
      id: user._id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl || null
    };

    res.status(201).json({
      success: true,
      token,
      user: responseUser,
      data: {
        token,
        user: responseUser
      }
    });
  } catch (error) {
    // Handle validation errors
    if (error.message.includes('Invalid email format') ||
        error.message.includes('already exists')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: error.message
        }
      });
    }
    next(error);
  }
};

/**
 * Login with email/username and password
 * @route POST /auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const identifier =
      req.body.identifier ||
      req.body.loginName ||
      req.body.email ||
      req.body.mail ||
      req.body.username ||
      req.body.userName;
    const { password } = req.body;

    // Validate input
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Email/username and password are required'
        }
      });
    }

    // Login user
    const result = await authService.login(identifier, password);

    const responseUser = {
      id: result.user._id,
      username: result.user.username,
      email: result.user.email,
      avatarUrl: result.user.avatarUrl || null
    };

    res.json({
      success: true,
      token: result.token,
      user: responseUser,
      data: {
        token: result.token,
        user: responseUser
      }
    });
  } catch (error) {
    // Handle authentication errors
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email/username or password'
        }
      });
    }
    next(error);
  }
};

/**
 * Login with Google OAuth
 * @route POST /auth/google
 */
exports.loginWithGoogle = async (req, res, next) => {
  try {
    const idToken = req.body.idToken || req.body.token;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Google ID token is required'
        }
      });
    }

    // This would typically verify the token with Google
    // For now, return a placeholder response
    return res.status(501).json({
      success: false,
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Google OAuth not fully implemented. Use /auth/google/callback with passport'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Request password reset (generate OTP)
 * @route POST /auth/forgot-password
 */
exports.requestPasswordReset = async (req, res, next) => {
  try {
    const email = req.body.email || req.body.mail;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Email is required'
        }
      });
    }

    const result = await authService.requestPasswordReset(email);

    res.json({
      success: true,
      message: result.message,
      data: {
        message: result.message,
        // In production, don't return OTP to client
        ...(process.env.NODE_ENV !== 'production' && { otp: result.otp })
      }
    });
  } catch (error) {
    // Don't reveal if email exists
    if (error.message.includes('email exists')) {
      return res.json({
        success: true,
        data: {
          message: 'If the email exists, an OTP has been sent'
        }
      });
    }
    next(error);
  }
};

/**
 * Reset password with OTP
 * @route POST /auth/reset-password
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const email = req.body.email || req.body.mail;
    const { otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Email, OTP, and new password are required'
        }
      });
    }

    const result = await authService.resetPassword(email, otp, newPassword);

    res.json({
      success: true,
      message: result.message,
      data: {
        message: result.message
      }
    });
  } catch (error) {
    // Handle OTP errors
    if (error.message.includes('Invalid') || error.message.includes('expired')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_OTP',
          message: error.message
        }
      });
    }
    next(error);
  }
};
