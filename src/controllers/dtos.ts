import { z } from 'zod';
import { isYYYYMM, normalizeYYYYMM } from '../utils/period';

export const categoryCreateDto = z.object({
  name: z.string().min(2).max(60),
  kind: z.enum(['servicio','compra','otro']).default('otro')
});

export const incomeUpsertDto = z.object({
  month: z.string().transform(normalizeYYYYMM).refine(isYYYYMM, 'month debe ser YYYY-MM'),
  amount: z.number().nonnegative(),
  note: z.string().optional()
});

export const expenseCreateDto = z.object({
  period: z.string().transform(normalizeYYYYMM).refine(isYYYYMM, 'period debe ser YYYY-MM'),
  billCode: z.string().min(1),
  company: z.string().min(1),
  description: z.string().optional(),
  value: z.number().nonnegative(),
  categoryId: z.string().optional(),
  type: z.enum(['servicio','compra','otro']).default('otro')
});

export const expenseUpdateDto = expenseCreateDto.partial().extend({
  // no permitimos cambiar billCode+period juntos a un duplicado; la regla la valida el servicio
});
