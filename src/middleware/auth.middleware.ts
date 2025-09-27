import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
    // @ts-ignore
    req.user = { id: (payload as any).sub || (payload as any).id };
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido/expirado' });
  }
}
