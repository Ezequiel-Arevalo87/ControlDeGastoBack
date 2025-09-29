// routes/income.routes.ts
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import * as ctrl from '../controllers/income.controller';

const router = Router();

router.use(requireAuth);

// Lista todos
router.get('/', ctrl.list);

// Obtener por mes (YYYY-MM) - método GET
router.get('/:month', ctrl.get);

// Crear/Upsert por (userId, month) - método POST
router.post('/', ctrl.upsert);

// Editar por id - método PUT (permite cambiar month)
router.put('/:id', ctrl.update);

export default router;
