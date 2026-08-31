const ApiError = require('../utils/apiError');

const errorHandler = (err, req, res, next) => {
  let { statusCode = 500, message = 'Internal Server Error', code = 'INTERNAL_ERROR', errors = [] } = err;

  // Handle Mongoose / MongoDB errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    errors = Object.values(err.errors).map((e) => e.message);
    message = 'Validation failed';
  } else if (err.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_KEY';
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with this ${field} already exists.`;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'UNAUTHORIZED';
    message = 'Invalid authentication token.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Authentication token expired.';
  }

  return res.status(statusCode).json({
    success: false,
    message,
    code,
    statusCode,
    ...(errors.length > 0 && { errors }),
  });
};

module.exports = errorHandler;
