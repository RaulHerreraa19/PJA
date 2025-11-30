import { Router } from 'express';
import { listAttendance } from '../controllers/attendance.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRoles } from '../middlewares/rbacMiddleware';
import { validateQuery } from '../middlewares/validationMiddleware';
import { attendanceQuerySchema } from '../validators/attendance.validators';

const router = Router();

router.get(
	'/',
	authMiddleware,
	requireRoles(['admin', 'rh', 'ti', 'jefaturas-adscripciones']),
	validateQuery(attendanceQuerySchema),
	listAttendance
);

export default router;
