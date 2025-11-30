import { Router } from 'express';
import { createIncidence, listIncidences, updateIncidenceStatus } from '../controllers/incidences.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRoles } from '../middlewares/rbacMiddleware';
import { validateBody, validateQuery } from '../middlewares/validationMiddleware';
import { createIncidenceSchema, incidencesQuerySchema, updateIncidenceSchema } from '../validators/incidence.validators';
import { auditMiddleware } from '../middlewares/auditMiddleware';

const router = Router();

router.get(
  '/',
  authMiddleware,
  requireRoles(['admin', 'rh', 'ti', 'jefaturas-adscripciones']),
  validateQuery(incidencesQuerySchema),
  listIncidences
);
router.post(
  '/',
  authMiddleware,
  requireRoles(['admin', 'rh', 'ti']),
  validateBody(createIncidenceSchema),
  auditMiddleware('incidence:create', 'incidences'),
  createIncidence
);
router.patch(
  '/:id',
  authMiddleware,
  requireRoles(['admin', 'rh', 'ti']),
  validateBody(updateIncidenceSchema),
  auditMiddleware('incidence:update', 'incidences'),
  updateIncidenceStatus
);

export default router;
