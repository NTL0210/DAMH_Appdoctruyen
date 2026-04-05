const jwt = require('jsonwebtoken');
const authMiddleware = require('../../../src/middleware/auth');

describe('Auth Middleware', () => {
  let req, res, next;
  const JWT_SECRET = 'test-secret';

  beforeEach(() => {
    // Set up test environment
    process.env.JWT_SECRET = JWT_SECRET;

    // Mock request, response, and next
    req = {
      headers: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Valid Token', () => {
    test('should attach user data to request and call next() for valid token', async () => {
      const payload = {
        userId: '123',
        username: 'testuser',
        email: 'test@example.com'
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
      req.headers.authorization = `Bearer ${token}`;

      await authMiddleware(req, res, next);

      expect(req.user).toEqual({
        userId: '123',
        username: 'testuser',
        email: 'test@example.com'
      });
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should handle token with all required fields', async () => {
      const payload = {
        userId: 'user-456',
        username: 'anotheruser',
        email: 'another@test.com'
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
      req.headers.authorization = `Bearer ${token}`;

      await authMiddleware(req, res, next);

      expect(req.user.userId).toBe('user-456');
      expect(req.user.username).toBe('anotheruser');
      expect(req.user.email).toBe('another@test.com');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Missing Authorization Header', () => {
    test('should return 401 when Authorization header is missing', async () => {
      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authorization header missing'
        },
        timestamp: expect.any(String)
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Invalid Authorization Header Format', () => {
    test('should return 401 when Authorization header does not start with Bearer', async () => {
      req.headers.authorization = 'InvalidFormat token123';

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authorization header must be in format: Bearer <token>'
        },
        timestamp: expect.any(String)
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 when Authorization header has only Bearer without token', async () => {
      req.headers.authorization = 'Bearer';

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authorization header must be in format: Bearer <token>'
        },
        timestamp: expect.any(String)
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 when Authorization header has extra parts', async () => {
      req.headers.authorization = 'Bearer token extra';

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authorization header must be in format: Bearer <token>'
        },
        timestamp: expect.any(String)
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Expired Token', () => {
    test('should return 401 with TOKEN_EXPIRED for expired token', async () => {
      const payload = {
        userId: '123',
        username: 'testuser',
        email: 'test@example.com'
      };

      // Create token that expires immediately
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '0s' });
      req.headers.authorization = `Bearer ${token}`;

      // Wait a bit to ensure token is expired
      await new Promise(resolve => setTimeout(resolve, 100));

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'JWT token has expired'
        },
        timestamp: expect.any(String)
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Invalid Token', () => {
    test('should return 401 with TOKEN_INVALID for malformed token', async () => {
      req.headers.authorization = 'Bearer invalid.token.here';

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'TOKEN_INVALID',
          message: 'Invalid JWT token'
        },
        timestamp: expect.any(String)
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 with TOKEN_INVALID for token signed with wrong secret', async () => {
      const payload = {
        userId: '123',
        username: 'testuser',
        email: 'test@example.com'
      };

      const token = jwt.sign(payload, 'wrong-secret', { expiresIn: '7d' });
      req.headers.authorization = `Bearer ${token}`;

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'TOKEN_INVALID',
          message: 'Invalid JWT token'
        },
        timestamp: expect.any(String)
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 for empty token', async () => {
      req.headers.authorization = 'Bearer ';

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'TOKEN_INVALID',
          message: 'Invalid JWT token'
        },
        timestamp: expect.any(String)
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    test('should handle token with missing userId field', async () => {
      const payload = {
        username: 'testuser',
        email: 'test@example.com'
        // userId is missing
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
      req.headers.authorization = `Bearer ${token}`;

      await authMiddleware(req, res, next);

      expect(req.user).toEqual({
        userId: undefined,
        username: 'testuser',
        email: 'test@example.com'
      });
      expect(next).toHaveBeenCalled();
    });

    test('should handle lowercase bearer in Authorization header', async () => {
      const payload = {
        userId: '123',
        username: 'testuser',
        email: 'test@example.com'
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
      req.headers.authorization = `bearer ${token}`;

      await authMiddleware(req, res, next);

      // Should fail because we expect "Bearer" with capital B
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
