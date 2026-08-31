const User = require('./user.model');
const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const bcrypt = require('bcryptjs');

const getMe = catchAsync(async (req, res) => {
  return sendSuccess(res, 200, 'User profile fetched', req.user);
});

const updateMe = catchAsync(async (req, res) => {
  const { name, bio, phone, avatar } = req.body;
  if (name) req.user.name = name;
  if (bio !== undefined) req.user.bio = bio;
  if (phone !== undefined) req.user.phone = phone;
  if (avatar !== undefined) req.user.avatar = avatar;

  await req.user.save();
  return sendSuccess(res, 200, 'Profile updated successfully', req.user);
});

const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Current and new password are required.', 'BAD_REQUEST');
  }

  const isMatch = await req.user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(400, 'Incorrect current password.', 'INVALID_CREDENTIALS');
  }

  const salt = await bcrypt.genSalt(10);
  req.user.passwordHash = await bcrypt.hash(newPassword, salt);
  await req.user.save();

  return sendSuccess(res, 200, 'Password updated successfully');
});

module.exports = {
  getMe,
  updateMe,
  changePassword,
};
