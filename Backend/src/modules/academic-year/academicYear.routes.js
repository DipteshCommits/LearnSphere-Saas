import {Router} from 'express';

import {
    createYear,
    getYears,
    getActiveYear,
    activateAcademicYear
} from './academicYear.controller.js';

import {authMiddleware} from '../../middlewares/auth.middleware.js';
import {roleMiddleware} from '../../middlewares/role.middleware.js';


const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware('ORG_ADMIN'));

router.post('/',createYear);
router.get('/',getYears);

router.get('/active',getActiveYear);
router.patch('/:id/activate', activateAcademicYear);

export default router;