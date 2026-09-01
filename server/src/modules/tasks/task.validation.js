const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdParam = z.string().regex(objectIdRegex, 'Invalid ID format');
const nullableObjectId = z
  .union([z.string().regex(objectIdRegex, 'Invalid User ID format'), z.null(), z.literal('')])
  .optional()
  .transform((val) => (val === '' ? null : val));

const createTaskSchema = {
  params: z.object({
    projectId: objectIdParam,
  }),
  body: z.object({
    title: z
      .string({ required_error: 'Task title is required' })
      .trim()
      .min(2, 'Task title must be at least 2 characters')
      .max(200, 'Task title cannot exceed 200 characters'),
    description: z.string().max(5000, 'Description cannot exceed 5000 characters').optional().default(''),
    status: z
      .enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'BLOCKED', 'DONE'])
      .default('TODO'),
    priority: z
      .enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
      .default('MEDIUM'),
    assignee: nullableObjectId,
    dueDate: z.string().nullable().optional(),
    labels: z.array(z.string()).optional().default([]),
  }),
};

const updateTaskSchema = {
  params: z.object({
    taskId: objectIdParam,
  }),
  body: z.object({
    title: z.string().trim().min(2, 'Task title must be at least 2 characters').max(200).optional(),
    description: z.string().max(5000).optional(),
    status: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'BLOCKED', 'DONE']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    assignee: nullableObjectId,
    dueDate: z.string().nullable().optional(),
    labels: z.array(z.string()).optional(),
  }),
};

const projectTaskParamSchema = {
  params: z.object({
    projectId: objectIdParam,
  }),
};

const taskParamSchema = {
  params: z.object({
    taskId: objectIdParam,
  }),
};

const changeStatusSchema = {
  params: z.object({
    taskId: objectIdParam,
  }),
  body: z.object({
    status: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'BLOCKED', 'DONE'], {
      required_error: 'Valid task status is required',
    }),
  }),
};

const changePrioritySchema = {
  params: z.object({
    taskId: objectIdParam,
  }),
  body: z.object({
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'], {
      required_error: 'Valid task priority is required',
    }),
  }),
};

const assignTaskSchema = {
  params: z.object({
    taskId: objectIdParam,
  }),
  body: z.object({
    assignee: nullableObjectId,
  }),
};

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  projectTaskParamSchema,
  taskParamSchema,
  changeStatusSchema,
  changePrioritySchema,
  assignTaskSchema,
};
