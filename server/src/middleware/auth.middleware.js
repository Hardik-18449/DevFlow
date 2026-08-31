const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/apiError');
const User = require('../modules/users/user.model');

const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(new ApiError(401, 'Authentication required. No token provided.', 'UNAUTHORIZED'));
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.status !== 'ACTIVE') {
      return next(new ApiError(401, 'User not found or account is deactivated.', 'UNAUTHORIZED'));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Access token has expired.', 'TOKEN_EXPIRED'));
    }
    return next(new ApiError(401, 'Invalid authentication token.', 'UNAUTHORIZED'));
  }
};

module.exports = authenticate;
