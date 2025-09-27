import { Request, Response, NextFunction } from 'express';
import * as service from '../services/expense.service';

export async function createExpenseCtrl(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id as string;
    const exp = await service.createExpense(userId, req.body);
    res.status(201).json(exp);
  } catch (err: any) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'billCode ya existe para ese period' });
    }
    next(err);
  }
}

export async function getExpenseCtrl(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id as string;
    const { id } = req.params;
    const exp = await service.getExpense(userId, id);
    if (!exp) return res.status(404).json({ message: 'Expense no encontrado' });
    res.json(exp);
  } catch (err) { next(err); }
}

export async function listExpensesCtrl(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id as string;
    const result = await service.listExpenses(userId, req.query as any);
    res.json(result);
  } catch (err) { next(err); }
}

export async function updateExpenseCtrl(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id as string;
    const { id } = req.params;
    const updated = await service.updateExpense(userId, id, req.body);
    if (!updated) return res.status(404).json({ message: 'Expense no encontrado' });
    res.json(updated);
  } catch (err: any) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'billCode ya existe para ese period' });
    }
    next(err);
  }
}

export async function deleteExpenseCtrl(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id as string;
    const { id } = req.params;
    const deleted = await service.deleteExpense(userId, id);
    if (!deleted) return res.status(404).json({ message: 'Expense no encontrado' });
    res.json({ message: 'Expense eliminado', expense: deleted });
  } catch (err) { next(err); }
}
