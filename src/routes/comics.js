const express = require('express');
const router = express.Router();
const comicController = require('../controllers/comicController');
const chapterController = require('../controllers/chapterController');

/**
 * @swagger
 * /comics:
 *   get:
 *     summary: Get comics with pagination
 *     tags: [Comics]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *       - in: query
 *         name: genreId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comics retrieved successfully
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.get('/', comicController.getComics);

/**
 * @swagger
 * /comics/search:
 *   get:
 *     summary: Search comics by keyword
 *     tags: [Comics]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.get('/search', comicController.searchComics);

/**
 * @swagger
 * /comics/slug/{slug}:
 *   get:
 *     summary: Get comic by slug
 *     tags: [Comics]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comic details
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/slug/:slug', comicController.getComicBySlug);

/**
 * @swagger
 * /comics/{id}:
 *   get:
 *     summary: Get comic by ID
 *     tags: [Comics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comic details
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', comicController.getComicById);

/**
 * @swagger
 * /comics/{comicId}/chapters:
 *   get:
 *     summary: Get chapters by comic ID
 *     tags: [Chapters]
 *     parameters:
 *       - in: path
 *         name: comicId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chapters list
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:comicId/chapters', chapterController.getChaptersByComicId);

module.exports = router;

module.exports = router;
