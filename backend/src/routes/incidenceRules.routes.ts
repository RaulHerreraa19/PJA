import { Router } from 'express';
import {
	createIncidenceRule,
	deleteIncidenceRule,
	listIncidenceRules,
	updateIncidenceRule,
} from '../controllers/incidenceRules.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRoles } from '../middlewares/rbacMiddleware';
import { validateBody } from '../middlewares/validationMiddleware';
import { auditMiddleware } from '../middlewares/auditMiddleware';
import { createIncidenceRuleSchema, updateIncidenceRuleSchema } from '../validators/incidenceRule.validators';

const router = Router();

router.use(authMiddleware);
router.use(requireRoles(['admin', 'rh', 'ti']));

router.get('/', listIncidenceRules);
router.post(
	'/',
	requireRoles(['admin', 'ti']),
	validateBody(createIncidenceRuleSchema),
	auditMiddleware('incidence:create', 'incidence_rules'),
	createIncidenceRule
);
router.put(
	'/:id',
	requireRoles(['admin', 'ti']),
	validateBody(updateIncidenceRuleSchema),
	auditMiddleware('incidence:update', 'incidence_rules'),
	updateIncidenceRule,
);
router.delete(
	'/:id',
	requireRoles(['admin', 'ti']),
	auditMiddleware('incidence:delete', 'incidence_rules'),
	deleteIncidenceRule
);

export default router;
