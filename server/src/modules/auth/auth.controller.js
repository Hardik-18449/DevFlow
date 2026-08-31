const authService = require('./auth.service');
const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/apiResponse');

const setCookieToken = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const register = catchAsync(async (req, res) => {
  const result = await authService.register(req.body);
  setCookieToken(res, result.tokens.refreshToken);
  return sendSuccess(res, 201, 'User registered successfully', result);
});

const login = catchAsync(async (req, res) => {
  const result = await authService.login(req.body);
  setCookieToken(res, result.tokens.refreshToken);
  return sendSuccess(res, 200, 'Login successful', result);
});

const logout = catchAsync(async (req, res) => {
  res.clearCookie('refreshToken');
  return sendSuccess(res, 200, 'Logged out successfully');
});

const refreshToken = catchAsync(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  const result = await authService.refreshToken(token);
  setCookieToken(res, result.tokens.refreshToken);
  return sendSuccess(res, 200, 'Token refreshed successfully', result);
});

const forgotPassword = catchAsync(async (req, res) => {
  const result = await authService.forgotPassword(req.body);
  return sendSuccess(res, 200, result.message, result);
});

const resetPassword = catchAsync(async (req, res) => {
  const result = await authService.resetPassword(req.body);
  return sendSuccess(res, 200, result.message, result);
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
};
