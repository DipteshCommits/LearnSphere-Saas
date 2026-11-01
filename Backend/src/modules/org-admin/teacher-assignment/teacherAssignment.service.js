import { findActiveYearByOrg } from '../../academic-year/academicYear.repository.js';
import {
    createTeacherAssignment,
    deleteTeacherAssignment,
    getAssignmentsByOrganization
} from './teacherAssignment.repository.js';

const normalizeId = (value) => {
    const id = Number(value);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
};

export const listTeacherAssignments = async (organizationId) => {
    const activeYear = await findActiveYearByOrg(organizationId);
    if (!activeYear) return [];
    return getAssignmentsByOrganization(organizationId, activeYear.id);
};

export const addTeacherAssignment = async ({
    organizationId,
    teacherId,
    subjectId,
    gradeId,
    sectionId
}) => {
    const normalizedTeacherId = normalizeId(teacherId);
    const normalizedSubjectId = normalizeId(subjectId);
    const normalizedGradeId = normalizeId(gradeId);
    const normalizedSectionId = normalizeId(sectionId);

    if (!normalizedTeacherId || !normalizedSubjectId || !normalizedGradeId || !normalizedSectionId) {
        const error = new Error('Teacher, subject, grade, and section are required');
        error.statusCode = 400;
        throw error;
    }

    const activeYear = await findActiveYearByOrg(organizationId);
    if (!activeYear) {
        const error = new Error('Create an active academic year before assigning teachers');
        error.statusCode = 400;
        throw error;
    }

    try {
        return await createTeacherAssignment({
            organizationId,
            academicYearId: activeYear.id,
            teacherId: normalizedTeacherId,
            subjectId: normalizedSubjectId,
            gradeId: normalizedGradeId,
            sectionId: normalizedSectionId
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            const conflict = new Error('This subject is already assigned to a teacher in the selected section for the active year');
            conflict.statusCode = 409;
            throw conflict;
        }
        throw error;
    }
};

export const removeTeacherAssignment = async (organizationId, assignmentId) => {
    const normalizedAssignmentId = normalizeId(assignmentId);
    if (!normalizedAssignmentId) {
        const error = new Error('Provide a valid assignment ID');
        error.statusCode = 400;
        throw error;
    }

    const activeYear = await findActiveYearByOrg(organizationId);
    if (!activeYear) {
        const error = new Error('No active academic year found');
        error.statusCode = 400;
        throw error;
    }

    const removed = await deleteTeacherAssignment(
        normalizedAssignmentId,
        organizationId,
        activeYear.id
    );
    if (!removed) {
        const error = new Error('Teacher assignment not found');
        error.statusCode = 404;
        throw error;
    }
};
