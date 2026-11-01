import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../../middlewares/role.middleware.js';
import {
    deleteTeacherAssignmentById,
    getTeacherAssignments,
    postTeacherAssignment
} from './teacherAssignment.controller.js';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware('ORG_ADMIN'));

router.get('/', getTeacherAssignments);
router.post('/', postTeacherAssignment);
router.delete('/:assignmentId', deleteTeacherAssignmentById);

export default router;
