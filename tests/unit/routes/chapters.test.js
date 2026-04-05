const express = require('express');
const request = require('supertest');
const chaptersRouter = require('../../../src/routes/chapters');
const chapterController = require('../../../src/controllers/chapterController');

jest.mock('../../../src/controllers/chapterController');

describe('Chapters Routes', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/chapters', chaptersRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /chapters/:id', () => {
    it('should call getChapterById controller', async () => {
      chapterController.getChapterById.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: {} });
      });

      const response = await request(app).get('/chapters/chapter-123');

      expect(chapterController.getChapterById).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('should pass id parameter to controller', async () => {
      chapterController.getChapterById.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: {} });
      });

      await request(app).get('/chapters/chapter-456');

      expect(chapterController.getChapterById).toHaveBeenCalled();
      const req = chapterController.getChapterById.mock.calls[0][0];
      expect(req.params.id).toBe('chapter-456');
    });
  });

  describe('GET /chapters/:id/pages', () => {
    it('should call getChapterPages controller', async () => {
      chapterController.getChapterPages.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: [] });
      });

      const response = await request(app).get('/chapters/chapter-123/pages');

      expect(chapterController.getChapterPages).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('should pass id parameter to controller', async () => {
      chapterController.getChapterPages.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: [] });
      });

      await request(app).get('/chapters/chapter-789/pages');

      expect(chapterController.getChapterPages).toHaveBeenCalled();
      const req = chapterController.getChapterPages.mock.calls[0][0];
      expect(req.params.id).toBe('chapter-789');
    });
  });

  describe('Route precedence', () => {
    it('should match /chapters/:id/pages before /chapters/:id', async () => {
      chapterController.getChapterPages.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: [] });
      });
      chapterController.getChapterById.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: {} });
      });

      await request(app).get('/chapters/chapter-123/pages');

      expect(chapterController.getChapterPages).toHaveBeenCalled();
      expect(chapterController.getChapterById).not.toHaveBeenCalled();
    });
  });
});
