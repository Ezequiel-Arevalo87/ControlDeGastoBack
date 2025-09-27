import { UserModel } from '../models/User.model';
// src/services/auth.service.ts
import bcrypt from 'bcryptjs';


export async function registerUser(email: string, password: string) {
  const exists = await UserModel.findOne({ email });
  if (exists) throw new Error('EMAIL_IN_USE');
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await UserModel.create({ email, passwordHash });
  return user;
}

export async function validateUser(email: string, password: string) {
  const user = await UserModel.findOne({ email });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user : null;
}
