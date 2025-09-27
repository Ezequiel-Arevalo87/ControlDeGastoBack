import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err?.name === 'ZodError') {
    return res.status(400).json({ message: 'Validation error', issues: err.issues });
  }
  const code = err?.message === 'EMAIL_IN_USE' ? 409 : 500;
  res.status(code).json({ message: err?.message || 'Internal error' });
}
