const express = require('express');
const taskController = require('./task.controller');
const authenticate = require('../../middleware/auth.middleware');
const { requireProjectRole } = require('../../middleware/role.middleware');

const router = express.Router();

router.use(authenticate);

// Project Task collection endpoints
router.post('/projects/:projectId/tasks', requireProjectRole(['PROJECT_MANAGER', 'DEVELOPER']), taskController.createTask);
router.get('/projects/:projectId/tasks', requireProjectRole(['PROJECT_MANAGER', 'DEVELOPER', 'VIEWER']), taskController.getTasks);

// Individual Task endpoints
router.get('/tasks/:taskId', requireProjectRole(['PROJECT_MANAGER', 'DEVELOPER', 'VIEWER']), taskController.getTask);
router.patch('/tasks/:taskId', requireProjectRole(['PROJECT_MANAGER', 'DEVELOPER']), taskController.updateTask);
router.delete('/tasks/:taskId', requireProjectRole(['PROJECT_MANAGER']), taskController.deleteTask);
router.patch('/tasks/:taskId/status', requireProjectRole(['PROJECT_MANAGER', 'DEVELOPER']), taskController.changeStatus);
router.patch('/tasks/:taskId/priority', requireProjectRole(['PROJECT_MANAGER', 'DEVELOPER']), taskController.changePriority);
router.patch('/tasks/:taskId/assignee', requireProjectRole(['PROJECT_MANAGER', 'DEVELOPER']), taskController.assignTask);

module.exports = router;
