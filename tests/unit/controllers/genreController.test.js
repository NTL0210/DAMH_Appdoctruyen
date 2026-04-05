const genreController = require('../../../src/controllers/genreController');
const Genre = require('../../../src/models/Genre');
const cacheService = require('../../../src/services/cacheService');

jest.mock('../../../src/models/Genre');
jest.mock('../../../src/services/cacheService');

describe('GenreController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getGenres', () => {
    it('should return cached genres when available', async () => {
      const mockGenres = [
        { genreId: '1', name: 'Action', slug: 'action' },
        { genreId: '2', name: 'Comedy', slug: 'comedy' }
      ];

      cacheService.get.mockResolvedValue(mockGenres);

      await genreController.getGenres(req, res, next);

      expect(cacheService.get).toHaveBeenCalledWith('genres:all');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockGenres,
        cached: true
      });
      expect(Genre.find).not.toHaveBeenCalled();
    });

    it('should fetch from database and cache when cache miss', async () => {
      const mockGenres = [
        { genreId: '1', name: 'Action', slug: 'action' },
        { genreId: '2', name: 'Comedy', slug: 'comedy' },
        { genreId: '3', name: 'Drama', slug: 'drama' }
      ];

      cacheService.get.mockResolvedValue(null);
      Genre.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockGenres)
      });
      cacheService.set.mockResolvedValue();

      await genreController.getGenres(req, res, next);

      expect(cacheService.get).toHaveBeenCalledWith('genres:all');
      expect(Genre.find).toHaveBeenCalledWith({});
      expect(cacheService.set).toHaveBeenCalledWith('genres:all', mockGenres, 3600);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockGenres,
        cached: false
      });
    });

    it('should sort genres alphabetically by name', async () => {
      const mockGenres = [
        { genreId: '1', name: 'Action', slug: 'action' },
        { genreId: '2', name: 'Comedy', slug: 'comedy' }
      ];

      cacheService.get.mockResolvedValue(null);
      
      const mockSort = jest.fn().mockReturnThis();
      const mockLean = jest.fn().mockResolvedValue(mockGenres);
      
      Genre.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: mockSort,
        lean: mockLean
      });
      
      cacheService.set.mockResolvedValue();

      await genreController.getGenres(req, res, next);

      expect(mockSort).toHaveBeenCalledWith({ name: 1 });
    });

    it('should return empty array when no genres exist', async () => {
      cacheService.get.mockResolvedValue(null);
      Genre.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      });
      cacheService.set.mockResolvedValue();

      await genreController.getGenres(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [],
        cached: false
      });
    });

    it('should call next with error on exception', async () => {
      const error = new Error('Database error');
      cacheService.get.mockRejectedValue(error);

      await genreController.getGenres(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should still work if cache set fails', async () => {
      const mockGenres = [
        { genreId: '1', name: 'Action', slug: 'action' }
      ];

      cacheService.get.mockResolvedValue(null);
      Genre.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockGenres)
      });
      cacheService.set.mockRejectedValue(new Error('Cache error'));

      await genreController.getGenres(req, res, next);

      // Should still return data even if caching fails
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
