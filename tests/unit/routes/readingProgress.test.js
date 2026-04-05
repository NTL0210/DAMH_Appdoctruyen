const express = require('express');
const request = require('supertest');
const readingProgressRouter = require('../../../src/routes/readingProgress');
const readingProgressController = require('../../../src/controllers/readingProgressController');
const authMiddleware = require('../../../src/middleware/auth');

jest.mock('../../../src/controllers/readingProgressController');
jest.mock('../../../src/middleware/auth');

describe('Reading Progress Routes', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/reading-progress', readingProgressRouter);

    // Mock auth middleware to pass through
    authMiddleware.mockImplementation((req, res, next) => {
      req.user = { userId: 'user123', username: 'testuser', email: 'test@example.com' };
      next();
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /reading-progress', () => {
    it('should call updateProgress controller with auth', async () => {
      readingProgressController.updateProgress.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: {} });
      });

      const response = await request(app)
        .post('/reading-progress')
        .send({ comicId: 'comic456', chapterId: 'chapter789', chapterIndex: 5 });

      expect(authMiddleware).toHaveBeenCalled();
      expect(readingProgressController.updateProgress).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('should pass request body to controller', async () => {
      readingProgressController.updateProgress.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: {} });
      });

      await request(app)
        .post('/reading-progress')
        .send({ comicId: 'comic123', chapterId: 'chapter456', chapterIndex: 10 });

      expect(readingProgressController.updateProgress).toHaveBeenCalled();
      const req = readingProgressController.updateProgress.mock.calls[0][0];
      expect(req.body.comicId).toBe('comic123');
      expect(req.body.chapterId).toBe('chapter456');
      expect(req.body.chapterIndex).toBe(10);
    });
  });

  describe('GET /reading-progress/:comicId', () => {
    it('should call getProgress controller with auth', async () => {
      readingProgressController.getProgress.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: {} });
      });

      const response = await request(app).get('/reading-progress/comic456');

      expect(authMiddleware).toHaveBeenCalled();
      expect(readingProgressController.getProgress).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('should pass comicId parameter to controller', async () => {
      readingProgressController.getProgress.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: {} });
      });

      await request(app).get('/reading-progress/comic789');

      expect(readingProgressController.getProgress).toHaveBeenCalled();
      const req = readingProgressController.getProgress.mock.calls[0][0];
      expect(req.params.comicId).toBe('comic789');
    });
  });

  describe('GET /reading-progress', () => {
    it('should call getProgressList controller with auth', async () => {
      readingProgressController.getProgressList.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: [] });
      });

      const response = await request(app).get('/reading-progress');

      expect(authMiddleware).toHaveBeenCalled();
      expect(readingProgressController.getProgressList).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe('Route precedence', () => {
    it('should match GET /reading-progress before GET /reading-progress/:comicId', async () => {
      readingProgressController.getProgressList.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: [] });
      });
      readingProgressController.getProgress.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: {} });
      });

      await request(app).get('/reading-progress');

      expect(readingProgressController.getProgressList).toHaveBeenCalled();
      expect(readingProgressController.getProgress).not.toHaveBeenCalled();
    });
  });

  describe('Authentication requirement', () => {
    it('should require auth for POST /reading-progress', async () => {
      readingProgressController.updateProgress.mockImplementation((req, res) => {
        res.status(200).json({ success: true });
      });

      await request(app)
        .post('/reading-progress')
        .send({ comicId: 'comic123', chapterId: 'chapter456' });

      expect(authMiddleware).toHaveBeenCalled();
    });

    it('should require auth for GET /reading-progress/:comicId', async () => {
      readingProgressController.getProgress.mockImplementation((req, res) => {
        res.status(200).json({ success: true });
      });

      await request(app).get('/reading-progress/comic123');

      expect(authMiddleware).toHaveBeenCalled();
    });

    it('should require auth for GET /reading-progress', async () => {
      readingProgressController.getProgressList.mockImplementation((req, res) => {
        res.status(200).json({ success: true });
      });

      await request(app).get('/reading-progress');

      expect(authMiddleware).toHaveBeenCalled();
    });
  });
});
