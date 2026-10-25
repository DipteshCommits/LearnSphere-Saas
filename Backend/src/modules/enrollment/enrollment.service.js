import {
    createEnrollment,
    findEnrollmentsByStudentAndYear,
    getEnrollmentsByStudent
} from './enrollment.repository.js';

import { getActiveAcademicYear } from '../academic-year/academicYear.service.js';
import { findStudentByIdAndOrg } from '../student/student.repository.js';
import { findGradeByIdAndOrg } from '../grade/grade.repository.js';
import { findSectionById } from '../section/section.repository.js';

export const enrollStudent = async ({
    organizationId,
    studentId,
    gradeId,
    sectionId,
    rollNo
}) => {
    const activeYear = await getActiveAcademicYear(organizationId);

    if (!activeYear) {
        const err = new Error('No active academic year found');
        err.statusCode = 400;
        throw err;
    }

    const student = await findStudentByIdAndOrg(studentId, organizationId);
    if (!student) {
        const err = new Error('Student not found');
        err.statusCode = 404;
        throw err;
    }

    const grade = await findGradeByIdAndOrg(gradeId, organizationId);
    if (!grade) {
        const err = new Error('Grade not found');
        err.statusCode = 404;
        throw err;
    }

    if (Number(grade.academic_year_id) !== Number(activeYear.id)) {
        const err = new Error('Grade does not belong to the active academic year');
        err.statusCode = 400;
        throw err;
    }

    const section = await findSectionById(sectionId, gradeId, activeYear.id);
    if (!section) {
        const err = new Error('Section not found');
        err.statusCode = 404;
        throw err;
    }

    const alreadyEnrolled = await findEnrollmentsByStudentAndYear(studentId, activeYear.id);

    if (alreadyEnrolled) {
        const err = new Error('Student already enrolled in active academic year');
        err.statusCode = 409;
        throw err;
    }

    return await createEnrollment({
        studentId,
        academicYearId: activeYear.id,
        gradeId,
        sectionId,
        rollNo
    });
};


export const getStudentEnrollments = async (studentId, organizationId) => {
    return await getEnrollmentsByStudent(studentId, organizationId);
}