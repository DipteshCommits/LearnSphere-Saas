import {Router} from 'express';
import { changeCurrentUserPassword, login } from './auth.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post('/login', login);
router.post('/change-password', authMiddleware, changeCurrentUserPassword);


export default router;
