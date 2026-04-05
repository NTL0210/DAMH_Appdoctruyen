const authController = require('../../../src/controllers/authController');
const authService = require('../../../src/services/authService');

jest.mock('../../../src/services/authService');

describe('AuthController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      req.body = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      };

      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        username: 'testuser',
        avatarUrl: null
      };

      authService.register.mockResolvedValue(mockUser);
      authService.generateJWT.mockResolvedValue('mock-jwt-token');

      await authController.register(req, res, next);

      expect(authService.register).toHaveBeenCalledWith('test@example.com', 'testuser', 'password123');
      expect(authService.generateJWT).toHaveBeenCalledWith('user123', 'testuser', 'test@example.com');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          token: 'mock-jwt-token',
          user: {
            id: 'user123',
            username: 'testuser',
            email: 'test@example.com',
            avatarUrl: null
          }
        }
      });
    });

    it('should return 400 when email is missing', async () => {
      req.body = {
        username: 'testuser',
        password: 'password123'
      };

      await authController.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Email, username, and password are required'
        }
      });
    });

    it('should return 400 when username is missing', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      await authController.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Email, username, and password are required'
        }
      });
    });

    it('should return 400 when password is missing', async () => {
      req.body = {
        email: 'test@example.com',
        username: 'testuser'
      };

      await authController.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Email, username, and password are required'
        }
      });
    });

    it('should return 400 for invalid email format', async () => {
      req.body = {
        email: 'invalid-email',
        username: 'testuser',
        password: 'password123'
      };

      authService.register.mockRejectedValue(new Error('Invalid email format'));

      await authController.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Invalid email format'
        }
      });
    });

    it('should return 400 when email already exists', async () => {
      req.body = {
        email: 'existing@example.com',
        username: 'testuser',
        password: 'password123'
      };

      authService.register.mockRejectedValue(new Error('Email already exists'));

      await authController.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Email already exists'
        }
      });
    });

    it('should return 400 when username already exists', async () => {
      req.body = {
        email: 'test@example.com',
        username: 'existinguser',
        password: 'password123'
      };

      authService.register.mockRejectedValue(new Error('Username already exists'));

      await authController.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Username already exists'
        }
      });
    });

    it('should call next with error on unexpected exception', async () => {
      req.body = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      };

      const error = new Error('Database error');
      authService.register.mockRejectedValue(error);

      await authController.register(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      req.body = {
        identifier: 'testuser',
        password: 'password123'
      };

      const mockResult = {
        token: 'mock-jwt-token',
        user: {
          _id: 'user123',
          email: 'test@example.com',
          username: 'testuser',
          avatarUrl: null
        }
      };

      authService.login.mockResolvedValue(mockResult);

      await authController.login(req, res, next);

      expect(authService.login).toHaveBeenCalledWith('testuser', 'password123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          token: 'mock-jwt-token',
          user: {
            id: 'user123',
            username: 'testuser',
            email: 'test@example.com',
            avatarUrl: null
          }
        }
      });
    });

    it('should return 400 when identifier is missing', async () => {
      req.body = {
        password: 'password123'
      };

      await authController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Email/username and password are required'
        }
      });
    });

    it('should return 400 when password is missing', async () => {
      req.body = {
        identifier: 'testuser'
      };

      await authController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Email/username and password are required'
        }
      });
    });

    it('should return 401 for invalid credentials', async () => {
      req.body = {
        identifier: 'testuser',
        password: 'wrongpassword'
      };

      authService.login.mockRejectedValue(new Error('Invalid credentials'));

      await authController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email/username or password'
        }
      });
    });

    it('should call next with error on unexpected exception', async () => {
      req.body = {
        identifier: 'testuser',
        password: 'password123'
      };

      const error = new Error('Database error');
      authService.login.mockRejectedValue(error);

      await authController.login(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('loginWithGoogle', () => {
    it('should return 400 when idToken is missing', async () => {
      req.body = {};

      await authController.loginWithGoogle(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Google ID token is required'
        }
      });
    });

    it('should return 501 not implemented', async () => {
      req.body = {
        idToken: 'mock-google-token'
      };

      await authController.loginWithGoogle(req, res, next);

      expect(res.status).toHaveBeenCalledWith(501);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_IMPLEMENTED',
          message: 'Google OAuth not fully implemented. Use /auth/google/callback with passport'
        }
      });
    });
  });

  describe('requestPasswordReset', () => {
    it('should request password reset successfully', async () => {
      req.body = {
        email: 'test@example.com'
      };

      authService.requestPasswordReset.mockResolvedValue({
        otp: '123456',
        message: 'OTP sent to email'
      });

      // Set NODE_ENV to development to return OTP
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      await authController.requestPasswordReset(req, res, next);

      expect(authService.requestPasswordReset).toHaveBeenCalledWith('test@example.com');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          message: 'OTP sent to email',
          otp: '123456'
        }
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should not return OTP in production', async () => {
      req.body = {
        email: 'test@example.com'
      };

      authService.requestPasswordReset.mockResolvedValue({
        otp: '123456',
        message: 'OTP sent to email'
      });

      // Set NODE_ENV to production
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      await authController.requestPasswordReset(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          message: 'OTP sent to email'
        }
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should return 400 when email is missing', async () => {
      req.body = {};

      await authController.requestPasswordReset(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Email is required'
        }
      });
    });

    it('should not reveal if email exists', async () => {
      req.body = {
        email: 'nonexistent@example.com'
      };

      authService.requestPasswordReset.mockRejectedValue(new Error('If the email exists, an OTP has been sent'));

      await authController.requestPasswordReset(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          message: 'If the email exists, an OTP has been sent'
        }
      });
    });

    it('should call next with error on unexpected exception', async () => {
      req.body = {
        email: 'test@example.com'
      };

      const error = new Error('Email service error');
      authService.requestPasswordReset.mockRejectedValue(error);

      await authController.requestPasswordReset(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      req.body = {
        email: 'test@example.com',
        otp: '123456',
        newPassword: 'newpassword123'
      };

      authService.resetPassword.mockResolvedValue({
        message: 'Password reset successful'
      });

      await authController.resetPassword(req, res, next);

      expect(authService.resetPassword).toHaveBeenCalledWith('test@example.com', '123456', 'newpassword123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          message: 'Password reset successful'
        }
      });
    });

    it('should return 400 when email is missing', async () => {
      req.body = {
        otp: '123456',
        newPassword: 'newpassword123'
      };

      await authController.resetPassword(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Email, OTP, and new password are required'
        }
      });
    });

    it('should return 400 when OTP is missing', async () => {
      req.body = {
        email: 'test@example.com',
        newPassword: 'newpassword123'
      };

      await authController.resetPassword(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Email, OTP, and new password are required'
        }
      });
    });

    it('should return 400 when newPassword is missing', async () => {
      req.body = {
        email: 'test@example.com',
        otp: '123456'
      };

      await authController.resetPassword(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Email, OTP, and new password are required'
        }
      });
    });

    it('should return 400 for invalid OTP', async () => {
      req.body = {
        email: 'test@example.com',
        otp: 'wrong',
        newPassword: 'newpassword123'
      };

      authService.resetPassword.mockRejectedValue(new Error('Invalid OTP'));

      await authController.resetPassword(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_OTP',
          message: 'Invalid OTP'
        }
      });
    });

    it('should return 400 for expired OTP', async () => {
      req.body = {
        email: 'test@example.com',
        otp: '123456',
        newPassword: 'newpassword123'
      };

      authService.resetPassword.mockRejectedValue(new Error('OTP has expired'));

      await authController.resetPassword(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_OTP',
          message: 'OTP has expired'
        }
      });
    });

    it('should call next with error on unexpected exception', async () => {
      req.body = {
        email: 'test@example.com',
        otp: '123456',
        newPassword: 'newpassword123'
      };

      const error = new Error('Database error');
      authService.resetPassword.mockRejectedValue(error);

      await authController.resetPassword(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
