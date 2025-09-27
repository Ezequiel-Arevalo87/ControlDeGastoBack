import { IncomeModel } from '../models/Income.model';
import { syncIncomeSaving } from './saving.service';

export async function upsertIncome(
  userId: string,
  month: string,
  amount: number,
  note?: string
) {
  // crea/actualiza el ingreso mensual
  const income = await IncomeModel.findOneAndUpdate(
    { userId, month },
    { $set: { amount, note } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  // Garantiza el ahorro automático del mes (único por ingreso)
  await syncIncomeSaving({
    userId,
    incomeId: income._id.toString(),
    month,
    incomeAmount: amount,
    noteBase: 'Ahorro automático desde ingreso',
  });

  return income;
}

export async function getIncome(userId: string, month: string) {
  return IncomeModel.findOne({ userId, month });
}

export async function listIncome(userId: string) {
  return IncomeModel.find({ userId }).sort({ month: 1 });
}
