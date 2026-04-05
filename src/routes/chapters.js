const express = require('express');
const router = express.Router();
const chapterController = require('../controllers/chapterController');

/**
 * Chapter Routes
 * 
 * Defines routes for chapter-related operations.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

/**
 * GET /chapters/:id/pages
 * Get chapter pages
 * Params: id (required)
 */
router.get('/:id/pages', chapterController.getChapterPages);

/**
 * GET /chapters/:id
 * Get chapter by ID
 * Params: id (required)
 */
router.get('/:id', chapterController.getChapterById);

module.exports = router;
