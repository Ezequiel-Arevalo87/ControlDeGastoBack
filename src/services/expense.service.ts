import { Types } from 'mongoose';
import { ExpenseModel } from '../models/Expense.model';
import { CategoryModel } from '../models/Category.model';

type ListFilters = {
  period?: string;
  company?: string;
  type?: 'servicio' | 'compra' | 'otro';
  categoryId?: string;
  page?: number;
  limit?: number;
};

// --- util opcional: asegura que la categoría sea del usuario y no esté eliminada
async function assertCategoryUsable(userId: string, categoryId?: string | null) {
  if (!categoryId) return;
  if (!Types.ObjectId.isValid(categoryId)) throw new Error('categoryId inválido');
  const ok = await CategoryModel.exists({
    _id: new Types.ObjectId(categoryId),
    userId: new Types.ObjectId(userId),
    isDeleted: false,
  });
  if (!ok) throw new Error('Categoría no válida para este usuario');
}

export async function createExpense(
  userId: string,
  data: {
    period: string; billCode: string; company: string; description?: string | null;
    value: number; categoryId?: string; type: 'servicio' | 'compra' | 'otro';
  }
) {
  await assertCategoryUsable(userId, data.categoryId);
  const payload: any = { ...data, userId: new Types.ObjectId(userId) };
  if (data.categoryId) payload.categoryId = new Types.ObjectId(data.categoryId);
  return ExpenseModel.create(payload);
}

// --- GET /expenses/:id (con populate y mapeo)
export async function getExpense(userId: string, id: string) {
  const e: any = await ExpenseModel.findOne({ _id: id, userId })
    .populate({ path: 'categoryId', select: 'name color icon' })
    .lean();

  if (!e) return null;

  return {
    _id: e._id,
    period: e.period,
    billCode: e.billCode,
    company: e.company,
    description: e.description ?? null,
    value: e.value,
    type: e.type,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
    categoryId: e.categoryId?._id ?? null,
    category: e.categoryId
      ? { _id: e.categoryId._id, name: e.categoryId.name, color: e.categoryId.color, icon: e.categoryId.icon }
      : null,
  };
}

// --- GET /expenses (lista con populate + paginación)
export async function listExpenses(userId: string, filters: ListFilters) {
  const page = Math.max(1, Number(filters.page ?? 1));
  const limit = Math.max(1, Math.min(100, Number(filters.limit ?? 20)));
  const skip = (page - 1) * limit;

  const query: any = { userId: new Types.ObjectId(userId) };
  if (filters.period) query.period = filters.period;
  if (filters.company) query.company = { $regex: filters.company, $options: 'i' };
  if (filters.type) query.type = filters.type;
  if (filters.categoryId && Types.ObjectId.isValid(filters.categoryId)) {
    query.categoryId = new Types.ObjectId(filters.categoryId);
  }

  const [itemsRaw, total] = await Promise.all([
    ExpenseModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit)
      .populate({ path: 'categoryId', select: 'name color icon' })
      .lean(),
    ExpenseModel.countDocuments(query),
  ]);

  const items = itemsRaw.map((e: any) => ({
    _id: e._id,
    period: e.period,
    billCode: e.billCode,
    company: e.company,
    description: e.description ?? null,
    value: e.value,
    type: e.type,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
    categoryId: e.categoryId?._id ?? null,
    category: e.categoryId
      ? { _id: e.categoryId._id, name: e.categoryId.name, color: e.categoryId.color, icon: e.categoryId.icon }
      : null,
  }));

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

// --- PATCH /expenses/:id (valida categoría, mantiene populate si quieres devolver el doc actualizado)
export async function updateExpense(
  userId: string,
  id: string,
  data: Partial<{
    period: string; billCode: string; company: string; description?: string | null;
    value: number; categoryId?: string | null; type: 'servicio' | 'compra' | 'otro';
  }>
) {
  if ('categoryId' in data) {
    await assertCategoryUsable(userId, data.categoryId ?? undefined);
  }

  const $set: any = { ...data };
  if ('categoryId' in data) {
    $set.categoryId = data.categoryId ? new Types.ObjectId(data.categoryId) : null;
  }

  const e: any = await ExpenseModel.findOneAndUpdate(
    { _id: id, userId },
    { $set },
    { new: true, runValidators: true }
  )
    .populate({ path: 'categoryId', select: 'name color icon' })
    .lean();

  if (!e) return null;

  return {
    _id: e._id,
    period: e.period,
    billCode: e.billCode,
    company: e.company,
    description: e.description ?? null,
    value: e.value,
    type: e.type,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
    categoryId: e.categoryId?._id ?? null,
    category: e.categoryId
      ? { _id: e.categoryId._id, name: e.categoryId.name, color: e.categoryId.color, icon: e.categoryId.icon }
      : null,
  };
}

export async function deleteExpense(userId: string, id: string) {
  return ExpenseModel.findOneAndDelete({ _id: id, userId });
}
