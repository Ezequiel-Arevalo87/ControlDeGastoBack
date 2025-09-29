// controllers/income.controller.ts
import { Request, Response } from 'express';
import { incomeUpsertDto, incomeUpdateDto } from './dtos';
import * as svc from '../services/income.service';

/**
 * POST /income
 * Upsert por (userId, month). Crea o actualiza el monto/nota del mes.
 */
export async function upsert(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id as string;
    const data = incomeUpsertDto.parse(req.body);

    const doc = await svc.upsertIncome(userId, data.month, data.amount, data.note);
    // 201 porque puede insertar; si actualiza igual es seguro devolver 201 en este flujo de upsert
    res.status(201).json(doc);
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return res.status(400).json({ message: 'Payload inválido', issues: err.issues });
    }
    // 11000 = índice único
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'Ya existe un ingreso para ese periodo.' });
    }
    console.error('POST /income error:', err);
    return res.status(500).json({ message: 'Error al guardar ingreso' });
  }
}

/**
 * PUT /income/:id
 * Edita por id. Permite CAMBIAR el month (mover a otro periodo).
 */
export async function update(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id as string;
    const id = req.params.id;
    const data = incomeUpdateDto.parse(req.body);

    const doc = await svc.updateIncome(userId, id, data.month, data.amount, data.note);
    if (!doc) return res.status(404).json({ message: 'Ingreso no encontrado' });

    res.json(doc);
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return res.status(400).json({ message: 'Payload inválido', issues: err.issues });
    }
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'Ya existe un ingreso para ese periodo.' });
    }
    console.error('PUT /income/:id error:', err);
    return res.status(500).json({ message: 'Error al actualizar ingreso' });
  }
}

/**
 * GET /income/:month   (ej: /income/2025-09)
 */
export async function get(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id as string;
    const month = req.params.month;
    const doc = await svc.getIncome(userId, month);
    if (!doc) return res.status(404).json({ message: 'No hay ingreso en ese periodo' });
    res.json(doc);
  } catch (err) {
    console.error('GET /income/:month error:', err);
    res.status(500).json({ message: 'Error al obtener ingreso' });
  }
}

/**
 * GET /income
 */
export async function list(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id as string;
    res.json(await svc.listIncome(userId));
  } catch (err) {
    console.error('GET /income error:', err);
    res.status(500).json({ message: 'Error al listar ingresos' });
  }
}
