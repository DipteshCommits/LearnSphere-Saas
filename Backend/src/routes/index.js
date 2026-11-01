import {Router} from 'express';

import studentRoutes from '../modules/student/student.routes.js';
import authRoutes from '../modules/auth/auth.routes.js';
import academicYearRoutes from '../modules/academic-year/academicYear.routes.js';
import gradeRoutes from '../modules/grade/grade.routes.js';
import sectionRoutes from '../modules/section/section.routes.js';
import enrollmentRoutes from '../modules/enrollment/enrollment.routes.js';
import orgAdminDashboardRoutes from '../modules/org-admin/dashboard/dashboard.routes.js';
import schoolProfileRoutes from '../modules/org-admin/school/schoolProfile.routes.js';
import studentManagementRoutes from '../modules/org-admin/student-management/studentManagement.routes.js';
import teacherManagementRoutes from '../modules/org-admin/teacher-management/teacherManagement.routes.js';
import subjectManagementRoutes from '../modules/org-admin/subject-management/subjectManagement.routes.js';
import teacherAssignmentRoutes from '../modules/org-admin/teacher-assignment/teacherAssignment.routes.js';
import classTeacherAssignmentRoutes from '../modules/org-admin/class-teacher-assignment/classTeacherAssignment.routes.js';
import timetableRoutes from '../modules/org-admin/timetable/timetable.routes.js';
import attendanceRoutes from '../modules/org-admin/attendance/attendance.routes.js';


const router = Router();

router.use('/auth', authRoutes);
router.use('/student', studentRoutes);
router.use('/org-admin/academic-years',academicYearRoutes);
router.use('/org-admin/grades',gradeRoutes);
router.use('/org-admin/sections',sectionRoutes);
router.use('/org-admin/enrollments',enrollmentRoutes);
router.use('/org-admin/dashboard',orgAdminDashboardRoutes);
router.use('/org-admin/school',schoolProfileRoutes);
router.use('/org-admin/students', studentManagementRoutes);
router.use('/org-admin/teachers', teacherManagementRoutes);
router.use('/org-admin/subjects', subjectManagementRoutes);
router.use('/org-admin/teacher-assignments', teacherAssignmentRoutes);
router.use('/org-admin/class-teacher-assignments', classTeacherAssignmentRoutes);
router.use('/org-admin/timetable', timetableRoutes);
router.use('/org-admin/attendance', attendanceRoutes);

export default router;