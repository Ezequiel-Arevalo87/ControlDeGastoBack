import { Request, Response } from 'express';
import { z } from 'zod';
import { registerUser, validateUser, findUserById } from '../services/auth.service';
import { signAccessToken, signRefreshToken, verifyRefresh } from '../utils/jwts';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// ============ /auth/register ============
export async function register(req: Request, res: Response) {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', issues: parsed.error.flatten() });
  }

  try {
    const { email, password } = parsed.data;
    const user = await registerUser(email, password);

    // Si quieres “autologin” tras registrarse, deja estas 4 líneas:
    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    const refreshToken = signRefreshToken({ sub: user.id });
    return res.status(201).json({ accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } });

    // Si NO quieres autologin y prefieres tu respuesta mínima, usa esto:
    // return res.status(201).json({ id: user.id, email: user.email });
  } catch (err: any) {
    const status = err?.status ?? 500;
    const message = err?.message ?? 'Internal server error';
    return res.status(status).json({ message });
  }
}

// ============ /auth/login ============
export async function login(req: Request, res: Response) {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', issues: parsed.error.flatten() });
  }

  const { email, password } = parsed.data;
  const user = await validateUser(email, password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id });

  return res.json({
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, role: user.role },
  });
}

// ============ /auth/refresh ============
export async function refresh(req: Request, res: Response) {
  const schema = z.object({ refreshToken: z.string().min(10) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', issues: parsed.error.flatten() });
  }

  const { refreshToken } = parsed.data;

  try {
    const { sub } = verifyRefresh(refreshToken); // el refresh SOLO tiene sub
    const user = await findUserById(String(sub));
    if (!user) return res.status(401).json({ message: 'Invalid refresh token' });

    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    return res.json({ accessToken });
  } catch {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
}
