import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
  createCategoryCtrl, deleteCategoryCtrl, listCategoriesCtrl, updateCategoryCtrl
} from '../controllers/category.controller';
import { createCategorySchema, updateCategorySchema } from '../schemas/category.schema';
import { validate } from '../utils/validate';


const router = Router();

router.use(requireAuth);

router.get('/', listCategoriesCtrl);
router.post('/', validate(createCategorySchema), createCategoryCtrl);

router.put('/:id', validate(updateCategorySchema), updateCategoryCtrl);
router.delete('/:id', deleteCategoryCtrl);

export default router;
