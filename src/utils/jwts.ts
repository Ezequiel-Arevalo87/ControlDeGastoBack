// src/utils/jwts.ts
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

const accessSecret: Secret = env.jwt.accessSecret;
const refreshSecret: Secret = env.jwt.refreshSecret;

export function signAccessToken(payload: object) {
  const opts: SignOptions = { expiresIn: env.jwt.accessExpires };
  return jwt.sign(payload, accessSecret, opts);
}

export function signRefreshToken(payload: object) {
  const opts: SignOptions = { expiresIn: env.jwt.refreshExpires };
  return jwt.sign(payload, refreshSecret, opts);
}

export function verifyAccess(token: string) {
  return jwt.verify(token, accessSecret) as any;
}
export function verifyRefresh(token: string) {
  return jwt.verify(token, refreshSecret) as any;
}
