import { Router } from 'express';
import { listClockings } from '../controllers/clockings.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRoles } from '../middlewares/rbacMiddleware';
import { validateQuery } from '../middlewares/validationMiddleware';
import { clockingQuerySchema } from '../validators/clocking.validators';

const router = Router();

router.get('/', authMiddleware, requireRoles(['admin', 'rh', 'ti']), validateQuery(clockingQuerySchema), listClockings);

export default router;
