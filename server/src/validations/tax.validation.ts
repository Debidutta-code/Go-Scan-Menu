// src/validations/tax.validation.ts
import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createTaxSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, 'Name is required'),
      description: z.string().optional(),
      type: z.enum(['tax', 'group']).default('tax'),
      taxType: z.enum(['percentage', 'fixed']).optional(),
      value: z.number().min(0, 'Value must be generally positive').optional(),
      applicableOn: z.enum(['subtotal', 'item_total', 'after_other_taxes']).optional(),
      scope: z.enum(['restaurant', 'branch']).default('restaurant'),
      branchId: z.string().regex(objectIdRegex, 'Invalid Branch ID format').optional(),
      category: z.enum(['food_tax', 'service_tax', 'room_tax', 'luxury_tax', 'other']).default('food_tax'),
      parentId: z.string().regex(objectIdRegex, 'Invalid Parent ID format').optional(),
      conditions: z
        .object({
          orderType: z.array(z.enum(['dine-in', 'takeaway'])).optional(),
          minOrderAmount: z.number().min(0).optional(),
          maxOrderAmount: z.number().min(0).optional(),
          specificItems: z
            .array(z.string().regex(objectIdRegex, 'Invalid Item ID format'))
            .optional(),
          specificCategories: z
            .array(z.string().regex(objectIdRegex, 'Invalid Category ID format'))
            .optional(),
        })
        .optional(),
      displayOrder: z.number().optional(),
    })
    .refine(
      (data) => {
        if (data.scope === 'branch' && !data.branchId) {
          return false;
        }
        return true;
      },
      {
        message: 'Branch ID is required when scope is branch',
        path: ['branchId'],
      }
    )
    .refine(
      (data) => {
        if (data.type === 'tax' && data.taxType === undefined) {
          return false;
        }
        return true;
      },
      {
        message: 'taxType is required for tax',
        path: ['taxType'],
      }
    )
    .refine(
      (data) => {
        if (data.type === 'tax' && data.value === undefined) {
          return false;
        }
        return true;
      },
      {
        message: 'value is required for tax',
        path: ['value'],
      }
    ),
});

export const updateTaxSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    type: z.enum(['tax', 'group']).optional(),
    taxType: z.enum(['percentage', 'fixed']).optional(),
    value: z.number().min(0).optional(),
    applicableOn: z.enum(['subtotal', 'item_total', 'after_other_taxes']).optional(),
    scope: z.enum(['restaurant', 'branch']).optional(),
    branchId: z.string().regex(objectIdRegex, 'Invalid Branch ID format').optional(),
    category: z.enum(['food_tax', 'service_tax', 'room_tax', 'luxury_tax', 'other']).optional(),
    parentId: z.string().regex(objectIdRegex, 'Invalid Parent ID format').nullable().optional(),
    conditions: z
      .object({
        orderType: z.array(z.enum(['dine-in', 'takeaway'])).optional(),
        minOrderAmount: z.number().min(0).optional(),
        maxOrderAmount: z.number().min(0).optional(),
        specificItems: z.array(z.string().regex(objectIdRegex)).optional(),
        specificCategories: z.array(z.string().regex(objectIdRegex)).optional(),
      })
      .optional(),
    displayOrder: z.number().optional(),
  }),
});

export const updateTaxStatusSchema = z.object({
  body: z.object({
    isActive: z.boolean(),
  }),
});
