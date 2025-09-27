import { z } from 'zod';
const PERIOD_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

export const balanceQuerySchema = z.object({
  query: z.object({
    from: z.string().regex(PERIOD_REGEX),
    to: z.string().regex(PERIOD_REGEX),
  }),
});

export const byCategoryQuerySchema = z.object({
  query: z.object({
    period: z.string().regex(PERIOD_REGEX),
  }),
});
