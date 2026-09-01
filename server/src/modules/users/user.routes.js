const express = require('express');
const userController = require('./user.controller');
const authenticate = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validation.middleware');
const { updateMeSchema, changePasswordSchema } = require('./user.validation');

const router = express.Router();

router.use(authenticate);

router.get('/me', userController.getMe);
router.patch('/me', validate(updateMeSchema), userController.updateMe);
router.patch('/me/password', validate(changePasswordSchema), userController.changePassword);

module.exports = router;
