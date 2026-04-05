const comicService = require('../../../src/services/comicService');
const Comic = require('../../../src/models/Comic');
const cacheService = require('../../../src/services/cacheService');

jest.mock('../../../src/models/Comic');
jest.mock('../../../src/services/cacheService');
jest.mock('../../../src/utils/logger');

describe('ComicService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getComics', () => {
    it('should return paginated comics from database when cache miss', async () => {
      const mockComics = [
        { comicId: '1', name: 'Comic 1', slug: 'comic-1' },
        { comicId: '2', name: 'Comic 2', slug: 'comic-2' }
      ];

      cacheService.get.mockResolvedValue(null);
      Comic.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockComics)
      });
      Comic.countDocuments.mockResolvedValue(25);

      const result = await comicService.getComics(1, 20);

      expect(result.data).toEqual(mockComics);
      expect(result.pagination).toEqual({
        pageNumber: 1,
        pageSize: 20,
        totalPages: 2,
        totalElements: 25
      });
      expect(cacheService.set).toHaveBeenCalled();
    });

    it('should return cached comics when cache hit', async () => {
      const cachedData = {
        data: [{ comicId: '1', name: 'Cached Comic' }],
        pagination: { pageNumber: 1, pageSize: 20, totalPages: 1, totalElements: 1 }
      };

      cacheService.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await comicService.getComics(1, 20);

      expect(result).toEqual(cachedData);
      expect(Comic.find).not.toHaveBeenCalled();
    });

    it('should filter by genreId when provided', async () => {
      cacheService.get.mockResolvedValue(null);
      Comic.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      });
      Comic.countDocuments.mockResolvedValue(0);

      await comicService.getComics(1, 20, 'genre-123');

      expect(Comic.find).toHaveBeenCalledWith({ 'comicGenres.genreId': 'genre-123' });
    });

    it('should enforce maximum limit of 20', async () => {
      cacheService.get.mockResolvedValue(null);
      Comic.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      });
      Comic.countDocuments.mockResolvedValue(0);

      await comicService.getComics(1, 50);

      const limitCall = Comic.find().limit;
      expect(limitCall).toHaveBeenCalledWith(20);
    });
  });

  describe('getComicById', () => {
    it('should return comic from database when cache miss', async () => {
      const mockComic = { comicId: '123', name: 'Test Comic', slug: 'test-comic' };

      cacheService.get.mockResolvedValue(null);
      Comic.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockComic)
      });

      const result = await comicService.getComicById('123');

      expect(result).toEqual(mockComic);
      expect(Comic.findOne).toHaveBeenCalledWith({ comicId: '123' });
      expect(cacheService.set).toHaveBeenCalled();
    });

    it('should return cached comic when cache hit', async () => {
      const mockComic = { comicId: '123', name: 'Cached Comic' };

      cacheService.get.mockResolvedValue(JSON.stringify(mockComic));

      const result = await comicService.getComicById('123');

      expect(result).toEqual(mockComic);
      expect(Comic.findOne).not.toHaveBeenCalled();
    });

    it('should return null when comic not found', async () => {
      cacheService.get.mockResolvedValue(null);
      Comic.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null)
      });

      const result = await comicService.getComicById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getComicBySlug', () => {
    it('should return comic by slug from database when cache miss', async () => {
      const mockComic = { comicId: '123', name: 'Test Comic', slug: 'test-comic' };

      cacheService.get.mockResolvedValue(null);
      Comic.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockComic)
      });

      const result = await comicService.getComicBySlug('test-comic');

      expect(result).toEqual(mockComic);
      expect(Comic.findOne).toHaveBeenCalledWith({ slug: 'test-comic' });
      expect(cacheService.set).toHaveBeenCalled();
    });

    it('should return cached comic when cache hit', async () => {
      const mockComic = { comicId: '123', name: 'Cached Comic', slug: 'cached-comic' };

      cacheService.get.mockResolvedValue(JSON.stringify(mockComic));

      const result = await comicService.getComicBySlug('cached-comic');

      expect(result).toEqual(mockComic);
      expect(Comic.findOne).not.toHaveBeenCalled();
    });
  });

  describe('searchComics', () => {
    it('should return empty results for empty keyword', async () => {
      const result = await comicService.searchComics('', 1, 20);

      expect(result.data).toEqual([]);
      expect(result.pagination.totalElements).toBe(0);
    });

    it('should search comics using text index', async () => {
      const mockComics = [
        { comicId: '1', name: 'Naruto', slug: 'naruto' }
      ];

      cacheService.get.mockResolvedValue(null);
      Comic.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockComics)
      });
      Comic.countDocuments.mockResolvedValue(1);

      const result = await comicService.searchComics('Naruto', 1, 20);

      expect(result.data).toEqual(mockComics);
      expect(Comic.find).toHaveBeenCalledWith({ $text: { $search: 'Naruto' } });
    });

    it('should return cached search results when cache hit', async () => {
      const cachedData = {
        data: [{ comicId: '1', name: 'Cached Search' }],
        pagination: { pageNumber: 1, pageSize: 20, totalPages: 1, totalElements: 1 }
      };

      cacheService.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await comicService.searchComics('test', 1, 20);

      expect(result).toEqual(cachedData);
      expect(Comic.find).not.toHaveBeenCalled();
    });
  });

  describe('getComicsByGenre', () => {
    it('should call getComics with genreId', async () => {
      cacheService.get.mockResolvedValue(null);
      Comic.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      });
      Comic.countDocuments.mockResolvedValue(0);

      await comicService.getComicsByGenre('genre-123', 1, 20);

      expect(Comic.find).toHaveBeenCalledWith({ 'comicGenres.genreId': 'genre-123' });
    });
  });

  describe('invalidateComicCache', () => {
    it('should delete all related cache entries', async () => {
      const mockComic = { comicId: '123', slug: 'test-comic' };

      Comic.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockComic)
      });

      await comicService.invalidateComicCache('123');

      expect(cacheService.del).toHaveBeenCalledWith('comic:id:123');
      expect(cacheService.del).toHaveBeenCalledWith('comic:slug:test-comic');
      expect(cacheService.delPattern).toHaveBeenCalledWith('comics:list:*');
      expect(cacheService.delPattern).toHaveBeenCalledWith('comics:search:*');
    });

    it('should handle errors gracefully', async () => {
      Comic.findOne.mockReturnValue({
        lean: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await expect(comicService.invalidateComicCache('123')).resolves.not.toThrow();
    });
  });
});
