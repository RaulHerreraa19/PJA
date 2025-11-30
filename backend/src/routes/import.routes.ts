import { Router } from 'express';
import multer from 'multer';
import { uploadClockingsFile } from '../controllers/import.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRoles } from '../middlewares/rbacMiddleware';
import { validateBody } from '../middlewares/validationMiddleware';
import { auditMiddleware } from '../middlewares/auditMiddleware';
import { importClockingsSchema } from '../validators/import.validators';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

router.post(
  '/clockings',
  authMiddleware,
  requireRoles(['admin', 'rh', 'ti']),
  upload.single('file'),
  validateBody(importClockingsSchema),
  auditMiddleware('import:clockings', 'clockings'),
  uploadClockingsFile
);

export default router;
