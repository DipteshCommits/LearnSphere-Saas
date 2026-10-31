import { Router } from 'express';
import { createStudent, getStudents } from './studentManagement.controller.js';
import { authMiddleware } from '../../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../../middlewares/role.middleware.js';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware("ORG_ADMIN"));


router.get("/", getStudents);
router.post("/", createStudent);

export default router;