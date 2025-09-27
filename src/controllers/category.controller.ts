import { Request, Response, NextFunction } from 'express';
import * as service from '../services/category.service';

export async function createCategoryCtrl(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id as string;
    const cat = await service.createCategory(userId, req.body);
    res.status(201).json(cat);
  } catch (err) { next(err); }
}

export async function listCategoriesCtrl(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id as string;
    const cats = await service.listCategories(userId);
    res.json(cats);
  } catch (err) { next(err); }
}

export async function updateCategoryCtrl(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id as string;
    const { id } = req.params;
    const updated = await service.updateCategory(userId, id, req.body);
    if (!updated) return res.status(404).json({ message: 'Category no encontrada' });
    res.json(updated);
  } catch (err) { next(err); }
}

export async function deleteCategoryCtrl(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id as string;
    const { id } = req.params;
    const deleted = await service.deleteCategory(userId, id);
    if (!deleted) return res.status(404).json({ message: 'Category no encontrada' });
    res.json({ message: 'Category eliminada (soft-delete)', category: deleted });
  } catch (err) { next(err); }
}
