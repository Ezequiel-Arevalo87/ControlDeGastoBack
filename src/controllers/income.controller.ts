import { Request, Response } from 'express';
import { incomeUpsertDto } from './dtos';
import * as svc from '../services/income.service';

export async function upsert(req: Request, res: Response) {
  const userId = (req as any).user.id as string;
  const data = incomeUpsertDto.parse(req.body);
  const doc = await svc.upsertIncome(userId, data.month, data.amount, data.note);
  res.status(201).json(doc);
}
export async function get(req: Request, res: Response) {
  const userId = (req as any).user.id as string;
  const month = req.params.month;
  const doc = await svc.getIncome(userId, month);
  res.json(doc);
}
export async function list(req: Request, res: Response) {
  const userId = (req as any).user.id as string;
  res.json(await svc.listIncome(userId));
}
