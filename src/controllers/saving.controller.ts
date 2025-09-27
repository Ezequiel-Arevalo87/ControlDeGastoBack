import { Request, Response, NextFunction } from 'express';
import {
  createSavingMovement,
  listSavings,
  savingsSummary,
  getSavingsRule,
  upsertSavingsRule,
} from '../services/saving.service';

function getUserId(req: Request) {
  const id = (req as any).user?.id || (req as any).userId;
  if (!id) throw Object.assign(new Error('Unauthorized'), { status: 401 });
  return id as string;
}

/** GET /api/savings?from=YYYY-MM-DD&to=YYYY-MM-DD */
export async function getSavings(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const { from, to } = req.query as { from?: string; to?: string };
    const rows = await listSavings(userId, from, to);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

/** POST /api/savings/movements  { amount: number, date?: string, note?: string }
 *  amount > 0 => depósito, amount < 0 => retiro
 */
export async function postSavingMovement(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const { amount, date, note } = req.body as { amount: number; date?: string; note?: string };

    if (typeof amount !== 'number' || Number.isNaN(amount) || amount === 0) {
      return res.status(400).json({ message: 'amount debe ser un número distinto de 0' });
    }

    const row = await createSavingMovement({
      userId,
      amount,
      date,
      note,
      source: 'manual',
    });

    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
}

import { removeSavingMovement } from '../services/saving.service';

export async function deleteSavingMovement(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const { id } = req.params as { id: string };
    const r = await removeSavingMovement(userId, id);
    if (r.deletedCount === 0) return res.status(404).json({ message: 'No encontrado' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}


/** GET /api/savings/summary?period=YYYY-MM */
export async function getSavingsSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const { period } = req.query as { period?: string };

    if (!period) {
      return res.status(400).json({ message: 'period (YYYY-MM) es requerido' });
    }

    const data = await savingsSummary(userId, period);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

/** GET /api/savings/rule */
export async function getRule(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const rule = await getSavingsRule(userId);
    res.json(rule);
  } catch (err) {
    next(err);
  }
}

/** PUT /api/savings/rule  { mode: 'percent'|'fixed', value: number, active?: boolean } */
export async function putRule(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const { mode, value, active } = req.body as {
      mode: 'percent' | 'fixed';
      value: number;
      active?: boolean;
    };

    if (!mode || !['percent', 'fixed'].includes(mode)) {
      return res.status(400).json({ message: "mode debe ser 'percent' o 'fixed'" });
    }
    if (typeof value !== 'number' || value < 0) {
      return res.status(400).json({ message: 'value debe ser un número >= 0' });
    }

    const rule = await upsertSavingsRule(userId, { mode, value, active });
    res.json(rule);
  } catch (err) {
    next(err);
  }
}
