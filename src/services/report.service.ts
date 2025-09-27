// src/services/report.service.ts
import { Types } from 'mongoose';
import { ExpenseModel } from '../models/Expense.model';

// Nota: colección Income: { userId:ObjectId, month:"YYYY-MM", amount:Number }
const INCOME_COLLECTION = 'incomes';

function monthsBetween(from: string, to: string) {
  // ambos YYYY-MM
  const [fy, fm] = from.split('-').map(Number);
  const [ty, tm] = to.split('-').map(Number);
  const months: string[] = [];
  let y = fy, m = fm;
  while (y < ty || (y === ty && m <= tm)) {
    months.push(`${y}-${String(m).padStart(2, '0')}`);
    m++;
    if (m > 12) { m = 1; y++; }
  }
  return months;
}

export async function balanceByMonth(userId: string, from: string, to: string) {
  const uid = new Types.ObjectId(userId);
  const months = monthsBetween(from, to);

  const expensesAgg = await ExpenseModel.aggregate([
    { $match: { userId: uid, period: { $in: months } } },
    { $group: { _id: '$period', totalExpenses: { $sum: '$value' } } },
  ]);

  const expensesMap = new Map(
    expensesAgg.map(x => [x._id as string, x.totalExpenses as number])
  );

  // Ingresos por mes (colección incomes)
  const incomeAgg = await ExpenseModel.db
    .collection(INCOME_COLLECTION)
    .aggregate([
      { $match: { userId: uid, month: { $in: months } } },
      { $group: { _id: '$month', totalIncome: { $sum: '$amount' } } },
    ])
    .toArray();

  const incomeMap = new Map(
    (incomeAgg as any[]).map(x => [x._id as string, x.totalIncome as number])
  );

  const rows = months.map((month) => {
    const income = incomeMap.get(month) ?? 0;
    const expense = expensesMap.get(month) ?? 0;
    return { month, income, expense, balance: income - expense };
  });

  // variación mes a mes en balance
  let prev: number | null = null;
  const withVariation = rows.map((r) => {
    const variation = prev === null ? null : r.balance - prev;
    prev = r.balance;
    return { ...r, variation };
  });

  return withVariation;
}

export async function expensesByCategory(userId: string, period: string) {
  const uid = new Types.ObjectId(userId);
  const rows = await ExpenseModel.aggregate([
    { $match: { userId: uid, period } },
    {
      $lookup: {
        from: 'categories',
        localField: 'categoryId',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: { categoryId: '$categoryId', name: '$category.name' },
        total: { $sum: '$value' },
        count: { $sum: 1 },
      },
    },
    { $project: { _id: 0, categoryId: '$_id.categoryId', name: '$_id.name', total: 1, count: 1 } },
    { $sort: { total: -1 } },
  ]);

  // gastos sin categoría => name: null
  return rows;
}

export async function expensesSummary(userId: string, period: string) {
  const uid = new Types.ObjectId(userId);

  // === GASTOS del periodo ===
  const [expAgg] = await ExpenseModel.aggregate([
    { $match: { userId: uid, period } },
    { $group: { _id: null, total: { $sum: '$value' }, count: { $sum: 1 } } },
    { $project: { _id: 0, total: 1, count: 1 } },
  ]);

  const totalExpense = expAgg?.total ?? 0;
  const count = expAgg?.count ?? 0;

  // === INGRESOS del periodo === (colección incomes)
  const [incAgg] = await ExpenseModel.db
    .collection(INCOME_COLLECTION)
    .aggregate([
      { $match: { userId: uid, month: period } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
      { $project: { _id: 0, total: 1 } },
    ])
    .toArray();

  const totalIncome = (incAgg as any)?.total ?? 0;

  // === BALANCE ===
  const balance = totalIncome - totalExpense;

  return { period, totalIncome, totalExpense, balance, count };
}
