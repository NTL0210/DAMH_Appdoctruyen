const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const { authLimiter } = require('../middleware/rateLimiter');

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/register', authLimiter, authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email/username and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email or username
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/login', authLimiter, authController.login);

/**
 * @swagger
 * /auth/google:
 *   post:
 *     summary: Login with Google ID token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/google', authLimiter, authController.loginWithGoogle);
router.post('/google-login', authLimiter, authController.loginWithGoogle);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: OTP sent to email
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post('/forgot-password', authLimiter, authController.requestPasswordReset);
router.post('/request-reset', authLimiter, authController.requestPasswordReset);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password with OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/reset-password', authController.resetPassword);

// Legacy aliases used by the current Flutter client
router.get('/profile', authMiddleware, profileController.getProfile);
router.put('/update-username', authMiddleware, profileController.updateUsername);
router.post('/upload-avatar', authMiddleware, upload.single('avatar'), profileController.uploadAvatar);

module.exports = router;
