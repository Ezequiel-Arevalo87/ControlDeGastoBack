import { Schema, model, InferSchemaType } from 'mongoose';

const incomeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  month:  { type: String, required: true }, // YYYY-MM
  amount: { type: Number, required: true, min: 0 },
  note:   { type: String }
}, { timestamps: true });

// Un ingreso por mes por usuario (upsert)
incomeSchema.index({ userId: 1, month: 1 }, { unique: true });

export type IncomeDoc = InferSchemaType<typeof incomeSchema>;
export const IncomeModel = model<IncomeDoc>('Income', incomeSchema);
