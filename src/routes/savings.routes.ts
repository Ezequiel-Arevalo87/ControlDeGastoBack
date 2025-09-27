import { Router } from 'express';

import {
  getSavings,
  postSavingMovement,
  getSavingsSummary,
  getRule,
  putRule,
} from '../controllers/saving.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { deleteSavingMovement } from '../controllers/saving.controller';
const router = Router();

router.use(requireAuth);

router.get('/', getSavings);                    // lista movimientos (rango fechas opcional)
router.post('/movements', postSavingMovement);  // crea depósito/retiro manual
router.get('/summary', getSavingsSummary);      // resumen mensual (YYYY-MM)

router.delete('/movements/:id', deleteSavingMovement);

router.get('/rule', getRule);                   // ver regla de ahorro
router.put('/rule', putRule);                   // actualizar regla

export default router;
