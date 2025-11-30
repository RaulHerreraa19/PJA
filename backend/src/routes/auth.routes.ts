import { Router } from 'express';
import { login, logout, refresh } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateBody } from '../middlewares/validationMiddleware';
import { loginSchema } from '../validators/auth.validators';

const router = Router();

router.post('/login', validateBody(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', authMiddleware, logout);

export default router;
