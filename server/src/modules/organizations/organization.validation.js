const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdParam = z.string().regex(objectIdRegex, 'Invalid ID format');

const createOrgSchema = {
  body: z.object({
    name: z
      .string({ required_error: 'Organization name is required' })
      .trim()
      .min(2, 'Organization name must be at least 2 characters')
      .max(100, 'Organization name cannot exceed 100 characters'),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  }),
};

const updateOrgSchema = {
  params: z.object({
    organizationId: objectIdParam,
  }),
  body: z.object({
    name: z.string().trim().min(2, 'Organization name must be at least 2 characters').max(100).optional(),
    description: z.string().max(500).optional(),
  }),
};

const orgParamSchema = {
  params: z.object({
    organizationId: objectIdParam,
  }),
};

const memberParamSchema = {
  params: z.object({
    organizationId: objectIdParam,
    userId: objectIdParam,
  }),
};

const updateMemberRoleSchema = {
  params: z.object({
    organizationId: objectIdParam,
    userId: objectIdParam,
  }),
  body: z.object({
    role: z.enum(['OWNER', 'ADMIN', 'MEMBER'], {
      required_error: 'Valid role is required (OWNER, ADMIN, MEMBER)',
    }),
  }),
};

const inviteMemberSchema = {
  params: z.object({
    organizationId: objectIdParam,
  }),
  body: z.object({
    email: z
      .string({ required_error: 'Email address is required' })
      .trim()
      .toLowerCase()
      .email('Please enter a valid email address'),
    role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
  }),
};

const acceptInvitationSchema = {
  body: z.object({
    token: z.string({ required_error: 'Invitation token is required' }).min(1, 'Token cannot be empty'),
  }),
};

module.exports = {
  createOrgSchema,
  updateOrgSchema,
  orgParamSchema,
  memberParamSchema,
  updateMemberRoleSchema,
  inviteMemberSchema,
  acceptInvitationSchema,
};
