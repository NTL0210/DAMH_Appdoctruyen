const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const authService = require('../services/authService');
const logger = require('../utils/logger');

/**
 * Passport Google OAuth 2.0 strategy configuration
 * Implements Google authentication flow for user login/registration
 */

/**
 * Initialize Passport with Google OAuth strategy
 * @returns {void}
 */
const initializePassport = () => {
  // Check if Google OAuth is configured
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL;

  if (!googleClientId || !googleClientSecret || !googleCallbackUrl) {
    logger.warn('Google OAuth configuration missing - Google login will be disabled', {
      hasClientId: !!googleClientId,
      hasClientSecret: !!googleClientSecret,
      hasCallbackUrl: !!googleCallbackUrl
    });
    return; // Skip Google OAuth initialization
  }

  // Configure Google OAuth 2.0 strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: googleCallbackUrl,
        scope: ['profile', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          logger.info('Google OAuth callback received', {
            googleId: profile.id,
            email: profile.emails?.[0]?.value
          });

          // Use authService to handle Google authentication
          const result = await authService.handleGoogleCallback(profile);

          logger.info('Google OAuth authentication successful', {
            userId: result.user._id,
            email: result.user.email
          });

          // Pass user and token to done callback
          done(null, { user: result.user, token: result.token });
        } catch (error) {
          logger.error('Google OAuth authentication failed', {
            error: error.message,
            googleId: profile.id
          });
          done(error, null);
        }
      }
    )
  );

  // Serialize user for session (optional, mainly for session-based auth)
  // For JWT-based auth, this is minimal
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  // Deserialize user from session (optional)
  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  logger.info('Passport Google OAuth strategy initialized');
};

module.exports = {
  initializePassport
};
