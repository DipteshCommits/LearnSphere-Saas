import { Router } from 'express';

import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../middlewares/role.middleware.js';
import { getStudents } from './student.controller.js';

const router = Router();

router.get('/me',
    authMiddleware,
    roleMiddleware('STUDENT'),
    (req, res) => {
        res.json({
            message: 'Student profile accessed',
            user: req.user
        });
    }
);

router.get(
    '/',
    authMiddleware,
    roleMiddleware('ORG_ADMIN'),
    getStudents
);


export default router;