import { Router } from 'express';
import { createEmployee, deleteEmployee, listEmployees, updateEmployee } from '../controllers/employees.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRoles } from '../middlewares/rbacMiddleware';
import { validateBody } from '../middlewares/validationMiddleware';
import { auditMiddleware } from '../middlewares/auditMiddleware';
import { createEmployeeSchema, updateEmployeeSchema } from '../validators/employee.validators';

const router = Router();

router.use(authMiddleware);

router.get('/', requireRoles(['admin', 'rh', 'ti', 'jefaturas-adscripciones', 'user']), listEmployees);
router.post(
	'/',
	requireRoles(['admin', 'rh', 'ti']),
	validateBody(createEmployeeSchema),
	auditMiddleware('employee:create', 'employees'),
	createEmployee
);
router.put(
	'/:id',
	requireRoles(['admin', 'rh', 'ti']),
	validateBody(updateEmployeeSchema),
	auditMiddleware('employee:update', 'employees'),
	updateEmployee
);
router.delete('/:id', requireRoles(['admin', 'rh', 'ti']), auditMiddleware('employee:delete', 'employees'), deleteEmployee);

export default router;
