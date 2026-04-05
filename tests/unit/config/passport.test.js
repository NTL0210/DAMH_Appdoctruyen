const passport = require('passport');
const { initializePassport } = require('../../../src/config/passport');
const authService = require('../../../src/services/authService');

// Mock dependencies
jest.mock('passport');
jest.mock('passport-google-oauth20');
jest.mock('../../../src/services/authService');
jest.mock('../../../src/utils/logger');

describe('Passport Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    process.env = {
      ...originalEnv,
      GOOGLE_CLIENT_ID: 'test-client-id',
      GOOGLE_CLIENT_SECRET: 'test-client-secret',
      GOOGLE_CALLBACK_URL: 'http://localhost:3000/auth/google/callback'
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('initializePassport', () => {
    test('should initialize passport with Google strategy when all env vars are present', () => {
      initializePassport();

      expect(passport.use).toHaveBeenCalled();
      expect(passport.serializeUser).toHaveBeenCalled();
      expect(passport.deserializeUser).toHaveBeenCalled();
    });

    test('should throw error when GOOGLE_CLIENT_ID is missing', () => {
      delete process.env.GOOGLE_CLIENT_ID;

      expect(() => initializePassport()).toThrow(
        'GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL must be defined'
      );
    });

    test('should throw error when GOOGLE_CLIENT_SECRET is missing', () => {
      delete process.env.GOOGLE_CLIENT_SECRET;

      expect(() => initializePassport()).toThrow(
        'GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL must be defined'
      );
    });

    test('should throw error when GOOGLE_CALLBACK_URL is missing', () => {
      delete process.env.GOOGLE_CALLBACK_URL;

      expect(() => initializePassport()).toThrow(
        'GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL must be defined'
      );
    });

    test('should configure Google strategy with correct options', () => {
      const GoogleStrategy = require('passport-google-oauth20').Strategy;
      let strategyConfig;
      
      // Capture the strategy configuration
      GoogleStrategy.mockImplementation((config, callback) => {
        strategyConfig = config;
        return { name: 'google' };
      });

      initializePassport();

      expect(strategyConfig).toEqual({
        clientID: 'test-client-id',
        clientSecret: 'test-client-secret',
        callbackURL: 'http://localhost:3000/auth/google/callback',
        scope: ['profile', 'email']
      });
    });

    test('should handle successful Google OAuth callback', async () => {
      const GoogleStrategy = require('passport-google-oauth20').Strategy;
      let verifyCallback;

      // Capture the verify callback
      GoogleStrategy.mockImplementation((config, callback) => {
        verifyCallback = callback;
        return { name: 'google' };
      });

      const mockProfile = {
        id: 'google-123',
        emails: [{ value: 'test@example.com' }],
        displayName: 'Test User'
      };

      const mockResult = {
        user: {
          _id: 'user-123',
          email: 'test@example.com',
          username: 'Test User'
        },
        token: 'jwt-token-123'
      };

      authService.handleGoogleCallback.mockResolvedValue(mockResult);

      initializePassport();

      const done = jest.fn();
      await verifyCallback('access-token', 'refresh-token', mockProfile, done);

      expect(authService.handleGoogleCallback).toHaveBeenCalledWith(mockProfile);
      expect(done).toHaveBeenCalledWith(null, {
        user: mockResult.user,
        token: mockResult.token
      });
    });

    test('should handle Google OAuth callback error', async () => {
      const GoogleStrategy = require('passport-google-oauth20').Strategy;
      let verifyCallback;

      GoogleStrategy.mockImplementation((config, callback) => {
        verifyCallback = callback;
        return { name: 'google' };
      });

      const mockProfile = {
        id: 'google-123',
        emails: [{ value: 'test@example.com' }]
      };

      const mockError = new Error('Authentication failed');
      authService.handleGoogleCallback.mockRejectedValue(mockError);

      initializePassport();

      const done = jest.fn();
      await verifyCallback('access-token', 'refresh-token', mockProfile, done);

      expect(done).toHaveBeenCalledWith(mockError, null);
    });

    test('should serialize user correctly', () => {
      let serializeCallback;

      passport.serializeUser.mockImplementation((callback) => {
        serializeCallback = callback;
      });

      initializePassport();

      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const done = jest.fn();

      serializeCallback(mockUser, done);

      expect(done).toHaveBeenCalledWith(null, mockUser);
    });

    test('should deserialize user correctly', () => {
      let deserializeCallback;

      passport.deserializeUser.mockImplementation((callback) => {
        deserializeCallback = callback;
      });

      initializePassport();

      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const done = jest.fn();

      deserializeCallback(mockUser, done);

      expect(done).toHaveBeenCalledWith(null, mockUser);
    });
  });
});
