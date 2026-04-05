const Genre = require('../models/Genre');
const cacheService = require('../services/cacheService');

/**
 * Genre Controller
 * Handles genre-related operations
 */

/**
 * Get all genres
 * @route GET /genres
 */
exports.getGenres = async (req, res, next) => {
  try {
    const cacheKey = 'genres:all';
    
    // Check cache first
    const cachedGenres = await cacheService.get(cacheKey);
    if (cachedGenres) {
      return res.json({
        success: true,
        data: cachedGenres,
        cached: true
      });
    }

    // Fetch from database, sorted alphabetically by name
    const genres = await Genre.find({})
      .select('genreId name slug')
      .sort({ name: 1 })
      .lean();

    // Cache for 1 hour (3600 seconds)
    await cacheService.set(cacheKey, genres, 3600);

    res.json({
      success: true,
      data: genres,
      cached: false
    });
  } catch (error) {
    next(error);
  }
};
