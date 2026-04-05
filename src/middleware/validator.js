/**
 * Request validation middleware using Joi schemas
 */

/**
 * Validate request body against a Joi schema
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Express middleware
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors
      stripUnknown: true // Remove unknown fields
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Validation failed',
          details: errors
        },
        timestamp: new Date().toISOString()
      });
    }

    // Replace body with validated and sanitized value
    req.body = value;
    next();
  };
};

/**
 * Validate request query parameters against a Joi schema
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Express middleware
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Validation failed',
          details: errors
        },
        timestamp: new Date().toISOString()
      });
    }

    // Replace query with validated and sanitized value
    req.query = value;
    next();
  };
};

/**
 * Validate request params against a Joi schema
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Express middleware
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Validation failed',
          details: errors
        },
        timestamp: new Date().toISOString()
      });
    }

    // Replace params with validated and sanitized value
    req.params = value;
    next();
  };
};

module.exports = {
  validateBody,
  validateQuery,
  validateParams
};
