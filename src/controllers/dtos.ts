// controllers/dtos.ts
import { z } from 'zod';
import { isYYYYMM, normalizeYYYYMM } from '../utils/period';

// ---- helpers reutilizables ----
const monthSchema = z
  .string()
  .transform(normalizeYYYYMM)
  .refine(isYYYYMM, 'month debe ser YYYY-MM');

const nonNegativeAmount = z.coerce.number().nonnegative();

// =====================================
// Categorías
// =====================================
export const categoryCreateDto = z.object({
  name: z.string().min(2).max(60),
  kind: z.enum(['servicio','compra','otro']).default('otro'),
});

// =====================================
// Ingresos (Income)
// =====================================

// POST /income  (upsert por userId + month)
export const incomeUpsertDto = z.object({
  month: monthSchema,
  amount: nonNegativeAmount,
  note: z.string().trim().optional(),
});

// PUT /income/:id  (edición por id, permite cambiar month)
export const incomeUpdateDto = z.object({
  month: monthSchema,
  amount: nonNegativeAmount,
  note: z.string().trim().optional(),
});

// =====================================
// Gastos (Expense)
// =====================================
export const expenseCreateDto = z.object({
  period: z.string().transform(normalizeYYYYMM).refine(isYYYYMM, 'period debe ser YYYY-MM'),
  billCode: z.string().min(1),
  company: z.string().min(1),
  description: z.string().optional(),
  value: z.number().nonnegative(),
  categoryId: z.string().optional(),
  type: z.enum(['servicio','compra','otro']).default('otro'),
});

// Para PATCH/PUT de gastos: campos opcionales
export const expenseUpdateDto = expenseCreateDto.partial().extend({
  // Nota: no permitimos crear duplicados (billCode+period) — regla a validar en el servicio
});
