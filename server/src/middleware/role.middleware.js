const OrganizationMember = require('../modules/organizations/organizationMember.model');
const ProjectMember = require('../modules/projects/projectMember.model');
const Project = require('../modules/projects/project.model');
const Task = require('../modules/tasks/task.model');
const ApiError = require('../utils/apiError');

// Organization RBAC middleware
const requireOrgRole = (allowedRoles = ['OWNER', 'ADMIN', 'MEMBER']) => {
  return async (req, res, next) => {
    try {
      const organizationId = req.params.organizationId || req.body.organizationId || req.query.organizationId;
      if (!organizationId) {
        return next(new ApiError(400, 'Organization ID is required.', 'BAD_REQUEST'));
      }

      const member = await OrganizationMember.findOne({
        organizationId,
        userId: req.user._id,
      });

      if (!member) {
        return next(new ApiError(403, 'Access restricted. You are not a member of this workspace.', 'FORBIDDEN'));
      }

      if (!allowedRoles.includes(member.role)) {
        return next(
          new ApiError(
            403,
            'Access restricted. You do not have permission to perform this action in this organization.',
            'FORBIDDEN'
          )
        );
      }

      req.orgMember = member;
      next();
    } catch (err) {
      next(err);
    }
  };
};

// Project RBAC middleware
const requireProjectRole = (allowedRoles = ['PROJECT_MANAGER', 'DEVELOPER', 'VIEWER']) => {
  return async (req, res, next) => {
    try {
      let projectId = req.params.projectId || req.body.projectId;

      // If taskId is provided instead of projectId
      if (!projectId && req.params.taskId) {
        const task = await Task.findById(req.params.taskId);
        if (!task) {
          return next(new ApiError(404, 'Task not found.', 'NOT_FOUND'));
        }
        projectId = task.projectId;
        req.task = task;
      }

      if (!projectId) {
        return next(new ApiError(400, 'Project ID is required.', 'BAD_REQUEST'));
      }

      const project = await Project.findById(projectId);
      if (!project) {
        return next(new ApiError(404, 'Project not found.', 'NOT_FOUND'));
      }
      req.project = project;

      // First check if user is Org OWNER or ADMIN (they implicitly have full access)
      const orgMember = await OrganizationMember.findOne({
        organizationId: project.organizationId,
        userId: req.user._id,
      });

      if (!orgMember) {
        return next(new ApiError(403, 'Access restricted. You do not belong to this project workspace.', 'FORBIDDEN'));
      }

      if (orgMember.role === 'OWNER' || orgMember.role === 'ADMIN') {
        req.projectMember = { role: 'PROJECT_MANAGER' };
        return next();
      }

      // Check explicit project membership
      const projMember = await ProjectMember.findOne({
        projectId,
        userId: req.user._id,
      });

      if (!projMember) {
        return next(new ApiError(403, 'Access restricted. You are not a member of this project.', 'FORBIDDEN'));
      }

      if (!allowedRoles.includes(projMember.role)) {
        return next(
          new ApiError(
            403,
            'Access restricted. You do not have sufficient permissions to perform this action in this project.',
            'FORBIDDEN'
          )
        );
      }

      req.projectMember = projMember;
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = {
  requireOrgRole,
  requireProjectRole,
};
