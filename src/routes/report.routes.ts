import { Router } from 'express';

import { balanceCtrl, byCategoryCtrl, expensesSummaryCtrl } from '../controllers/report.controller';
import { balanceQuerySchema, byCategoryQuerySchema } from '../schemas/report.schema';
import { validate } from '../utils/validate';
import { requireAuth } from '../middleware/auth.middleware';


const router = Router();

router.use(requireAuth);

// /api/reports/balance?from=YYYY-MM&to=YYYY-MM
router.get('/balance', validate(balanceQuerySchema), balanceCtrl);

// /api/reports/expenses/by-category?period=YYYY-MM
router.get('/expenses/by-category', validate(byCategoryQuerySchema), byCategoryCtrl);

// /api/reports/expenses/summary?period=YYYY-MM
router.get('/expenses/summary', validate(byCategoryQuerySchema), expensesSummaryCtrl);

export default router;
