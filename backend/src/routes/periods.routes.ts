import { Router } from 'express';
import { createPeriod, listPeriods, closePeriod } from '../controllers/periods.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRoles } from '../middlewares/rbacMiddleware';
import { validateBody } from '../middlewares/validationMiddleware';
import { auditMiddleware } from '../middlewares/auditMiddleware';
import { createPeriodSchema } from '../validators/period.validators';

const router = Router();

router.use(authMiddleware);

router.get('/', requireRoles(['admin', 'rh', 'ti', 'jefaturas-adscripciones', 'user']), listPeriods);
router.post(
	'/',
	requireRoles(['admin', 'rh', 'ti']),
	validateBody(createPeriodSchema),
	auditMiddleware('period:create', 'periods'),
	createPeriod
);
router.post(
	'/:id/close',
	requireRoles(['admin', 'rh', 'ti']),
	auditMiddleware('period:close', 'periods'),
	closePeriod
);

export default router;
