import {Router} from 'express';

import studentRoutes from '../modules/student/student.routes.js';
import authRoutes from '../modules/auth/auth.routes.js';
import academicYearRoutes from '../modules/academic-year/academicYear.routes.js';
import gradeRoutes from '../modules/grade/grade.routes.js';
import sectionRoutes from '../modules/section/section.routes.js';
import enrollmentRoutes from '../modules/enrollment/enrollment.routes.js';
import orgAdminDashboardRoutes from '../modules/org-admin/dashboard/dashboard.routes.js';


const router = Router();

router.use('/auth', authRoutes);
router.use('/student', studentRoutes);
router.use('/org-admin/academic-years',academicYearRoutes);
router.use('/org-admin/grades',gradeRoutes);
router.use('/org-admin/sections',sectionRoutes);
router.use('/org-admin/enrollments',enrollmentRoutes);
router.use('/org-admin/dashboard',orgAdminDashboardRoutes);

export default router;