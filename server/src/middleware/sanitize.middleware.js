const mongoSanitize = require('express-mongo-sanitize');

/**
 * NoSQL Injection Protection Middleware
 * Strips $ and . operators from user-supplied input to prevent MongoDB operator injection.
 */
const sanitizeInput = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`[Security Warning] NoSQL Injection attempt sanitized in key: "${key}" from IP: ${req.ip}`);
  },
});

module.exports = sanitizeInput;
