const authService = require('../../../src/services/authService');
const User = require('../../../src/models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('../../../src/models/User');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user with valid credentials', async () => {
      const email = 'test@example.com';
      const username = 'testuser';
      const password = 'password123';
      const hashedPassword = 'hashed_password';

      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue(hashedPassword);
      
      const mockUser = {
        _id: 'user123',
        email: email.toLowerCase(),
        username,
        password: hashedPassword,
        toObject: jest.fn().mockReturnValue({
          _id: 'user123',
          email: email.toLowerCase(),
          username,
          password: hashedPassword
        }),
        save: jest.fn().mockResolvedValue(true)
      };

      User.mockImplementation(() => mockUser);

      const result = await authService.register(email, username, password);

      expect(User.findOne).toHaveBeenCalledWith({
        $or: [{ email: email.toLowerCase() }, { username }]
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(result).toEqual({
        _id: 'user123',
        email: email.toLowerCase(),
        username
      });
      expect(result.password).toBeUndefined();
    });

    it('should reject registration with invalid email format', async () => {
      await expect(
        authService.register('invalid-email', 'testuser', 'password123')
      ).rejects.toThrow('Invalid email format');
    });

    it('should reject registration with duplicate email', async () => {
      User.findOne.mockResolvedValue({
        email: 'test@example.com',
        username: 'existinguser'
      });

      await expect(
        authService.register('test@example.com', 'newuser', 'password123')
      ).rejects.toThrow('Email already exists');
    });

    it('should reject registration with duplicate username', async () => {
      User.findOne.mockResolvedValue({
        email: 'other@example.com',
        username: 'testuser'
      });

      await expect(
        authService.register('new@example.com', 'testuser', 'password123')
      ).rejects.toThrow('Username already exists');
    });
  });

  describe('login', () => {
    it('should login with valid email and password', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = 'hashed_password';
      const token = 'jwt_token';

      const mockUser = {
        _id: 'user123',
        email,
        username: 'testuser',
        password: hashedPassword,
        toObject: jest.fn().mockReturnValue({
          _id: 'user123',
          email,
          username: 'testuser',
          password: hashedPassword
        })
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue(token);

      const result = await authService.login(email, password);

      expect(User.findOne).toHaveBeenCalledWith({
        $or: [{ email: email.toLowerCase() }, { username: email }]
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(jwt.sign).toHaveBeenCalled();
      expect(result).toEqual({
        token,
        user: {
          _id: 'user123',
          email,
          username: 'testuser'
        }
      });
      expect(result.user.password).toBeUndefined();
    });

    it('should login with valid username and password', async () => {
      const username = 'testuser';
      const password = 'password123';
      const hashedPassword = 'hashed_password';
      const token = 'jwt_token';

      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        username,
        password: hashedPassword,
        toObject: jest.fn().mockReturnValue({
          _id: 'user123',
          email: 'test@example.com',
          username,
          password: hashedPassword
        })
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue(token);

      const result = await authService.login(username, password);

      expect(result.token).toBe(token);
      expect(result.user.username).toBe(username);
    });

    it('should reject login with non-existent user', async () => {
      User.findOne.mockResolvedValue(null);

      await expect(
        authService.login('nonexistent@example.com', 'password123')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should reject login with incorrect password', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashed_password'
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        authService.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should reject login for Google OAuth only users', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        username: 'testuser',
        googleId: 'google123',
        password: null
      };

      User.findOne.mockResolvedValue(mockUser);

      await expect(
        authService.login('test@example.com', 'password123')
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('generateJWT', () => {
    it('should generate JWT with correct payload and 7-day expiration', async () => {
      const userId = 'user123';
      const username = 'testuser';
      const email = 'test@example.com';
      const token = 'jwt_token';

      jwt.sign.mockReturnValue(token);

      const result = await authService.generateJWT(userId, username, email);

      expect(jwt.sign).toHaveBeenCalledWith(
        {
          userId,
          username,
          email
        },
        expect.any(String),
        { expiresIn: '7d' }
      );
      expect(result).toBe(token);
    });
  });

  describe('verifyJWT', () => {
    it('should verify valid JWT token', async () => {
      const token = 'valid_token';
      const decoded = {
        userId: 'user123',
        username: 'testuser',
        email: 'test@example.com'
      };

      jwt.verify.mockReturnValue(decoded);

      const result = await authService.verifyJWT(token);

      expect(jwt.verify).toHaveBeenCalledWith(token, expect.any(String));
      expect(result).toEqual(decoded);
    });

    it('should throw error for expired token', async () => {
      const token = 'expired_token';
      const error = new Error('jwt expired');
      error.name = 'TokenExpiredError';

      jwt.verify.mockImplementation(() => {
        throw error;
      });

      await expect(authService.verifyJWT(token)).rejects.toThrow('Token expired');
    });

    it('should throw error for invalid token', async () => {
      const token = 'invalid_token';
      const error = new Error('invalid token');
      error.name = 'JsonWebTokenError';

      jwt.verify.mockImplementation(() => {
        throw error;
      });

      await expect(authService.verifyJWT(token)).rejects.toThrow('Invalid token');
    });
  });

  describe('requestPasswordReset', () => {
    it('should generate OTP with 15-minute expiration', async () => {
      const email = 'test@example.com';
      const mockUser = {
        _id: 'user123',
        email
      };

      User.findOne.mockResolvedValue(mockUser);

      const result = await authService.requestPasswordReset(email);

      expect(User.findOne).toHaveBeenCalledWith({ email: email.toLowerCase() });
      expect(result.otp).toMatch(/^\d{6}$/); // 6-digit OTP
      expect(result.expiresAt).toBeInstanceOf(Date);
      
      const expirationTime = result.expiresAt.getTime() - Date.now();
      expect(expirationTime).toBeGreaterThan(14 * 60 * 1000); // At least 14 minutes
      expect(expirationTime).toBeLessThanOrEqual(15 * 60 * 1000); // At most 15 minutes
    });

    it('should not reveal if email does not exist', async () => {
      User.findOne.mockResolvedValue(null);

      await expect(
        authService.requestPasswordReset('nonexistent@example.com')
      ).rejects.toThrow('If the email exists, an OTP has been sent');
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid OTP', async () => {
      const email = 'test@example.com';
      const otp = '123456';
      const newPassword = 'newpassword123';
      const hashedPassword = 'new_hashed_password';

      const mockUser = {
        _id: 'user123',
        email,
        password: 'old_hashed_password',
        save: jest.fn().mockResolvedValue(true)
      };

      User.findOne.mockResolvedValue(mockUser);
      User.findById.mockResolvedValue(mockUser);
      bcrypt.hash.mockResolvedValue(hashedPassword);

      // First request OTP
      await authService.requestPasswordReset(email);

      // Get the generated OTP from the previous call
      const resetResult = await authService.requestPasswordReset(email);
      const validOtp = resetResult.otp;

      // Reset password with valid OTP
      const result = await authService.resetPassword(email, validOtp, newPassword);

      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(mockUser.password).toBe(hashedPassword);
      expect(mockUser.save).toHaveBeenCalled();
      expect(result.message).toBe('Password reset successful');
    });

    it('should reject reset with invalid OTP', async () => {
      const email = 'test@example.com';
      const mockUser = {
        _id: 'user123',
        email
      };

      User.findOne.mockResolvedValue(mockUser);

      // Request OTP
      await authService.requestPasswordReset(email);

      // Try to reset with wrong OTP
      await expect(
        authService.resetPassword(email, '999999', 'newpassword123')
      ).rejects.toThrow('Invalid OTP');
    });

    it('should reject reset with expired OTP', async () => {
      const email = 'test@example.com';
      const mockUser = {
        _id: 'user123',
        email
      };

      User.findOne.mockResolvedValue(mockUser);

      // Request OTP
      const resetData = await authService.requestPasswordReset(email);

      // Simulate OTP expiration by waiting (mock time)
      jest.useFakeTimers();
      jest.advanceTimersByTime(16 * 60 * 1000); // 16 minutes

      await expect(
        authService.resetPassword(email, resetData.otp, 'newpassword123')
      ).rejects.toThrow('OTP has expired');

      jest.useRealTimers();
    });

    it('should reject reset with non-existent OTP', async () => {
      await expect(
        authService.resetPassword('test@example.com', '123456', 'newpassword123')
      ).rejects.toThrow('Invalid or expired OTP');
    });
  });

  describe('hashPassword', () => {
    it('should hash password with 10 salt rounds', async () => {
      const password = 'password123';
      const hashedPassword = 'hashed_password';

      bcrypt.hash.mockResolvedValue(hashedPassword);

      const result = await authService.hashPassword(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(result).toBe(hashedPassword);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching passwords', async () => {
      const plainPassword = 'password123';
      const hashedPassword = 'hashed_password';

      bcrypt.compare.mockResolvedValue(true);

      const result = await authService.comparePassword(plainPassword, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      const plainPassword = 'password123';
      const hashedPassword = 'hashed_password';

      bcrypt.compare.mockResolvedValue(false);

      const result = await authService.comparePassword(plainPassword, hashedPassword);

      expect(result).toBe(false);
    });
  });

  describe('handleGoogleCallback', () => {
    it('should create new user for first-time Google login', async () => {
      const profile = {
        id: 'google123',
        emails: [{ value: 'test@example.com' }],
        displayName: 'Test User'
      };

      User.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        username: 'Test User',
        googleId: 'google123',
        toObject: jest.fn().mockReturnValue({
          _id: 'user123',
          email: 'test@example.com',
          username: 'Test User',
          googleId: 'google123'
        }),
        save: jest.fn().mockResolvedValue(true)
      };

      User.mockImplementation(() => mockUser);
      jwt.sign.mockReturnValue('jwt_token');

      const result = await authService.handleGoogleCallback(profile);

      expect(result.token).toBe('jwt_token');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.googleId).toBe('google123');
    });

    it('should link Google account to existing email user', async () => {
      const profile = {
        id: 'google123',
        emails: [{ value: 'test@example.com' }],
        displayName: 'Test User'
      };

      const existingUser = {
        _id: 'user123',
        email: 'test@example.com',
        username: 'testuser',
        googleId: null,
        toObject: jest.fn().mockReturnValue({
          _id: 'user123',
          email: 'test@example.com',
          username: 'testuser',
          googleId: 'google123'
        }),
        save: jest.fn().mockResolvedValue(true)
      };

      User.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(existingUser);
      jwt.sign.mockReturnValue('jwt_token');

      const result = await authService.handleGoogleCallback(profile);

      expect(existingUser.googleId).toBe('google123');
      expect(existingUser.save).toHaveBeenCalled();
      expect(result.token).toBe('jwt_token');
    });

    it('should return existing user for repeat Google login', async () => {
      const profile = {
        id: 'google123',
        emails: [{ value: 'test@example.com' }],
        displayName: 'Test User'
      };

      const existingUser = {
        _id: 'user123',
        email: 'test@example.com',
        username: 'testuser',
        googleId: 'google123',
        toObject: jest.fn().mockReturnValue({
          _id: 'user123',
          email: 'test@example.com',
          username: 'testuser',
          googleId: 'google123'
        })
      };

      User.findOne.mockResolvedValue(existingUser);
      jwt.sign.mockReturnValue('jwt_token');

      const result = await authService.handleGoogleCallback(profile);

      expect(result.token).toBe('jwt_token');
      expect(result.user.googleId).toBe('google123');
    });

    it('should throw error if Google does not provide email', async () => {
      const profile = {
        id: 'google123',
        emails: [],
        displayName: 'Test User'
      };

      await expect(
        authService.handleGoogleCallback(profile)
      ).rejects.toThrow('Email not provided by Google');
    });
  });
});
