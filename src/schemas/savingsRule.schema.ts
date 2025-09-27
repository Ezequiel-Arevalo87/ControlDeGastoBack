import { Schema, model, Types } from 'mongoose';

export const SAVINGS_RULE_COLLECTION = 'savings_rules';
export type RuleMode = 'percent' | 'fixed';

export interface SavingsRuleDoc {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  mode: RuleMode;    // 'percent' (sobre el ingreso) o 'fixed' (valor fijo/mes)
  value: number;     // percent: 20 => 20%, fixed: valor en pesos
  active: boolean;
}

const SavingsRuleSchema = new Schema<SavingsRuleDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'users', unique: true, required: true },
    mode: { type: String, enum: ['percent', 'fixed'], default: 'percent' },
    value: { type: Number, default: 20 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const SavingsRuleModel = model<SavingsRuleDoc>(SAVINGS_RULE_COLLECTION, SavingsRuleSchema);
