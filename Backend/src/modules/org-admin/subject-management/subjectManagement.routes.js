import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../../middlewares/role.middleware.js';
import {
    getSubjects,
    postSubject,
    putSubject
} from './subjectManagement.controller.js';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware('ORG_ADMIN'));

router.get('/', getSubjects);
router.post('/', postSubject);
router.put('/:subjectId', putSubject);

export default router;
