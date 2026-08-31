const taskService = require('./task.service');
const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/apiResponse');

const createTask = catchAsync(async (req, res) => {
  const task = await taskService.createTask(req.params.projectId, req.user._id, req.body);
  return sendSuccess(res, 201, 'Task created successfully', task);
});

const getTasks = catchAsync(async (req, res) => {
  const result = await taskService.getTasks(req.params.projectId, req.query);
  return sendSuccess(res, 200, 'Tasks fetched successfully', result.tasks, result.pagination);
});

const getTask = catchAsync(async (req, res) => {
  const task = await taskService.getTaskById(req.params.taskId);
  return sendSuccess(res, 200, 'Task details fetched', task);
});

const updateTask = catchAsync(async (req, res) => {
  const task = await taskService.updateTask(req.params.taskId, req.user._id, req.body);
  return sendSuccess(res, 200, 'Task updated successfully', task);
});

const deleteTask = catchAsync(async (req, res) => {
  await taskService.deleteTask(req.params.taskId, req.user._id);
  return sendSuccess(res, 200, 'Task deleted successfully');
});

const changeStatus = catchAsync(async (req, res) => {
  const task = await taskService.updateTask(req.params.taskId, req.user._id, { status: req.body.status });
  return sendSuccess(res, 200, 'Task status updated', task);
});

const changePriority = catchAsync(async (req, res) => {
  const task = await taskService.updateTask(req.params.taskId, req.user._id, { priority: req.body.priority });
  return sendSuccess(res, 200, 'Task priority updated', task);
});

const assignTask = catchAsync(async (req, res) => {
  const task = await taskService.updateTask(req.params.taskId, req.user._id, { assignee: req.body.assignee });
  return sendSuccess(res, 200, 'Task assignee updated', task);
});

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  changeStatus,
  changePriority,
  assignTask,
};
