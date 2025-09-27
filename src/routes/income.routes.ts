import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';

import * as ctrl from '../controllers/income.controller';

const router = Router();
router.use(requireAuth);
router.get('/', ctrl.list);
router.get('/:month', ctrl.get);          // /api/income/2025-09
router.post('/', ctrl.upsert);            // upsert

export default router;
