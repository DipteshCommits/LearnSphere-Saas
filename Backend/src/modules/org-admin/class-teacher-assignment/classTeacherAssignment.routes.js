import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../../middlewares/role.middleware.js';
import {
    deleteClassTeacherAssignmentById,
    getClassTeacherAssignments,
    putClassTeacherAssignment
} from './classTeacherAssignment.controller.js';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware('ORG_ADMIN'));

router.get('/', getClassTeacherAssignments);
router.put('/:sectionId', putClassTeacherAssignment);
router.delete('/:assignmentId', deleteClassTeacherAssignmentById);

export default router;
