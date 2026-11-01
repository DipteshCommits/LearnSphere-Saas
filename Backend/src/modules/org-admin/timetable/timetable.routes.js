import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../../middlewares/role.middleware.js';
import {
    getTimetableData,
    postGenerateTimetable
} from './timetable.controller.js';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware('ORG_ADMIN'));

router.get('/', getTimetableData);
router.post('/generate', postGenerateTimetable);

export default router;
