const express = require('express');
const userController = require('./user.controller');
const authenticate = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/me', userController.getMe);
router.patch('/me', userController.updateMe);
router.patch('/me/password', userController.changePassword);

module.exports = router;
