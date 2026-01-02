// src/validations/restaurant.validation.ts

import { z } from 'zod';

export const createRestaurantSchema = z.object({
  name: z
    .string()
    .min(1, 'Restaurant name is required')
    .max(100, 'Name must be less than 100 characters'),
  
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(50, 'Slug must be less than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  
  type: z.enum(['single', 'chain'], {
    required_error: 'Restaurant type is required',
  }),
  
  owner: z.object({
    name: z
      .string()
      .min(1, 'Owner name is required')
      .max(100, 'Name must be less than 100 characters'),
    
    email: z
      .string()
      .min(1, 'Owner email is required')
      .email('Enter a valid email address'),
    
    phone: z
      .string()
      .min(1, 'Phone number is required')
      .regex(/^[+]?[\d\s()-]+$/, 'Enter a valid phone number'),
    
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(50, 'Password must be less than 50 characters'),
  }),
  
  subscription: z.object({
    plan: z.enum(['trial', 'basic', 'premium', 'enterprise']).optional(),
    maxBranches: z.number().min(1, 'Max branches must be at least 1').optional(),
  }).optional(),
  
  theme: z.object({
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
    secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
    accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
    font: z.string().optional(),
  }).optional(),
  
  defaultSettings: z.object({
    currency: z.string().optional(),
    serviceChargePercentage: z.number().min(0).max(100).optional(),
  }).optional(),
});

export const updateThemeSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
  logo: z.string().url('Invalid URL').optional().or(z.literal('')),
  favicon: z.string().url('Invalid URL').optional().or(z.literal('')),
  font: z.string().optional(),
  bannerImage: z.string().url('Invalid URL').optional().or(z.literal('')),
  customCSS: z.string().optional(),
});

export const updateSubscriptionSchema = z.object({
  plan: z.enum(['trial', 'basic', 'premium', 'enterprise']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().optional(),
  maxBranches: z.number().min(1, 'Max branches must be at least 1').optional(),
});

export const updateSettingsSchema = z.object({
  currency: z.string().min(1, 'Currency is required').optional(),
  serviceChargePercentage: z.number().min(0, 'Cannot be negative').max(100, 'Cannot exceed 100%').optional(),
  allowBranchOverride: z.boolean().optional(),
});

export type CreateRestaurantSchemaType = z.infer<typeof createRestaurantSchema>;
export type UpdateThemeSchemaType = z.infer<typeof updateThemeSchema>;
export type UpdateSubscriptionSchemaType = z.infer<typeof updateSubscriptionSchema>;
export type UpdateSettingsSchemaType = z.infer<typeof updateSettingsSchema>;
