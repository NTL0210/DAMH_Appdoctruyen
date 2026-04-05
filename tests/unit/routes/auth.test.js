const express = require('express');
const request = require('supertest');
const authRouter = require('../../../src/routes/auth');
const authController = require('../../../src/controllers/authController');

jest.mock('../../../src/controllers/authController');

describe('Auth Routes', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/auth', authRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should call register controller', async () => {
      authController.register.mockImplementation((req, res) => {
        res.status(201).json({ success: true, data: {} });
      });

      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123'
        });

      expect(authController.register).toHaveBeenCalled();
      expect(response.status).toBe(201);
    });

    it('should pass registration data to controller', async () => {
      authController.register.mockImplementation((req, res) => {
        res.status(201).json({ success: true, data: {} });
      });

      await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123'
        });

      const req = authController.register.mock.calls[0][0];
      expect(req.body.email).toBe('test@example.com');
      expect(req.body.username).toBe('testuser');
      expect(req.body.password).toBe('password123');
    });
  });

  describe('POST /auth/login', () => {
    it('should call login controller', async () => {
      authController.login.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: {} });
      });

      const response = await request(app)
        .post('/auth/login')
        .send({
          identifier: 'testuser',
          password: 'password123'
        });

      expect(authController.login).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('should pass login credentials to controller', async () => {
      authController.login.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: {} });
      });

      await request(app)
        .post('/auth/login')
        .send({
          identifier: 'test@example.com',
          password: 'password123'
        });

      const req = authController.login.mock.calls[0][0];
      expect(req.body.identifier).toBe('test@example.com');
      expect(req.body.password).toBe('password123');
    });
  });

  describe('POST /auth/google', () => {
    it('should call loginWithGoogle controller', async () => {
      authController.loginWithGoogle.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: {} });
      });

      const response = await request(app)
        .post('/auth/google')
        .send({
          idToken: 'mock-google-token'
        });

      expect(authController.loginWithGoogle).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('should pass Google ID token to controller', async () => {
      authController.loginWithGoogle.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: {} });
      });

      await request(app)
        .post('/auth/google')
        .send({
          idToken: 'mock-google-token-123'
        });

      const req = authController.loginWithGoogle.mock.calls[0][0];
      expect(req.body.idToken).toBe('mock-google-token-123');
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should call requestPasswordReset controller', async () => {
      authController.requestPasswordReset.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: {} });
      });

      const response = await request(app)
        .post('/auth/forgot-password')
        .send({
          email: 'test@example.com'
        });

      expect(authController.requestPasswordReset).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('should pass email to controller', async () => {
      authController.requestPasswordReset.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: {} });
      });

      await request(app)
        .post('/auth/forgot-password')
        .send({
          email: 'test@example.com'
        });

      const req = authController.requestPasswordReset.mock.calls[0][0];
      expect(req.body.email).toBe('test@example.com');
    });
  });

  describe('POST /auth/reset-password', () => {
    it('should call resetPassword controller', async () => {
      authController.resetPassword.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: {} });
      });

      const response = await request(app)
        .post('/auth/reset-password')
        .send({
          email: 'test@example.com',
          otp: '123456',
          newPassword: 'newpassword123'
        });

      expect(authController.resetPassword).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('should pass reset data to controller', async () => {
      authController.resetPassword.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: {} });
      });

      await request(app)
        .post('/auth/reset-password')
        .send({
          email: 'test@example.com',
          otp: '123456',
          newPassword: 'newpassword123'
        });

      const req = authController.resetPassword.mock.calls[0][0];
      expect(req.body.email).toBe('test@example.com');
      expect(req.body.otp).toBe('123456');
      expect(req.body.newPassword).toBe('newpassword123');
    });
  });
});
