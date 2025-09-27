// src/config/env.ts
import 'dotenv/config';
import type { Secret } from 'jsonwebtoken';
import type { StringValue } from 'ms';

function mustGet(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: mustGet('MONGO_URI'),
  jwt: {
    accessSecret: mustGet('JWT_ACCESS_SECRET') as Secret,
    refreshSecret: mustGet('JWT_REFRESH_SECRET') as Secret,
    accessExpires: (process.env.JWT_ACCESS_EXPIRES ?? '15m') as StringValue,
    refreshExpires: (process.env.JWT_REFRESH_EXPIRES ?? '7d') as StringValue,
  },
};
