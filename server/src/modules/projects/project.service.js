const Project = require('./project.model');
const ProjectMember = require('./projectMember.model');
const Task = require('../tasks/task.model');
const OrganizationMember = require('../organizations/organizationMember.model');
const ApiError = require('../../utils/apiError');
const { getCache, setCache, invalidatePattern } = require('../../config/redis');

const createProject = async (organizationId, ownerId, data) => {
  let baseKey = (data.key || data.name.substring(0, 4)).toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!baseKey || baseKey.length < 2) baseKey = 'PRJ';

  let projectKey = baseKey;
  let counter = 1;

  // Auto-resolve key collisions to ensure unique key within the organization
  while (await Project.exists({ organizationId, key: projectKey })) {
    projectKey = `${baseKey.substring(0, 4)}${counter}`;
    counter++;
  }

  const project = await Project.create({
    organizationId,
    name: data.name,
    key: projectKey,
    description: data.description || '',
    ownerId,
    status: data.status || 'ACTIVE',
    priority: data.priority || 'MEDIUM',
    startDate: data.startDate || null,
    dueDate: data.dueDate || null,
    coverImage: data.coverImage || '',
  });

  await ProjectMember.create({
    projectId: project._id,
    userId: ownerId,
    role: 'PROJECT_MANAGER',
  });

  await invalidatePattern(`dashboard:${organizationId}`);
  return project;
};

const getProjects = async (organizationId, query = {}) => {
  const { page = 1, limit = 20, status, priority, search } = query;
  const filter = { organizationId };

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { key: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const projects = await Project.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit, 10))
    .populate('ownerId', 'name email avatar');

  const total = await Project.countDocuments(filter);

  return {
    projects,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      totalPages: Math.ceil(total / parseInt(limit, 10)),
    },
  };
};

const getProjectById = async (projectId) => {
  const project = await Project.findById(projectId).populate('ownerId', 'name email avatar');
  if (!project) throw new ApiError(404, 'Project not found.', 'NOT_FOUND');
  return project;
};

const updateProject = async (projectId, updateData) => {
  const project = await Project.findByIdAndUpdate(projectId, updateData, { new: true });
  if (!project) throw new ApiError(404, 'Project not found.', 'NOT_FOUND');
  await invalidatePattern(`project:${projectId}`);
  await invalidatePattern(`dashboard:${project.organizationId}`);
  return project;
};

const deleteProject = async (projectId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found.', 'NOT_FOUND');

  await Project.findByIdAndDelete(projectId);
  await ProjectMember.deleteMany({ projectId });
  await Task.deleteMany({ projectId });

  await invalidatePattern(`project:${projectId}`);
  await invalidatePattern(`dashboard:${project.organizationId}`);
  return true;
};

const getProjectDashboard = async (projectId) => {
  const cacheKey = `project:${projectId}:dashboard`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found.', 'NOT_FOUND');

  const tasks = await Task.find({ projectId });
  const membersCount = await ProjectMember.countDocuments({ projectId });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'DONE').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const overdueTasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE').length;

  const statusBreakdown = {
    BACKLOG: tasks.filter((t) => t.status === 'BACKLOG').length,
    TODO: tasks.filter((t) => t.status === 'TODO').length,
    IN_PROGRESS: inProgressTasks,
    IN_REVIEW: tasks.filter((t) => t.status === 'IN_REVIEW').length,
    BLOCKED: tasks.filter((t) => t.status === 'BLOCKED').length,
    DONE: completedTasks,
  };

  const priorityBreakdown = {
    LOW: tasks.filter((t) => t.priority === 'LOW').length,
    MEDIUM: tasks.filter((t) => t.priority === 'MEDIUM').length,
    HIGH: tasks.filter((t) => t.priority === 'HIGH').length,
    URGENT: tasks.filter((t) => t.priority === 'URGENT').length,
  };

  const dashboardData = {
    projectId,
    projectName: project.name,
    projectKey: project.key,
    totalTasks,
    completedTasks,
    inProgressTasks,
    overdueTasks,
    membersCount,
    completionPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    statusBreakdown,
    priorityBreakdown,
  };

  await setCache(cacheKey, dashboardData, 180);
  return dashboardData;
};

const getProjectMembers = async (projectId) => {
  const members = await ProjectMember.find({ projectId }).populate('userId', 'name email avatar status bio');
  return members;
};

const addProjectMember = async (projectId, userId, role = 'DEVELOPER') => {
  const existing = await ProjectMember.findOne({ projectId, userId });
  if (existing) {
    throw new ApiError(409, 'User is already a member of this project.', 'ALREADY_MEMBER');
  }

  const member = await ProjectMember.create({ projectId, userId, role });
  return member;
};

const removeProjectMember = async (projectId, userId) => {
  await ProjectMember.deleteOne({ projectId, userId });
  return true;
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectDashboard,
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
};
