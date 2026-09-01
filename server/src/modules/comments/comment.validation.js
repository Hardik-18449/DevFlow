const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdParam = z.string().regex(objectIdRegex, 'Invalid ID format');

const createCommentSchema = {
  params: z.object({
    taskId: objectIdParam,
  }),
  body: z.object({
    content: z
      .string({ required_error: 'Comment content is required' })
      .trim()
      .min(1, 'Comment cannot be empty')
      .max(2000, 'Comment cannot exceed 2000 characters'),
  }),
};

const getCommentsSchema = {
  params: z.object({
    taskId: objectIdParam,
  }),
};

const updateCommentSchema = {
  params: z.object({
    commentId: objectIdParam,
  }),
  body: z.object({
    content: z
      .string({ required_error: 'Updated content is required' })
      .trim()
      .min(1, 'Comment cannot be empty')
      .max(2000, 'Comment cannot exceed 2000 characters'),
  }),
};

const deleteCommentSchema = {
  params: z.object({
    commentId: objectIdParam,
  }),
};

module.exports = {
  createCommentSchema,
  getCommentsSchema,
  updateCommentSchema,
  deleteCommentSchema,
};
