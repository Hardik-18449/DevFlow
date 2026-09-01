const express = require('express');
const orgController = require('./organization.controller');
const authenticate = require('../../middleware/auth.middleware');
const { requireOrgRole } = require('../../middleware/role.middleware');
const validate = require('../../middleware/validation.middleware');
const {
  createOrgSchema,
  updateOrgSchema,
  orgParamSchema,
  memberParamSchema,
  updateMemberRoleSchema,
  inviteMemberSchema,
  acceptInvitationSchema,
} = require('./organization.validation');

const router = express.Router();

router.use(authenticate);

router.post('/', validate(createOrgSchema), orgController.createOrganization);
router.get('/', orgController.getOrganizations);
router.post('/invitations/accept', validate(acceptInvitationSchema), orgController.acceptInvitation);

router.get('/:organizationId', validate(orgParamSchema), requireOrgRole(['OWNER', 'ADMIN', 'MEMBER']), orgController.getOrganization);
router.patch('/:organizationId', validate(updateOrgSchema), requireOrgRole(['OWNER', 'ADMIN']), orgController.updateOrganization);
router.delete('/:organizationId', validate(orgParamSchema), requireOrgRole(['OWNER']), orgController.deleteOrganization);

router.get('/:organizationId/members', validate(orgParamSchema), requireOrgRole(['OWNER', 'ADMIN', 'MEMBER']), orgController.getMembers);
router.patch('/:organizationId/members/:userId', validate(updateMemberRoleSchema), requireOrgRole(['OWNER', 'ADMIN']), orgController.updateMemberRole);
router.delete('/:organizationId/members/:userId', validate(memberParamSchema), requireOrgRole(['OWNER', 'ADMIN']), orgController.removeMember);

router.post('/:organizationId/invitations', validate(inviteMemberSchema), requireOrgRole(['OWNER', 'ADMIN']), orgController.inviteMember);
router.get('/:organizationId/invitations', validate(orgParamSchema), requireOrgRole(['OWNER', 'ADMIN']), orgController.getInvitations);

module.exports = router;
