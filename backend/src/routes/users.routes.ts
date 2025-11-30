import { Router } from 'express';
import { listUsers, createUser } from '../controllers/users.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRoles } from '../middlewares/rbacMiddleware';
import { validateBody } from '../middlewares/validationMiddleware';
import { createUserSchema } from '../validators/user.validators';
import { auditMiddleware } from '../middlewares/auditMiddleware';

const router = Router();

router.use(authMiddleware);
router.use(requireRoles(['admin', 'ti']));

router.get('/', listUsers);
router.post('/', validateBody(createUserSchema), auditMiddleware('user:create', 'users'), createUser);

export default router;
