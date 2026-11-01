import {
    createEnrollment,
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
    const normalizedStudentId = Number(studentId);
    const normalizedGradeId = Number(gradeId);
    const normalizedSectionId = Number(sectionId);
    const normalizedRollNo = typeof rollNo === 'string' ? rollNo.trim() : '';
    if (![normalizedStudentId, normalizedGradeId, normalizedSectionId]
        .every((id) => Number.isSafeInteger(id) && id > 0)) {
        const error = new Error('Provide valid student, grade, and section IDs');
        error.statusCode = 400;
        throw error;
    }
    if (!normalizedRollNo || normalizedRollNo.length > 20) {
        const error = new Error('Roll number is required and must be 20 characters or fewer');
        error.statusCode = 400;
        throw error;
    }

    const activeYear = await getActiveAcademicYear(organizationId);

    if (!activeYear) {
        const err = new Error('No active academic year found');
        err.statusCode = 400;
        throw err;
    }

    const student = await findStudentByIdAndOrg(normalizedStudentId, organizationId);
    if (!student) {
        const err = new Error('Student not found');
        err.statusCode = 404;
        throw err;
    }

    const grade = await findGradeByIdAndOrg(normalizedGradeId, organizationId);
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

    const section = await findSectionById(normalizedSectionId, normalizedGradeId, activeYear.id);
    if (!section) {
        const err = new Error('Section not found');
        err.statusCode = 404;
        throw err;
    }

    return await createEnrollment({
        organizationId,
        studentId: normalizedStudentId,
        academicYearId: activeYear.id,
        gradeId: normalizedGradeId,
        sectionId: normalizedSectionId,
        rollNo: normalizedRollNo
    });
};


export const getStudentEnrollments = async (studentId, organizationId) => {
    return await getEnrollmentsByStudent(studentId, organizationId);
}