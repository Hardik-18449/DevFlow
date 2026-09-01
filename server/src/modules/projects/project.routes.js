const express = require('express');
const projectController = require('./project.controller');
const authenticate = require('../../middleware/auth.middleware');
const { requireOrgRole, requireProjectRole } = require('../../middleware/role.middleware');
const validate = require('../../middleware/validation.middleware');
const {
  createProjectSchema,
  updateProjectSchema,
  orgProjectParamSchema,
  projectParamSchema,
  addProjectMemberSchema,
  removeProjectMemberSchema,
} = require('./project.validation');

const router = express.Router();

router.use(authenticate);

// Org-level project endpoints
router.post('/organizations/:organizationId/projects', validate(createProjectSchema), requireOrgRole(['OWNER', 'ADMIN', 'MEMBER']), projectController.createProject);
router.get('/organizations/:organizationId/projects', validate(orgProjectParamSchema), requireOrgRole(['OWNER', 'ADMIN', 'MEMBER']), projectController.getProjects);

// Project-level endpoints
router.get('/projects/:projectId', validate(projectParamSchema), requireProjectRole(['PROJECT_MANAGER', 'DEVELOPER', 'VIEWER']), projectController.getProject);
router.patch('/projects/:projectId', validate(updateProjectSchema), requireProjectRole(['PROJECT_MANAGER']), projectController.updateProject);
router.delete('/projects/:projectId', validate(projectParamSchema), requireProjectRole(['PROJECT_MANAGER']), projectController.deleteProject);
router.get('/projects/:projectId/dashboard', validate(projectParamSchema), requireProjectRole(['PROJECT_MANAGER', 'DEVELOPER', 'VIEWER']), projectController.getProjectDashboard);

// Member management inside project
router.get('/projects/:projectId/members', validate(projectParamSchema), requireProjectRole(['PROJECT_MANAGER', 'DEVELOPER', 'VIEWER']), projectController.getMembers);
router.post('/projects/:projectId/members', validate(addProjectMemberSchema), requireProjectRole(['PROJECT_MANAGER']), projectController.addMember);
router.delete('/projects/:projectId/members/:userId', validate(removeProjectMemberSchema), requireProjectRole(['PROJECT_MANAGER']), projectController.removeMember);

module.exports = router;
