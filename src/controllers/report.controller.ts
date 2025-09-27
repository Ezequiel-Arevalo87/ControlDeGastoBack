import { Request, Response, NextFunction } from 'express';
import { balanceByMonth, expensesByCategory, expensesSummary } from '../services/report.service';

export async function balanceCtrl(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id as string;
    const { from, to } = req.query as any;
    const rows = await balanceByMonth(userId, from, to);
    res.json(rows);
  } catch (err) { next(err); }
}

export async function byCategoryCtrl(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id as string;
    const { period } = req.query as any;
    const rows = await expensesByCategory(userId, period);
    res.json(rows);
  } catch (err) { next(err); }
}

export async function expensesSummaryCtrl(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id as string;
    const { period } = req.query as any;
    const data = await expensesSummary(userId, period);
    res.json(data);
  } catch (err) { next(err); }
}
