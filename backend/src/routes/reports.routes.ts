import { Router } from 'express';
import { generatePeriodReport } from '../controllers/reports.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRoles } from '../middlewares/rbacMiddleware';
import { validateBody } from '../middlewares/validationMiddleware';
import { periodReportSchema } from '../validators/report.validators';

const router = Router();

router.post(
  '/period',
  authMiddleware,
  requireRoles(['admin', 'rh', 'ti', 'jefaturas-adscripciones', 'user']),
  validateBody(periodReportSchema),
  generatePeriodReport
);

export default router;
