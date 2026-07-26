import {Router} from 'express';

import {
    createGrade,
    getGrades
} from './grade.controller.js';

import {authMiddleware} from '../../middlewares/auth.middleware.js';
import {roleMiddleware} from '../../middlewares/role.middleware.js';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware('ORG_ADMIN'));

router.post('/',createGrade);
router.get('/',getGrades);

export default router;