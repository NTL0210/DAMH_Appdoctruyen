const express = require('express');
const request = require('supertest');
const comicsRouter = require('../../../src/routes/comics');
const comicController = require('../../../src/controllers/comicController');
const chapterController = require('../../../src/controllers/chapterController');

jest.mock('../../../src/controllers/comicController');
jest.mock('../../../src/controllers/chapterController');

describe('Comics Routes', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/comics', comicsRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /comics', () => {
    it('should call getComics controller', async () => {
      comicController.getComics.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: [] });
      });

      const response = await request(app).get('/comics');

      expect(comicController.getComics).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('should pass query parameters to controller', async () => {
      comicController.getComics.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: [] });
      });

      await request(app).get('/comics?page=2&limit=10&genreId=genre-123');

      expect(comicController.getComics).toHaveBeenCalled();
      const req = comicController.getComics.mock.calls[0][0];
      expect(req.query.page).toBe('2');
      expect(req.query.limit).toBe('10');
      expect(req.query.genreId).toBe('genre-123');
    });
  });

  describe('GET /comics/search', () => {
    it('should call searchComics controller', async () => {
      comicController.searchComics.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: [] });
      });

      const response = await request(app).get('/comics/search?keyword=naruto');

      expect(comicController.searchComics).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('should pass search keyword to controller', async () => {
      comicController.searchComics.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: [] });
      });

      await request(app).get('/comics/search?keyword=one%20piece');

      expect(comicController.searchComics).toHaveBeenCalled();
      const req = comicController.searchComics.mock.calls[0][0];
      expect(req.query.keyword).toBe('one piece');
    });
  });

  describe('GET /comics/slug/:slug', () => {
    it('should call getComicBySlug controller', async () => {
      comicController.getComicBySlug.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: {} });
      });

      const response = await request(app).get('/comics/slug/test-comic');

      expect(comicController.getComicBySlug).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('should pass slug parameter to controller', async () => {
      comicController.getComicBySlug.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: {} });
      });

      await request(app).get('/comics/slug/naruto-shippuden');

      expect(comicController.getComicBySlug).toHaveBeenCalled();
      const req = comicController.getComicBySlug.mock.calls[0][0];
      expect(req.params.slug).toBe('naruto-shippuden');
    });
  });

  describe('GET /comics/:id', () => {
    it('should call getComicById controller', async () => {
      comicController.getComicById.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: {} });
      });

      const response = await request(app).get('/comics/123');

      expect(comicController.getComicById).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('should pass id parameter to controller', async () => {
      comicController.getComicById.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: {} });
      });

      await request(app).get('/comics/comic-456');

      expect(comicController.getComicById).toHaveBeenCalled();
      const req = comicController.getComicById.mock.calls[0][0];
      expect(req.params.id).toBe('comic-456');
    });
  });

  describe('Route precedence', () => {
    it('should match /comics/search before /comics/:id', async () => {
      comicController.searchComics.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: [] });
      });
      comicController.getComicById.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: {} });
      });

      await request(app).get('/comics/search?keyword=test');

      expect(comicController.searchComics).toHaveBeenCalled();
      expect(comicController.getComicById).not.toHaveBeenCalled();
    });

    it('should match /comics/slug/:slug before /comics/:id', async () => {
      comicController.getComicBySlug.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: {} });
      });
      comicController.getComicById.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: {} });
      });

      await request(app).get('/comics/slug/test-slug');

      expect(comicController.getComicBySlug).toHaveBeenCalled();
      expect(comicController.getComicById).not.toHaveBeenCalled();
    });
  });

  describe('GET /comics/:comicId/chapters', () => {
    it('should call getChaptersByComicId controller', async () => {
      chapterController.getChaptersByComicId.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: [] });
      });

      const response = await request(app).get('/comics/comic-123/chapters');

      expect(chapterController.getChaptersByComicId).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('should pass comicId parameter to controller', async () => {
      chapterController.getChaptersByComicId.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: [] });
      });

      await request(app).get('/comics/comic-456/chapters');

      expect(chapterController.getChaptersByComicId).toHaveBeenCalled();
      const req = chapterController.getChaptersByComicId.mock.calls[0][0];
      expect(req.params.comicId).toBe('comic-456');
    });
  });
});
