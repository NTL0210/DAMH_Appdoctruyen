const express = require('express');
const router = express.Router();
const genreController = require('../controllers/genreController');

/**
 * @route GET /genres
 * @desc Get all genres (alphabetically sorted, cached for 1 hour)
 * @access Public
 */
router.get('/', genreController.getGenres);

module.exports = router;
