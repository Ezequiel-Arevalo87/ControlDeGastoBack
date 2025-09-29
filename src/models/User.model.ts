import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

const userSchema = new Schema({
  email: { type: String, unique: true, required: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

// shape plano (sin _id)
export type User = InferSchemaType<typeof userSchema>;

// documento hidratado (CON _id y virtual id:string)
export type UserDoc = HydratedDocument<User>;

export const UserModel = model<User>('User', userSchema);
