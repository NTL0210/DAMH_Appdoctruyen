const express = require('express');
const request = require('supertest');
const profileRouter = require('../../../src/routes/profile');
const profileController = require('../../../src/controllers/profileController');
const auth = require('../../../src/middleware/auth');

jest.mock('../../../src/controllers/profileController');
jest.mock('../../../src/middleware/auth');

describe('Profile Routes', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/profile', profileRouter);

    // Mock auth middleware to pass through
    auth.mockImplementation((req, res, next) => {
      req.user = { userId: 'user123' };
      next();
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /profile', () => {
    it('should call getProfile controller', async () => {
      profileController.getProfile.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: {} });
      });

      const response = await request(app).get('/profile');

      expect(auth).toHaveBeenCalled();
      expect(profileController.getProfile).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('should have user in request from auth middleware', async () => {
      profileController.getProfile.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: {} });
      });

      await request(app).get('/profile');

      const req = profileController.getProfile.mock.calls[0][0];
      expect(req.user).toEqual({ userId: 'user123' });
    });
  });

  describe('PUT /profile/username', () => {
    it('should call updateUsername controller', async () => {
      profileController.updateUsername.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: {} });
      });

      const response = await request(app)
        .put('/profile/username')
        .send({ username: 'newusername' });

      expect(auth).toHaveBeenCalled();
      expect(profileController.updateUsername).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('should pass username in request body', async () => {
      profileController.updateUsername.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: {} });
      });

      await request(app)
        .put('/profile/username')
        .send({ username: 'testuser' });

      const req = profileController.updateUsername.mock.calls[0][0];
      expect(req.body.username).toBe('testuser');
    });
  });

  describe('POST /profile/avatar', () => {
    it('should call uploadAvatar controller', async () => {
      profileController.uploadAvatar.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: {} });
      });

      const response = await request(app)
        .post('/profile/avatar')
        .attach('avatar', Buffer.from('fake-image'), 'avatar.jpg');

      expect(auth).toHaveBeenCalled();
      expect(profileController.uploadAvatar).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });
});
