import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../../middlewares/role.middleware.js';
import {
    getGradeAttendanceSettings,
    getSectionAttendance,
    putGradeAttendanceSettings,
    putSectionAttendance
} from './attendance.controller.js';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware('ORG_ADMIN'));

router.get('/settings', getGradeAttendanceSettings);
router.put('/settings', putGradeAttendanceSettings);
router.get('/', getSectionAttendance);
router.put('/', putSectionAttendance);

export default router;
