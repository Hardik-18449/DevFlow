const express = require('express');
const orgController = require('./organization.controller');
const authenticate = require('../../middleware/auth.middleware');
const { requireOrgRole } = require('../../middleware/role.middleware');

const router = express.Router();

router.use(authenticate);

router.post('/', orgController.createOrganization);
router.get('/', orgController.getOrganizations);
router.post('/invitations/accept', orgController.acceptInvitation);

router.get('/:organizationId', requireOrgRole(['OWNER', 'ADMIN', 'MEMBER']), orgController.getOrganization);
router.patch('/:organizationId', requireOrgRole(['OWNER', 'ADMIN']), orgController.updateOrganization);
router.delete('/:organizationId', requireOrgRole(['OWNER']), orgController.deleteOrganization);

router.get('/:organizationId/members', requireOrgRole(['OWNER', 'ADMIN', 'MEMBER']), orgController.getMembers);
router.patch('/:organizationId/members/:userId', requireOrgRole(['OWNER', 'ADMIN']), orgController.updateMemberRole);
router.delete('/:organizationId/members/:userId', requireOrgRole(['OWNER', 'ADMIN']), orgController.removeMember);

router.post('/:organizationId/invitations', requireOrgRole(['OWNER', 'ADMIN']), orgController.inviteMember);
router.get('/:organizationId/invitations', requireOrgRole(['OWNER', 'ADMIN']), orgController.getInvitations);

module.exports = router;
