import {Router} from 'express';

import {
    createEnrollment,
    getEnrollments
} from './enrollment.controller.js';

import {authMiddleware} from '../../middlewares/auth.middleware.js';
import {roleMiddleware} from '../../middlewares/role.middleware.js';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware('ORG_ADMIN'));

router.post('/',createEnrollment);
router.get('/:studentId',getEnrollments);

export default router;