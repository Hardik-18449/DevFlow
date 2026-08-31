const express = require('express');
const activityController = require('./activity.controller');
const authenticate = require('../../middleware/auth.middleware');
const { requireProjectRole } = require('../../middleware/role.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/projects/:projectId/activities', requireProjectRole(['PROJECT_MANAGER', 'DEVELOPER', 'VIEWER']), activityController.getProjectActivities);

module.exports = router;
