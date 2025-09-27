// src/routes/auth.routes.ts
import { Router } from 'express';
import * as ctrl from '../controllers/auth.controller';

const router = Router();

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/refresh', ctrl.refresh);

export default router;
