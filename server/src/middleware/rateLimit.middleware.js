const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/apiError');

/**
 * Strict rate limiter for Authentication routes (login, register)
 * Protects against brute-force password guessing.
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new ApiError(429, 'Too many login attempts. Please try again after 15 minutes.', 'RATE_LIMIT_EXCEEDED'));
  },
});

/**
 * Rate limiter for sensitive organization invitation dispatches
 */
const inviteRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 invitations per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new ApiError(429, 'Invitation rate limit reached. Please wait a few minutes before sending more invites.', 'RATE_LIMIT_EXCEEDED'));
  },
});

/**
 * General API Rate Limiter
 */
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new ApiError(429, 'Too many requests. Please slow down.', 'RATE_LIMIT_EXCEEDED'));
  },
});

module.exports = {
  authRateLimiter,
  inviteRateLimiter,
  apiRateLimiter,
};
