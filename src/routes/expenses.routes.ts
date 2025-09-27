import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
  createExpenseCtrl,
  deleteExpenseCtrl,
  getExpenseCtrl,
  listExpensesCtrl,
  updateExpenseCtrl,
} from '../controllers/expense.controller';
import {
  createExpenseSchema,
  listExpenseQuerySchema,
  updateExpenseSchema,
} from '../schemas/expense.schema';

// 👇 cualquiera de las dos formas servirá porque exportamos ambas
import { validate } from '../utils/validate';
// import validate from '../utils/validate';

const router = Router();

// sanity check (puedes dejarlo mientras pruebas)
if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line no-console
  console.log('typeof requireAuth:', typeof requireAuth);
  console.log('typeof validate:', typeof validate);
}

router.use(requireAuth); // <- debe imprimir 'function' arriba

router.get('/', validate(listExpenseQuerySchema), listExpensesCtrl);
router.get('/:id', getExpenseCtrl);
router.post('/', validate(createExpenseSchema), createExpenseCtrl);
router.patch('/:id', validate(updateExpenseSchema), updateExpenseCtrl);
router.delete('/:id', deleteExpenseCtrl);

export default router;
