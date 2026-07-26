import {Router} from 'express';
import { createSection, getSections } from './section.controller.js';
import {authMiddleware} from '../../middlewares/auth.middleware.js';
import {roleMiddleware} from '../../middlewares/role.middleware.js';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware('ORG_ADMIN'));

router.post('/',createSection);
router.get('/',getSections);

export default router;