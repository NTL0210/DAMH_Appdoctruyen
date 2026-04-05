const express = require('express');
const request = require('supertest');
const genresRouter = require('../../../src/routes/genres');
const genreController = require('../../../src/controllers/genreController');

jest.mock('../../../src/controllers/genreController');

describe('Genres Routes', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/genres', genresRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /genres', () => {
    it('should call getGenres controller', async () => {
      genreController.getGenres.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: [] });
      });

      const response = await request(app).get('/genres');

      expect(genreController.getGenres).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('should return genres data', async () => {
      const mockGenres = [
        { genreId: '1', name: 'Action', slug: 'action' },
        { genreId: '2', name: 'Comedy', slug: 'comedy' }
      ];

      genreController.getGenres.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: mockGenres });
      });

      const response = await request(app).get('/genres');

      expect(response.body).toEqual({
        success: true,
        data: mockGenres
      });
    });
  });
});
