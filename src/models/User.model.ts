import { Schema, model, InferSchemaType } from 'mongoose';

const userSchema = new Schema({
  email: { type: String, unique: true, required: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user','admin'], default: 'user' }
}, { timestamps: true });

export type UserDoc = InferSchemaType<typeof userSchema>;
export const UserModel = model<UserDoc>('User', userSchema);
