const express = require('express');
const projectController = require('./project.controller');
const authenticate = require('../../middleware/auth.middleware');
const { requireOrgRole, requireProjectRole } = require('../../middleware/role.middleware');

const router = express.Router();

router.use(authenticate);

// Org-level project endpoints
router.post('/organizations/:organizationId/projects', requireOrgRole(['OWNER', 'ADMIN', 'MEMBER']), projectController.createProject);
router.get('/organizations/:organizationId/projects', requireOrgRole(['OWNER', 'ADMIN', 'MEMBER']), projectController.getProjects);

// Project-level endpoints
router.get('/projects/:projectId', requireProjectRole(['PROJECT_MANAGER', 'DEVELOPER', 'VIEWER']), projectController.getProject);
router.patch('/projects/:projectId', requireProjectRole(['PROJECT_MANAGER']), projectController.updateProject);
router.delete('/projects/:projectId', requireProjectRole(['PROJECT_MANAGER']), projectController.deleteProject);
router.get('/projects/:projectId/dashboard', requireProjectRole(['PROJECT_MANAGER', 'DEVELOPER', 'VIEWER']), projectController.getProjectDashboard);

// Member management inside project
router.get('/projects/:projectId/members', requireProjectRole(['PROJECT_MANAGER', 'DEVELOPER', 'VIEWER']), projectController.getMembers);
router.post('/projects/:projectId/members', requireProjectRole(['PROJECT_MANAGER']), projectController.addMember);
router.delete('/projects/:projectId/members/:userId', requireProjectRole(['PROJECT_MANAGER']), projectController.removeMember);

module.exports = router;
