import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'name requerido').max(100),
    color: z.string().min(1).max(30).optional().nullable(),
    icon: z.string().min(1).max(50).optional().nullable(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    color: z.string().min(1).max(30).optional().nullable(),
    icon: z.string().min(1).max(50).optional().nullable(),
    isDeleted: z.boolean().optional(),
  }).refine((data) => Object.keys(data).length > 0, { message: 'Sin cambios' }),
});
