// src/services/saving.service.ts
import { Types } from 'mongoose';
import { SavingModel } from '../models/Saving.model';
import { SavingsRuleModel } from '../models/SavingsRule.model';

export type RuleMode = 'percent' | 'fixed';

export function makePeriod(date: Date | string) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/** ===== Reglas ===== */
export async function getSavingsRule(userId: string) {
  const uid = new Types.ObjectId(userId);
  const rule = await SavingsRuleModel.findOne({ userId: uid });
  if (rule) return rule;
  // por defecto 20% activo
  return SavingsRuleModel.create({ userId: uid, mode: 'percent', value: 20, active: true });
}

export async function upsertSavingsRule(
  userId: string,
  data: { mode: RuleMode; value: number; active?: boolean }
) {
  const uid = new Types.ObjectId(userId);
  return SavingsRuleModel.findOneAndUpdate(
    { userId: uid },
    { $set: { mode: data.mode, value: data.value, active: data.active ?? true } },
    { new: true, upsert: true }
  );
}

export async function computeSavingForIncome(userId: string, incomeAmount: number) {
  const rule = await getSavingsRule(userId);
  if (!rule.active) return 0;
  if (rule.mode === 'percent') return Math.max(0, Math.round((incomeAmount * rule.value) / 100));
  return Math.max(0, Math.min(Math.round(rule.value), Math.round(incomeAmount)));
}

/** ===== Movimientos ===== */
export async function createSavingMovement(params: {
  userId: string;
  amount: number;                 // + depósito, - retiro
  date?: Date | string;
  source?: 'income' | 'manual' | 'adjustment';
  incomeId?: string;
  note?: string;
}) {
  const { userId, amount, date = new Date(), source = 'manual', incomeId, note } = params;
  const uid = new Types.ObjectId(userId);
  const pid = incomeId ? new Types.ObjectId(incomeId) : undefined;
  const type = amount >= 0 ? 'deposit' : 'withdrawal';
  return SavingModel.create({
    userId: uid,
    date,
    amount,
    type,
    source,
    incomeId: pid,
    note,
    period: makePeriod(date),
  });
}

export async function listSavings(userId: string, from?: string, to?: string) {
  const uid = new Types.ObjectId(userId);
  const q: any = { userId: uid };
  if (from || to) {
    q.date = {};
    if (from) q.date.$gte = new Date(from);
    if (to) q.date.$lte = new Date(to);
  }
  return SavingModel.find(q).sort({ date: -1, _id: -1 });
}

export async function savingsSummary(userId: string, period: string) {
  const uid = new Types.ObjectId(userId);
  const agg = await SavingModel.aggregate([
    { $match: { userId: uid, period } },
    {
      $group: {
        _id: null,
        deposits: { $sum: { $cond: [{ $gte: ['$amount', 0] }, '$amount', 0] } },
        withdrawals: { $sum: { $cond: [{ $lt: ['$amount', 0] }, '$amount', 0] } },
        net: { $sum: '$amount' },
      },
    },
  ]);
  const row = agg[0] ?? { deposits: 0, withdrawals: 0, net: 0 };
  return { period, ...row };
}

/** ===== Sincroniza ahorro automático de un ingreso mensual ===== */
export async function syncIncomeSaving(params: {
  userId: string;
  incomeId: string;
  month: string;       // YYYY-MM
  incomeAmount: number;
  noteBase?: string;
}) {
  const { userId, incomeId, month, incomeAmount, noteBase = 'Ahorro automático' } = params;
  const uid = new Types.ObjectId(userId);
  const incId = new Types.ObjectId(incomeId);

  const target = await computeSavingForIncome(userId, incomeAmount);
  const existing = await SavingModel.findOne({ userId: uid, incomeId: incId });

  if (target <= 0) {
    if (existing) await SavingModel.deleteOne({ _id: existing._id });
    return null;
  }

  const payload = {
    userId: uid,
    date: new Date(),
    amount: target,
    type: 'deposit' as const,
    source: 'income' as const,
    incomeId: incId,
    note: `${noteBase} ${target} para ${month}`,
    period: month,
  };

  if (existing) {
    existing.set(payload);
    return existing.save();
  }



  return SavingModel.create(payload);
}

export async function removeSavingMovement(userId: string, id: string) {
  const uid = new Types.ObjectId(userId);
  const _id = new Types.ObjectId(id);
  return SavingModel.deleteOne({ _id, userId: uid });
}
