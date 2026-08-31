const ApiError = require('../utils/apiError');

const validate = (schema) => (req, res, next) => {
  try {
    if (schema.body) {
      req.body = schema.body.parse(req.body);
    }
    if (schema.query) {
      req.query = schema.query.parse(req.query);
    }
    if (schema.params) {
      req.params = schema.params.parse(req.params);
    }
    next();
  } catch (error) {
    if (error.errors) {
      const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      return next(new ApiError(400, `Validation error: ${messages.join(', ')}`, 'VALIDATION_ERROR', messages));
    }
    return next(new ApiError(400, 'Invalid request data.', 'VALIDATION_ERROR'));
  }
};

module.exports = validate;
