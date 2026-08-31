const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../users/user.model');
const Organization = require('../organizations/organization.model');
const OrganizationMember = require('../organizations/organizationMember.model');
const ApiError = require('../../utils/apiError');
const env = require('../../config/env');

const { sendPasswordResetEmail } = require('../../utils/email.service');

const generateTokens = (user) => {
  const accessToken = jwt.sign({ id: user._id, email: user.email }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });
  const refreshToken = jwt.sign({ id: user._id }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
  return { accessToken, refreshToken };
};

const register = async ({ name, email, password }) => {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, 'User with this email already exists.', 'EMAIL_EXISTS');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    isEmailVerified: true,
  });

  // Automatically create a default personal organization for user
  const slug = `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;
  const org = await Organization.create({
    name: `${name}'s Org`,
    slug,
    ownerId: user._id,
  });

  await OrganizationMember.create({
    organizationId: org._id,
    userId: user._id,
    role: 'OWNER',
  });

  const tokens = generateTokens(user);
  return { user, tokens, organization: org };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password.', 'INVALID_CREDENTIALS');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password.', 'INVALID_CREDENTIALS');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const orgMember = await OrganizationMember.findOne({ userId: user._id });
  let organization = null;
  if (orgMember) {
    organization = await Organization.findById(orgMember.organizationId);
  }

  const tokens = generateTokens(user);
  return { user, tokens, organization };
};

const refreshToken = async (token) => {
  if (!token) {
    throw new ApiError(401, 'Refresh token required.', 'TOKEN_MISSING');
  }

  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id);

  if (!user || user.status !== 'ACTIVE') {
    throw new ApiError(401, 'User not found or inactive.', 'UNAUTHORIZED');
  }

  const tokens = generateTokens(user);
  return { user, tokens };
};

const forgotPassword = async ({ email }) => {
  if (!email) {
    throw new ApiError(400, 'Email address is required.', 'VALIDATION_ERROR');
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new ApiError(404, 'No account found with this email address. Please check your email or register.', 'USER_NOT_FOUND');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 60 * 60 * 1000;
  await user.save();

  // Dispatch email sending via SMTP (if configured)
  const emailResult = await sendPasswordResetEmail({ toEmail: user.email, resetToken });

  return {
    emailFound: true,
    emailSent: emailResult.sent,
    message: emailResult.sent
      ? `Password reset email sent to ${user.email}. Please check your inbox and spam folder.`
      : `Account verified for ${user.email}. (Note: SMTP_PASS is missing in environment variables. Click below to proceed to reset password directly).`,
    ...(emailResult.sent ? {} : { resetToken }),
  };
};

const resetPassword = async ({ token, password }) => {
  if (!token || !password) {
    throw new ApiError(400, 'Token and new password are required.', 'VALIDATION_ERROR');
  }

  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters long.', 'VALIDATION_ERROR');
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, 'Password reset token is invalid or has expired.', 'INVALID_TOKEN');
  }

  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(password, salt);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return { message: 'Password has been reset successfully.' };
};

module.exports = {
  register,
  login,
  refreshToken,
  generateTokens,
  forgotPassword,
  resetPassword,
};
