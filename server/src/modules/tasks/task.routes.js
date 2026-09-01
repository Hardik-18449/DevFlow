const express = require('express');
const taskController = require('./task.controller');
const authenticate = require('../../middleware/auth.middleware');
const { requireProjectRole } = require('../../middleware/role.middleware');
const validate = require('../../middleware/validation.middleware');
const {
  createTaskSchema,
  updateTaskSchema,
  projectTaskParamSchema,
  taskParamSchema,
  changeStatusSchema,
  changePrioritySchema,
  assignTaskSchema,
} = require('./task.validation');

const router = express.Router();

router.use(authenticate);

// Project Task collection endpoints
router.post('/projects/:projectId/tasks', validate(createTaskSchema), requireProjectRole(['PROJECT_MANAGER', 'DEVELOPER']), taskController.createTask);
router.get('/projects/:projectId/tasks', validate(projectTaskParamSchema), requireProjectRole(['PROJECT_MANAGER', 'DEVELOPER', 'VIEWER']), taskController.getTasks);

// Individual Task endpoints
router.get('/tasks/:taskId', validate(taskParamSchema), requireProjectRole(['PROJECT_MANAGER', 'DEVELOPER', 'VIEWER']), taskController.getTask);
router.patch('/tasks/:taskId', validate(updateTaskSchema), requireProjectRole(['PROJECT_MANAGER', 'DEVELOPER']), taskController.updateTask);
router.delete('/tasks/:taskId', validate(taskParamSchema), requireProjectRole(['PROJECT_MANAGER']), taskController.deleteTask);
router.patch('/tasks/:taskId/status', validate(changeStatusSchema), requireProjectRole(['PROJECT_MANAGER', 'DEVELOPER']), taskController.changeStatus);
router.patch('/tasks/:taskId/priority', validate(changePrioritySchema), requireProjectRole(['PROJECT_MANAGER', 'DEVELOPER']), taskController.changePriority);
router.patch('/tasks/:taskId/assignee', validate(assignTaskSchema), requireProjectRole(['PROJECT_MANAGER', 'DEVELOPER']), taskController.assignTask);

module.exports = router;
