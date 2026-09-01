const express = require('express');
const authController = require('./auth.controller');
const validate = require('../../middleware/validation.middleware');
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('./auth.validation');

const router = express.Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refreshToken);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

module.exports = router;
