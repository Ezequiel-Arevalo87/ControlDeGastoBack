import { Schema, model, Types } from 'mongoose';

export type ExpenseType = 'servicio' | 'compra' | 'otro';

export interface Expense {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  period: string;            // YYYY-MM
  billCode: string;          // único por (userId, period)
  company: string;
  description?: string | null;
  value: number;             // > 0
  categoryId?: Types.ObjectId | null;
  type: ExpenseType;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<Expense>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    period: { type: String, required: true, index: true }, // validado por Zod (YYYY-MM)
    billCode: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    description: { type: String, default: null },
    value: { type: Number, required: true, min: 0 },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    type: { type: String, enum: ['servicio', 'compra', 'otro'], required: true },
  },
  { timestamps: true }
);

// índice único (userId, billCode, period)
expenseSchema.index({ userId: 1, billCode: 1, period: 1 }, { unique: true });

export const ExpenseModel = model<Expense>('Expense', expenseSchema);
