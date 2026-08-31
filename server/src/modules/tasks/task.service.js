const Task = require('./task.model');
const Project = require('../projects/project.model');
const Activity = require('../activities/activity.model');
const Notification = require('../notifications/notification.model');
const ApiError = require('../../utils/apiError');
const { getIO } = require('../../sockets/socket');
const { invalidatePattern } = require('../../config/redis');

const createTask = async (projectId, userId, taskData) => {
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found.', 'NOT_FOUND');

  // Count existing tasks in project to generate auto taskKey e.g. DFW-12
  const count = await Task.countDocuments({ projectId });
  const taskKey = `${project.key}-${count + 1}`;

  const task = await Task.create({
    projectId,
    organizationId: project.organizationId,
    taskKey,
    title: taskData.title,
    description: taskData.description || '',
    createdBy: userId,
    reporter: taskData.reporter || userId,
    assignee: taskData.assignee || null,
    status: taskData.status || 'TODO',
    priority: taskData.priority || 'MEDIUM',
    labels: taskData.labels || [],
    dueDate: taskData.dueDate || null,
    estimatedHours: taskData.estimatedHours || 0,
    position: count + 1,
    attachments: taskData.attachments || [],
  });

  const populatedTask = await Task.findById(task._id)
    .populate('assignee', 'name email avatar')
    .populate('createdBy', 'name email avatar');

  // Record Activity Log
  const activity = await Activity.create({
    organizationId: project.organizationId,
    projectId,
    taskId: task._id,
    actorId: userId,
    action: 'created_task',
    metadata: { title: task.title, taskKey: task.taskKey },
  });

  // Notify assignee if assigned
  if (task.assignee && task.assignee.toString() !== userId.toString()) {
    const notif = await Notification.create({
      recipientId: task.assignee,
      actorId: userId,
      type: 'TASK_ASSIGNED',
      title: 'New Task Assigned',
      message: `You were assigned task ${task.taskKey}: "${task.title}"`,
      entityType: 'TASK',
      entityId: task._id,
    });
    getIO()?.to(`user:${task.assignee}`).emit('notification.created', notif);
  }

  // Socket broadcast to project room
  getIO()?.to(`project:${projectId}`).emit('task.created', populatedTask);
  getIO()?.to(`project:${projectId}`).emit('activity.created', activity);

  await invalidatePattern(`project:${projectId}`);
  await invalidatePattern(`dashboard:${project.organizationId}`);

  return populatedTask;
};

const getTasks = async (projectId, query = {}) => {
  const { page = 1, limit = 50, status, priority, assignee, search, sortBy = 'position', sortOrder = 'asc' } = query;
  const filter = { projectId };

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignee) filter.assignee = assignee;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { taskKey: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const tasks = await Task.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit, 10))
    .populate('assignee', 'name email avatar')
    .populate('createdBy', 'name email avatar');

  const total = await Task.countDocuments(filter);

  return {
    tasks,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      totalPages: Math.ceil(total / parseInt(limit, 10)),
    },
  };
};

const getTaskById = async (taskId) => {
  const task = await Task.findById(taskId)
    .populate('assignee', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('reporter', 'name email avatar');

  if (!task) throw new ApiError(404, 'Task not found.', 'NOT_FOUND');
  return task;
};

const updateTask = async (taskId, userId, updateData) => {
  const oldTask = await Task.findById(taskId);
  if (!oldTask) throw new ApiError(404, 'Task not found.', 'NOT_FOUND');

  const task = await Task.findByIdAndUpdate(taskId, updateData, { new: true })
    .populate('assignee', 'name email avatar')
    .populate('createdBy', 'name email avatar');

  // Activity & Notification logic on key field updates
  let actionDescription = 'updated_task';
  if (updateData.status && updateData.status !== oldTask.status) {
    actionDescription = `changed status: ${oldTask.status} → ${updateData.status}`;
  } else if (updateData.priority && updateData.priority !== oldTask.priority) {
    actionDescription = `changed priority: ${oldTask.priority} → ${updateData.priority}`;
  }

  const activity = await Activity.create({
    organizationId: task.organizationId,
    projectId: task.projectId,
    taskId: task._id,
    actorId: userId,
    action: actionDescription,
    metadata: { taskKey: task.taskKey, changes: updateData },
  });

  // Notify assignee if assignee changed
  if (updateData.assignee && updateData.assignee.toString() !== (oldTask.assignee ? oldTask.assignee.toString() : '')) {
    const notif = await Notification.create({
      recipientId: updateData.assignee,
      actorId: userId,
      type: 'TASK_ASSIGNED',
      title: 'Task Reassigned',
      message: `You were assigned task ${task.taskKey}: "${task.title}"`,
      entityType: 'TASK',
      entityId: task._id,
    });
    getIO()?.to(`user:${updateData.assignee}`).emit('notification.created', notif);
  }

  // Socket broadcast to project room
  getIO()?.to(`project:${task.projectId}`).emit('task.updated', task);
  getIO()?.to(`project:${task.projectId}`).emit('activity.created', activity);

  await invalidatePattern(`project:${task.projectId}`);
  await invalidatePattern(`dashboard:${task.organizationId}`);

  return task;
};

const deleteTask = async (taskId, userId) => {
  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, 'Task not found.', 'NOT_FOUND');

  await Task.findByIdAndDelete(taskId);

  getIO()?.to(`project:${task.projectId}`).emit('task.deleted', { taskId });

  await invalidatePattern(`project:${task.projectId}`);
  await invalidatePattern(`dashboard:${task.organizationId}`);

  return true;
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
