const { z } = require('zod');

const updateMeSchema = {
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters')
      .optional(),
    bio: z
      .string()
      .max(500, 'Bio cannot exceed 500 characters')
      .optional(),
    phone: z
      .string()
      .max(30, 'Phone number cannot exceed 30 characters')
      .optional(),
    avatar: z
      .string()
      .optional(),
  }),
};

const changePasswordSchema = {
  body: z.object({
    currentPassword: z
      .string({ required_error: 'Current password is required' })
      .min(1, 'Current password is required'),
    newPassword: z
      .string({ required_error: 'New password is required' })
      .min(6, 'New password must be at least 6 characters long')
      .max(100, 'New password cannot exceed 100 characters'),
  }),
};

module.exports = {
  updateMeSchema,
  changePasswordSchema,
};
