const express = require('express');
const notificationController = require('./notification.controller');
const authenticate = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', notificationController.getNotifications);
router.patch('/read-all', notificationController.markAllRead);
router.patch('/:notificationId/read', notificationController.markRead);

module.exports = router;
