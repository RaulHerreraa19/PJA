import { Router } from 'express';
import {
	createDepartment,
	createPosition,
	createSchedule,
	deleteDepartment,
	deletePosition,
	deleteSchedule,
	listDepartmentsCatalog,
	listPositionsCatalog,
	listSchedulesCatalog,
	updateDepartment,
	updatePosition,
	updateSchedule,
} from '../controllers/catalogs.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRoles } from '../middlewares/rbacMiddleware';
import { validateBody } from '../middlewares/validationMiddleware';
import { auditMiddleware } from '../middlewares/auditMiddleware';
import { departmentSchema } from '../validators/department.validators';
import { positionSchema } from '../validators/position.validators';
import { scheduleSchema } from '../validators/schedule.validators';

const router = Router();

router.use(authMiddleware);
router.use(requireRoles(['admin', 'rh', 'ti']));

router.get('/departments', listDepartmentsCatalog);
router.post(
	'/departments',
	requireRoles(['admin', 'ti']),
	validateBody(departmentSchema),
	auditMiddleware('department:create', 'departments'),
	createDepartment,
);
router.put(
	'/departments/:id',
	requireRoles(['admin', 'ti']),
	validateBody(departmentSchema),
	auditMiddleware('department:update', 'departments'),
	updateDepartment,
);
router.delete(
	'/departments/:id',
	requireRoles(['admin', 'ti']),
	auditMiddleware('department:delete', 'departments'),
	deleteDepartment,
);

router.get('/positions', listPositionsCatalog);
router.post(
	'/positions',
	requireRoles(['admin', 'ti']),
	validateBody(positionSchema),
	auditMiddleware('position:create', 'positions'),
	createPosition,
);
router.put(
	'/positions/:id',
	requireRoles(['admin', 'ti']),
	validateBody(positionSchema),
	auditMiddleware('position:update', 'positions'),
	updatePosition,
);
router.delete(
	'/positions/:id',
	requireRoles(['admin', 'ti']),
	auditMiddleware('position:delete', 'positions'),
	deletePosition,
);

router.get('/schedules', listSchedulesCatalog);
router.post(
	'/schedules',
	requireRoles(['admin', 'ti']),
	validateBody(scheduleSchema),
	auditMiddleware('schedule:create', 'schedules'),
	createSchedule,
);
router.put(
	'/schedules/:id',
	requireRoles(['admin', 'ti']),
	validateBody(scheduleSchema),
	auditMiddleware('schedule:update', 'schedules'),
	updateSchedule,
);
router.delete(
	'/schedules/:id',
	requireRoles(['admin', 'ti']),
	auditMiddleware('schedule:delete', 'schedules'),
	deleteSchedule,
);

export default router;
