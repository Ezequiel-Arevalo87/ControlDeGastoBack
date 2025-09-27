import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
router.get('/health', (req, res) => res.json({ ok: true }));
router.get('/private', requireAuth, (req, res) => res.json({ ok: true, user: (req as any).user }));
export default router;
