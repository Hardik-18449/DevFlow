const projectService = require('./project.service');
const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/apiResponse');

const createProject = catchAsync(async (req, res) => {
  const project = await projectService.createProject(req.params.organizationId, req.user._id, req.body);
  return sendSuccess(res, 201, 'Project created successfully', project);
});

const getProjects = catchAsync(async (req, res) => {
  const result = await projectService.getProjects(req.params.organizationId, req.query);
  return sendSuccess(res, 200, 'Projects fetched successfully', result.projects, result.pagination);
});

const getProject = catchAsync(async (req, res) => {
  const project = await projectService.getProjectById(req.params.projectId);
  return sendSuccess(res, 200, 'Project details fetched', project);
});

const updateProject = catchAsync(async (req, res) => {
  const project = await projectService.updateProject(req.params.projectId, req.body);
  return sendSuccess(res, 200, 'Project updated successfully', project);
});

const deleteProject = catchAsync(async (req, res) => {
  await projectService.deleteProject(req.params.projectId);
  return sendSuccess(res, 200, 'Project deleted successfully');
});

const getProjectDashboard = catchAsync(async (req, res) => {
  const dashboard = await projectService.getProjectDashboard(req.params.projectId);
  return sendSuccess(res, 200, 'Project dashboard data fetched', dashboard);
});

const getMembers = catchAsync(async (req, res) => {
  const members = await projectService.getProjectMembers(req.params.projectId);
  return sendSuccess(res, 200, 'Project members fetched', members);
});

const addMember = catchAsync(async (req, res) => {
  const member = await projectService.addProjectMember(req.params.projectId, req.body.userId, req.body.role);
  return sendSuccess(res, 201, 'Project member added', member);
});

const removeMember = catchAsync(async (req, res) => {
  await projectService.removeProjectMember(req.params.projectId, req.params.userId);
  return sendSuccess(res, 200, 'Project member removed');
});

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  getProjectDashboard,
  getMembers,
  addMember,
  removeMember,
};
