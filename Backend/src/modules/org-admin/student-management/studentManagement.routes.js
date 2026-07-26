import { Router } from 'express';
import { getStudents } from './studentManagement.controller';
import { authMiddleware } from '../../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../../middlewares/role.middleware.js';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware("ORG_ADMIN"));


router.get("/", getStudents);

export default router;