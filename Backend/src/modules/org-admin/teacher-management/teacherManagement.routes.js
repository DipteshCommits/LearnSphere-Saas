import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../../middlewares/role.middleware.js';
import {
    createTeacher,
    getTeachers
} from './teacherManagement.controller.js';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware('ORG_ADMIN'));

router.get('/', getTeachers);
router.post('/', createTeacher);

export default router;
