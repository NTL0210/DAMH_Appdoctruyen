const comicController = require('../../../src/controllers/comicController');
const comicService = require('../../../src/services/comicService');

jest.mock('../../../src/services/comicService');
jest.mock('../../../src/utils/logger');

describe('ComicController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('getComics', () => {
    it('should return paginated comics successfully', async () => {
      const mockResult = {
        data: [{ comicId: '1', name: 'Comic 1' }],
        pagination: { pageNumber: 1, pageSize: 20, totalPages: 1, totalElements: 1 }
      };

      comicService.getComics.mockResolvedValue(mockResult);
      req.query = { page: 1, limit: 20 };

      await comicController.getComics(req, res);

      expect(comicService.getComics).toHaveBeenCalledWith(1, 20, undefined);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult.data,
        pagination: mockResult.pagination
      });
    });

    it('should handle genre filter', async () => {
      const mockResult = {
        data: [],
        pagination: { pageNumber: 1, pageSize: 20, totalPages: 0, totalElements: 0 }
      };

      comicService.getComics.mockResolvedValue(mockResult);
      req.query = { page: 1, limit: 20, genreId: 'genre-123' };

      await comicController.getComics(req, res);

      expect(comicService.getComics).toHaveBeenCalledWith(1, 20, 'genre-123');
    });

    it('should handle service errors', async () => {
      comicService.getComics.mockRejectedValue(new Error('Database error'));

      await comicController.getComics(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve comics'
        }
      });
    });
  });

  describe('getComicById', () => {
    it('should return comic by ID successfully', async () => {
      const mockComic = { comicId: '123', name: 'Test Comic' };

      comicService.getComicById.mockResolvedValue(mockComic);
      req.params.id = '123';

      await comicController.getComicById(req, res);

      expect(comicService.getComicById).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockComic
      });
    });

    it('should return 404 when comic not found', async () => {
      comicService.getComicById.mockResolvedValue(null);
      req.params.id = 'nonexistent';

      await comicController.getComicById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Comic not found'
        }
      });
    });

    it('should return 400 when ID is missing', async () => {
      req.params.id = '';

      await comicController.getComicById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Comic ID is required'
        }
      });
    });

    it('should handle service errors', async () => {
      comicService.getComicById.mockRejectedValue(new Error('Database error'));
      req.params.id = '123';

      await comicController.getComicById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve comic'
        }
      });
    });
  });

  describe('getComicBySlug', () => {
    it('should return comic by slug successfully', async () => {
      const mockComic = { comicId: '123', name: 'Test Comic', slug: 'test-comic' };

      comicService.getComicBySlug.mockResolvedValue(mockComic);
      req.params.slug = 'test-comic';

      await comicController.getComicBySlug(req, res);

      expect(comicService.getComicBySlug).toHaveBeenCalledWith('test-comic');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockComic
      });
    });

    it('should return 404 when comic not found', async () => {
      comicService.getComicBySlug.mockResolvedValue(null);
      req.params.slug = 'nonexistent';

      await comicController.getComicBySlug(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Comic not found'
        }
      });
    });

    it('should return 400 when slug is missing', async () => {
      req.params.slug = '';

      await comicController.getComicBySlug(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Comic slug is required'
        }
      });
    });

    it('should handle service errors', async () => {
      comicService.getComicBySlug.mockRejectedValue(new Error('Database error'));
      req.params.slug = 'test-comic';

      await comicController.getComicBySlug(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve comic'
        }
      });
    });
  });

  describe('searchComics', () => {
    it('should return search results successfully', async () => {
      const mockResult = {
        data: [{ comicId: '1', name: 'Naruto' }],
        pagination: { pageNumber: 1, pageSize: 20, totalPages: 1, totalElements: 1 }
      };

      comicService.searchComics.mockResolvedValue(mockResult);
      req.query = { keyword: 'Naruto', page: 1, limit: 20 };

      await comicController.searchComics(req, res);

      expect(comicService.searchComics).toHaveBeenCalledWith('Naruto', 1, 20);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult.data,
        pagination: mockResult.pagination
      });
    });

    it('should return 400 when keyword is missing', async () => {
      req.query = {};

      await comicController.searchComics(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Search keyword is required'
        }
      });
    });

    it('should return 400 when keyword is empty string', async () => {
      req.query = { keyword: '   ' };

      await comicController.searchComics(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Search keyword is required'
        }
      });
    });

    it('should handle service errors', async () => {
      comicService.searchComics.mockRejectedValue(new Error('Database error'));
      req.query = { keyword: 'test' };

      await comicController.searchComics(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to search comics'
        }
      });
    });
  });
});
