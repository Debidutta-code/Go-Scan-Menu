// src/validations/staff.validation.ts

import { z } from 'zod';

export const staffLoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
});

export const createStaffSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  phone: z
    .string()
    .min(1, 'Phone is required')
    .min(10, 'Phone must be at least 10 characters'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
  role: z.enum(
    ['owner', 'branch_manager', 'manager', 'waiter', 'kitchen_staff', 'cashier'],
    { required_error: 'Role is required' }
  ),
});
