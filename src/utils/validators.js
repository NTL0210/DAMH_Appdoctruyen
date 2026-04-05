const Joi = require('joi');

/**
 * Validation schemas for API requests
 */

// Auth schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).max(128).required()
});

const loginSchema = Joi.object({
  identifier: Joi.string().required(), // email or username
  password: Joi.string().required()
});

const googleAuthSchema = Joi.object({
  idToken: Joi.string().required()
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
  newPassword: Joi.string().min(6).max(128).required()
});

// Profile schemas
const updateUsernameSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required()
});

// Comment schemas
const createCommentSchema = Joi.object({
  comicId: Joi.string().required(),
  content: Joi.string().min(1).max(1000).required(),
  parentCommentId: Joi.string().optional()
});

// Follow schemas
const followSchema = Joi.object({
  comicId: Joi.string().required()
});

// Reading progress schemas
const updateProgressSchema = Joi.object({
  comicId: Joi.string().required(),
  chapterId: Joi.string().required(),
  chapterIndex: Joi.number().integer().min(0).optional()
});

// Query parameter schemas
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

const searchSchema = Joi.object({
  keyword: Joi.string().min(1).max(100).required(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

const genreFilterSchema = Joi.object({
  genreId: Joi.string().required(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

module.exports = {
  registerSchema,
  loginSchema,
  googleAuthSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateUsernameSchema,
  createCommentSchema,
  followSchema,
  updateProgressSchema,
  paginationSchema,
  searchSchema,
  genreFilterSchema
};
