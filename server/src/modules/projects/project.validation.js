const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdParam = z.string().regex(objectIdRegex, 'Invalid ID format');

const createProjectSchema = {
  params: z.object({
    organizationId: objectIdParam,
  }),
  body: z.object({
    name: z
      .string({ required_error: 'Project name is required' })
      .trim()
      .min(2, 'Project name must be at least 2 characters')
      .max(100, 'Project name cannot exceed 100 characters'),
    key: z
      .string({ required_error: 'Project key is required' })
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9]{2,10}$/, 'Key must be 2-10 uppercase alphanumeric characters'),
    description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  }),
};

const updateProjectSchema = {
  params: z.object({
    projectId: objectIdParam,
  }),
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),
    key: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{2,10}$/).optional(),
    description: z.string().max(1000).optional(),
    status: z.enum(['PLANNING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  }),
};

const orgProjectParamSchema = {
  params: z.object({
    organizationId: objectIdParam,
  }),
};

const projectParamSchema = {
  params: z.object({
    projectId: objectIdParam,
  }),
};

const addProjectMemberSchema = {
  params: z.object({
    projectId: objectIdParam,
  }),
  body: z.object({
    userId: objectIdParam,
    role: z.enum(['PROJECT_MANAGER', 'DEVELOPER', 'VIEWER']).default('DEVELOPER'),
  }),
};

const removeProjectMemberSchema = {
  params: z.object({
    projectId: objectIdParam,
    userId: objectIdParam,
  }),
};

module.exports = {
  createProjectSchema,
  updateProjectSchema,
  orgProjectParamSchema,
  projectParamSchema,
  addProjectMemberSchema,
  removeProjectMemberSchema,
};
