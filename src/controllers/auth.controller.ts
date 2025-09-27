import { Request, Response } from 'express';
import { z } from 'zod';
import { registerUser, validateUser } from '../services/auth.service';

import { signAccessToken, signRefreshToken, verifyRefresh } from '../utils/jwts';

// (el resto igual)


const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export async function register(req: Request, res: Response) {
  const data = credentialsSchema.parse(req.body);
  const user = await registerUser(data.email, data.password);
  res.status(201).json({ id: user._id, email: user.email });
}

export async function login(req: Request, res: Response) {
  const { email, password } = credentialsSchema.parse(req.body);
  const user = await validateUser(email, password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const accessToken = signAccessToken({ sub: user._id, role: user.role });
  const refreshToken = signRefreshToken({ sub: user._id });

  res.json({ accessToken, refreshToken, user: { id: user._id, email: user.email, role: user.role } });
}

export async function refresh(req: Request, res: Response) {
  const schema = z.object({ refreshToken: z.string().min(10) });
  const { refreshToken } = schema.parse(req.body);
  try {
    const payload = verifyRefresh(refreshToken);
    const accessToken = signAccessToken({ sub: payload.sub, role: payload.role });
    res.json({ accessToken });
  } catch {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
}
