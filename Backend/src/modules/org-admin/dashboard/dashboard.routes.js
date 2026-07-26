import { Router } from 'express';
import { getDashboard } from './dashboard.controller.js';
import { authMiddleware } from '../../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../../middlewares/role.middleware.js';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware('ORG_ADMIN'));

router.get('/', getDashboard);

export default router;