// src/utils/validate.ts
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Espera esquemas del tipo: z.object({ body?, query?, params? })
type RequestSchema = z.ZodObject<{
  body?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
}>;

export const validate = (schema: RequestSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      const err = error as z.ZodError;
      const details = err.issues.map(i => ({
        path: i.path.join('.'),
        message: i.message,
        code: i.code,
      }));
      return res.status(400).json({ message: 'Validación fallida', errors: details });
    }
  };
};

// opcional: también como default, para que cualquier forma de import funcione
export default validate;
