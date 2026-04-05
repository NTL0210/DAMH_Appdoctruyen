const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// In-memory OTP storage (in production, use Redis)
const otpStore = new Map();

class AuthService {
  /**
   * Register a new user with email, username, and password
   * @param {string} email - User email
   * @param {string} username - User username
   * @param {string} password - Plain text password
   * @returns {Promise<Object>} Created user object (without password)
   */
  async register(email, username, password) {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Check for duplicate email or username
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }]
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        throw new Error('Email already exists');
      }
      if (existingUser.username === username) {
        throw new Error('Username already exists');
      }
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      username,
      password: hashedPassword
    });

    await user.save();

    // Return user without password
    const userObject = user.toObject();
    delete userObject.password;
    return userObject;
  }

  /**
   * Login with email/username and password
   * @param {string} identifier - Email or username
   * @param {string} password - Plain text password
   * @returns {Promise<Object>} { token, user }
   */
  async login(identifier, password) {
    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier }
      ]
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if user has a password (not Google OAuth only)
    if (!user.password) {
      throw new Error('Invalid credentials');
    }

    // Compare password
    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = await this.generateJWT(user._id, user.username, user.email);

    // Return token and user data (without password)
    const userObject = user.toObject();
    delete userObject.password;

    return {
      token,
      user: userObject
    };
  }

  /**
   * Login with Google ID token
   * @param {string} googleIdToken - Google ID token from client
   * @returns {Promise<Object>} { token, user }
   */
  async loginWithGoogle(googleIdToken) {
    // In a real implementation, verify the token with Google
    // For now, we'll decode it (assuming it's already verified by passport)
    // This method would typically be called after passport.authenticate('google')
    
    // This is a placeholder - in production, use Google OAuth library
    throw new Error('Google OAuth not fully implemented - use passport middleware');
  }

  /**
   * Handle Google OAuth callback (to be used with passport)
   * @param {Object} profile - Google profile from passport
   * @returns {Promise<Object>} { token, user }
   */
  async handleGoogleCallback(profile) {
    const { id: googleId, emails, displayName } = profile;
    const email = emails && emails[0] ? emails[0].value : null;

    if (!email) {
      throw new Error('Email not provided by Google');
    }

    // Find or create user
    let user = await User.findOne({ googleId });

    if (!user) {
      // Check if user exists with this email
      user = await User.findOne({ email: email.toLowerCase() });
      
      if (user) {
        // Link Google account to existing user
        user.googleId = googleId;
        await user.save();
      } else {
        // Create new user
        user = new User({
          email: email.toLowerCase(),
          username: displayName || email.split('@')[0],
          googleId
        });
        await user.save();
      }
    }

    // Generate JWT token
    const token = await this.generateJWT(user._id, user.username, user.email);

    // Return token and user data
    const userObject = user.toObject();
    delete userObject.password;

    return {
      token,
      user: userObject
    };
  }

  /**
   * Generate JWT token
   * @param {string} userId - User ID
   * @param {string} username - Username
   * @param {string} email - User email
   * @returns {Promise<string>} JWT token
   */
  async generateJWT(userId, username, email) {
    const payload = {
      userId: userId.toString(),
      username,
      email
    };

    const secret = process.env.JWT_SECRET || 'default-secret-change-in-production';
    const expiresIn = '7d'; // 7 days

    return jwt.sign(payload, secret, { expiresIn });
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Promise<Object>} Decoded token payload
   */
  async verifyJWT(token) {
    const secret = process.env.JWT_SECRET || 'default-secret-change-in-production';
    
    try {
      const decoded = jwt.verify(token, secret);
      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }

  /**
   * Request password reset - generates OTP and stores it
   * @param {string} email - User email
   * @returns {Promise<Object>} { otp, expiresAt }
   */
  async requestPasswordReset(email) {
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if email exists for security
      throw new Error('If the email exists, an OTP has been sent');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration to 15 minutes from now
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Store OTP in memory (in production, use Redis)
    otpStore.set(email.toLowerCase(), {
      otp,
      expiresAt,
      userId: user._id.toString()
    });

    // In production, send OTP via email service
    // await emailService.sendOTP(email, otp);

    return {
      otp, // Remove this in production - don't return OTP to client
      expiresAt,
      message: 'OTP sent to email'
    };
  }

  /**
   * Reset password with OTP
   * @param {string} email - User email
   * @param {string} otp - OTP code
   * @param {string} newPassword - New plain text password
   * @returns {Promise<Object>} Success message
   */
  async resetPassword(email, otp, newPassword) {
    const emailLower = email.toLowerCase();
    
    // Get OTP from store
    const otpData = otpStore.get(emailLower);

    if (!otpData) {
      throw new Error('Invalid or expired OTP');
    }

    // Check if OTP is expired
    if (new Date() > otpData.expiresAt) {
      otpStore.delete(emailLower);
      throw new Error('OTP has expired');
    }

    // Verify OTP
    if (otpData.otp !== otp) {
      throw new Error('Invalid OTP');
    }

    // Find user
    const user = await User.findById(otpData.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(newPassword);

    // Update password
    user.password = hashedPassword;
    await user.save();

    // Invalidate OTP
    otpStore.delete(emailLower);

    return {
      message: 'Password reset successful'
    };
  }

  /**
   * Hash password using bcrypt with 10 salt rounds
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  async hashPassword(password) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare plain password with hashed password
   * @param {string} plainPassword - Plain text password
   * @param {string} hashedPassword - Hashed password from database
   * @returns {Promise<boolean>} True if passwords match
   */
  async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = new AuthService();
