import { Schema, model, Types } from 'mongoose';

export const SAVING_COLLECTION = 'savings';

export type SavingType = 'deposit' | 'withdrawal';
export type SavingSource = 'income' | 'manual' | 'adjustment';

export interface SavingDoc {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  date: Date;
  amount: number;            // + depósito, - retiro
  type: SavingType;          // 'deposit' | 'withdrawal'
  source: SavingSource;      // 'income' | 'manual' | 'adjustment'
  incomeId?: Types.ObjectId; // vinculado al ingreso mensual
  note?: string;
  period: string;            // 'YYYY-MM' (mismo formato que income.month)
}

const SavingSchema = new Schema<SavingDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    date: { type: Date, default: Date.now },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['deposit', 'withdrawal'], required: true },
    source: { type: String, enum: ['income', 'manual', 'adjustment'], default: 'manual' },
    incomeId: { type: Schema.Types.ObjectId, ref: 'incomes' },
    note: { type: String },
    period: { type: String, required: true },
  },
  { timestamps: true }
);

export const SavingModel = model<SavingDoc>(SAVING_COLLECTION, SavingSchema);
