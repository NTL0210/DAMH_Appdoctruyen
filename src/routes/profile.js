const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

/**
 * @route GET /profile
 * @desc Get authenticated user's profile
 * @access Private
 */
router.get('/', auth, profileController.getProfile);

/**
 * @route PUT /profile/username
 * @desc Update username
 * @access Private
 */
router.put('/username', auth, profileController.updateUsername);

/**
 * @route POST /profile/avatar
 * @desc Upload avatar image
 * @access Private
 */
router.post('/avatar', auth, upload.single('avatar'), profileController.uploadAvatar);

module.exports = router;
