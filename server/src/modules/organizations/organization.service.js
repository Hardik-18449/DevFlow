const Organization = require('./organization.model');
const OrganizationMember = require('./organizationMember.model');
const User = require('../users/user.model');
const Invitation = require('../invitations/invitation.model');
const ApiError = require('../../utils/apiError');
const crypto = require('crypto');
const { sendInvitationEmail } = require('../../utils/email.service');

const createOrganization = async (userId, { name, description, logo }) => {
  const slug = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

  const org = await Organization.create({
    name,
    slug,
    description: description || '',
    logo: logo || '',
    ownerId: userId,
  });

  await OrganizationMember.create({
    organizationId: org._id,
    userId,
    role: 'OWNER',
  });

  return org;
};

const getUserOrganizations = async (userId) => {
  let memberships = await OrganizationMember.find({ userId }).populate('organizationId');

  // Auto-heal: If user has 0 organizations, automatically create a default personal workspace
  if (memberships.length === 0) {
    const user = await User.findById(userId);
    if (user) {
      const slug = `${(user.name || 'User').toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;
      const org = await Organization.create({
        name: `${user.name || 'User'}'s Workspace`,
        slug,
        ownerId: user._id,
      });

      const member = await OrganizationMember.create({
        organizationId: org._id,
        userId: user._id,
        role: 'OWNER',
      });

      memberships = [{ ...member.toObject(), organizationId: org }];
    }
  }

  return memberships
    .filter((m) => m.organizationId)
    .map((m) => ({
      ...m.organizationId.toObject(),
      role: m.role,
      joinedAt: m.joinedAt,
    }));
};

const getOrganizationById = async (organizationId) => {
  const org = await Organization.findById(organizationId);
  if (!org) {
    throw new ApiError(404, 'Organization not found.', 'NOT_FOUND');
  }
  return org;
};

const updateOrganization = async (organizationId, updateData) => {
  const org = await Organization.findByIdAndUpdate(organizationId, updateData, { new: true });
  if (!org) throw new ApiError(404, 'Organization not found.', 'NOT_FOUND');
  return org;
};

const deleteOrganization = async (organizationId, userId) => {
  const org = await Organization.findById(organizationId);
  if (!org) throw new ApiError(404, 'Organization not found.', 'NOT_FOUND');

  if (org.ownerId.toString() !== userId.toString()) {
    throw new ApiError(403, 'Only the organization owner can delete the organization.', 'FORBIDDEN');
  }

  await Organization.findByIdAndDelete(organizationId);
  await OrganizationMember.deleteMany({ organizationId });
  return true;
};

const getOrgMembers = async (organizationId) => {
  const members = await OrganizationMember.find({ organizationId }).populate('userId', 'name email avatar status bio');
  return members;
};

const updateMemberRole = async (organizationId, targetUserId, newRole, requesterId) => {
  const requester = await OrganizationMember.findOne({ organizationId, userId: requesterId });
  if (!requester || (requester.role !== 'OWNER' && requester.role !== 'ADMIN')) {
    throw new ApiError(403, 'Insufficient permissions to manage member roles.', 'FORBIDDEN');
  }

  const member = await OrganizationMember.findOne({ organizationId, userId: targetUserId });
  if (!member) throw new ApiError(404, 'Member not found in organization.', 'NOT_FOUND');

  if (member.role === 'OWNER') {
    throw new ApiError(400, 'Cannot change role of Organization Owner directly.', 'BAD_REQUEST');
  }

  member.role = newRole;
  await member.save();
  return member;
};

const removeMember = async (organizationId, targetUserId, requesterId) => {
  const requester = await OrganizationMember.findOne({ organizationId, userId: requesterId });
  if (!requester || (requester.role !== 'OWNER' && requester.role !== 'ADMIN')) {
    throw new ApiError(403, 'Insufficient permissions to remove members.', 'FORBIDDEN');
  }

  const member = await OrganizationMember.findOne({ organizationId, userId: targetUserId });
  if (!member) throw new ApiError(404, 'Member not found.', 'NOT_FOUND');

  if (member.role === 'OWNER') {
    throw new ApiError(400, 'Cannot remove Organization Owner.', 'BAD_REQUEST');
  }

  await OrganizationMember.deleteOne({ _id: member._id });
  return true;
};

const inviteMember = async (organizationId, invitedByUserId, { email, role }) => {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    const isMember = await OrganizationMember.findOne({ organizationId, userId: existingUser._id });
    if (isMember) {
      throw new ApiError(409, 'User is already a member of this organization.', 'ALREADY_MEMBER');
    }
  }

  const invitation = await Invitation.create({
    organizationId,
    email: email.toLowerCase(),
    role: role || 'MEMBER',
    tokenHash,
    invitedBy: invitedByUserId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  const org = await Organization.findById(organizationId);
  const inviter = await User.findById(invitedByUserId);

  // Send Email & Log Link to Console for Dev testing
  const emailResult = await sendInvitationEmail({
    toEmail: email.toLowerCase(),
    inviteToken: token,
    orgName: org ? org.name : 'DevFlow Workspace',
    inviterName: inviter ? inviter.name : 'Admin',
  });

  return {
    invitation,
    emailSent: emailResult.sent,
    message: emailResult.sent
      ? `Invitation email successfully sent to ${email.toLowerCase()}.`
      : `Invitation created for ${email.toLowerCase()}.`,
    ...(emailResult.sent ? {} : { inviteToken: token }),
  };
};

const acceptInvitation = async (token, userId) => {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const invitation = await Invitation.findOne({ tokenHash, status: 'PENDING' });

  if (!invitation || invitation.expiresAt < new Date()) {
    throw new ApiError(400, 'Invalid or expired invitation token.', 'INVALID_INVITATION');
  }

  const user = await User.findById(userId);
  if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
    throw new ApiError(403, 'This invitation was sent to a different email address.', 'EMAIL_MISMATCH');
  }

  invitation.status = 'ACCEPTED';
  await invitation.save();

  const member = await OrganizationMember.create({
    organizationId: invitation.organizationId,
    userId,
    role: invitation.role,
  });

  const org = await Organization.findById(invitation.organizationId);

  return {
    member,
    organization: org ? { ...org.toObject(), role: invitation.role } : null,
  };
};

module.exports = {
  createOrganization,
  getUserOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  getOrgMembers,
  updateMemberRole,
  removeMember,
  inviteMember,
  acceptInvitation,
};
