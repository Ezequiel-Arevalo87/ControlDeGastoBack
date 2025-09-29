// services/income.service.ts
import { IncomeModel } from '../models/Income.model';
import { syncIncomeSaving } from './saving.service';

/**
 * Upsert por (userId, month): crea o actualiza el monto/nota del mes.
 * Mantiene el comportamiento que ya tenías en POST /income.
 */
export async function upsertIncome(
  userId: string,
  month: string,
  amount: number,
  note?: string
) {
  const income = await IncomeModel.findOneAndUpdate(
    { userId, month },
    { $set: { amount, note } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  // Sincroniza el ahorro automático para ese mes
  await syncIncomeSaving({
    userId,
    incomeId: income._id.toString(),
    month,
    incomeAmount: amount,
    noteBase: 'Ahorro automático desde ingreso',
  });

  return income;
}

/**
 * Update por id (permite CAMBIAR month).
 * Maneja colisión del índice único devolviendo error 11000 que el controller mapea a 409.
 */
export async function updateIncome(
  userId: string,
  id: string,
  month: string,
  amount: number,
  note?: string
) {
  // Validar pertenencia
  const income = await IncomeModel.findOne({ _id: id, userId });
  if (!income) return null;

  const changedMonth = income.month !== month;

  income.month = month;
  income.amount = amount;
  income.note = note;

  // Guardar respetando índice único (userId, month)
  const saved = await income.save(); // dispara 11000 si colisiona

  // Si cambió mes o monto, re-sincroniza el ahorro
  if (changedMonth || income.isModified('amount')) {
    await syncIncomeSaving({
      userId,
      incomeId: saved._id.toString(),
      month: saved.month,
      incomeAmount: saved.amount,
      noteBase: 'Ajuste de ingreso (edición)',
    });
  }

  return saved;
}

export async function getIncome(userId: string, month: string) {
  return IncomeModel.findOne({ userId, month });
}

export async function listIncome(userId: string) {
  return IncomeModel.find({ userId }).sort({ month: 1 });
}
