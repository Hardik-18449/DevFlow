const orgService = require('./organization.service');
const Invitation = require('../invitations/invitation.model');
const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/apiResponse');

const createOrganization = catchAsync(async (req, res) => {
  const org = await orgService.createOrganization(req.user._id, req.body);
  return sendSuccess(res, 201, 'Organization created successfully', org);
});

const getOrganizations = catchAsync(async (req, res) => {
  const orgs = await orgService.getUserOrganizations(req.user._id);
  return sendSuccess(res, 200, 'User organizations fetched', orgs);
});

const getOrganization = catchAsync(async (req, res) => {
  const org = await orgService.getOrganizationById(req.params.organizationId);
  return sendSuccess(res, 200, 'Organization details fetched', org);
});

const updateOrganization = catchAsync(async (req, res) => {
  const org = await orgService.updateOrganization(req.params.organizationId, req.body);
  return sendSuccess(res, 200, 'Organization updated successfully', org);
});

const deleteOrganization = catchAsync(async (req, res) => {
  await orgService.deleteOrganization(req.params.organizationId, req.user._id);
  return sendSuccess(res, 200, 'Organization deleted successfully');
});

const getMembers = catchAsync(async (req, res) => {
  const members = await orgService.getOrgMembers(req.params.organizationId);
  return sendSuccess(res, 200, 'Organization members fetched', members);
});

const updateMemberRole = catchAsync(async (req, res) => {
  const updatedMember = await orgService.updateMemberRole(
    req.params.organizationId,
    req.params.userId,
    req.body.role,
    req.user._id
  );
  return sendSuccess(res, 200, 'Member role updated successfully', updatedMember);
});

const removeMember = catchAsync(async (req, res) => {
  await orgService.removeMember(req.params.organizationId, req.params.userId, req.user._id);
  return sendSuccess(res, 200, 'Member removed successfully');
});

const inviteMember = catchAsync(async (req, res) => {
  const result = await orgService.inviteMember(req.params.organizationId, req.user._id, req.body);
  return sendSuccess(res, 201, 'Invitation sent successfully', result);
});

const getInvitations = catchAsync(async (req, res) => {
  const invitations = await Invitation.find({ organizationId: req.params.organizationId });
  return sendSuccess(res, 200, 'Invitations fetched', invitations);
});

const acceptInvitation = catchAsync(async (req, res) => {
  const member = await orgService.acceptInvitation(req.body.token, req.user._id);
  return sendSuccess(res, 200, 'Invitation accepted successfully', member);
});

module.exports = {
  createOrganization,
  getOrganizations,
  getOrganization,
  updateOrganization,
  deleteOrganization,
  getMembers,
  updateMemberRole,
  removeMember,
  inviteMember,
  getInvitations,
  acceptInvitation,
};
