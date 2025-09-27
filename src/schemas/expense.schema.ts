import { z } from 'zod';

const PERIOD_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

export const createExpenseSchema = z.object({
  body: z.object({
    period: z.string().regex(PERIOD_REGEX, 'period debe ser YYYY-MM'),
    billCode: z.string().min(1).max(60),
    company: z.string().min(1).max(120),
    description: z.string().max(500).optional().nullable(),
    value: z.number().positive(),
    categoryId: z.string().min(1).optional(),
    type: z.enum(['servicio', 'compra', 'otro']),
  }),
});

export const updateExpenseSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    period: z.string().regex(PERIOD_REGEX).optional(),
    billCode: z.string().min(1).max(60).optional(),
    company: z.string().min(1).max(120).optional(),
    description: z.string().max(500).optional().nullable(),
    value: z.number().positive().optional(),
    categoryId: z.string().min(1).optional().nullable(),
    type: z.enum(['servicio', 'compra', 'otro']).optional(),
  }).refine((data) => Object.keys(data).length > 0, { message: 'Sin cambios' }),
});

export const listExpenseQuerySchema = z.object({
  query: z.object({
    period: z.string().regex(PERIOD_REGEX).optional(),
    company: z.string().optional(),
    type: z.enum(['servicio', 'compra', 'otro']).optional(),
    categoryId: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});
