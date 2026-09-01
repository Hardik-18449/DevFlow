const { z } = require('zod');

const registerSchema = {
  body: z.object({
    name: z
      .string({ required_error: 'Full name is required' })
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters'),
    email: z
      .string({ required_error: 'Email address is required' })
      .trim()
      .toLowerCase()
      .email('Please enter a valid email address'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters long')
      .max(100, 'Password cannot exceed 100 characters'),
  }),
};

const loginSchema = {
  body: z.object({
    email: z
      .string({ required_error: 'Email address is required' })
      .trim()
      .toLowerCase()
      .email('Please enter a valid email address'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(1, 'Password is required'),
  }),
};

const forgotPasswordSchema = {
  body: z.object({
    email: z
      .string({ required_error: 'Email address is required' })
      .trim()
      .toLowerCase()
      .email('Please enter a valid email address'),
  }),
};

const resetPasswordSchema = {
  body: z.object({
    token: z
      .string({ required_error: 'Reset token is required' })
      .min(1, 'Reset token cannot be empty'),
    password: z
      .string({ required_error: 'New password is required' })
      .min(6, 'Password must be at least 6 characters long')
      .max(100, 'Password cannot exceed 100 characters'),
  }),
};

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
