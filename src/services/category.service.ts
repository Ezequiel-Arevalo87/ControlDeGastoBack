import { Types } from 'mongoose';
import { CategoryModel } from '../models/Category.model';

export async function createCategory(userId: string, data: { name: string; color?: string | null; icon?: string | null; }) {
  return CategoryModel.create({ userId: new Types.ObjectId(userId), ...data });
}

export async function listCategories(userId: string) {
  return CategoryModel.find({ userId, isDeleted: false }).sort({ createdAt: -1 }).lean();
}

export async function updateCategory(userId: string, id: string, data: Partial<{ name: string; color?: string | null; icon?: string | null; isDeleted: boolean; }>) {
  return CategoryModel.findOneAndUpdate(
    { _id: id, userId },
    { $set: data },
    { new: true, runValidators: true }
  );
}

export async function deleteCategory(userId: string, id: string) {
  // Soft-delete para mantener historial en reportes
  return CategoryModel.findOneAndUpdate(
    { _id: id, userId, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  );
}
