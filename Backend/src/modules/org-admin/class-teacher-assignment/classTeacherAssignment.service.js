import { findActiveYearByOrg } from '../../academic-year/academicYear.repository.js';
import {
    deleteClassTeacherAssignment,
    getClassTeacherAssignments,
    saveClassTeacherAssignment
} from './classTeacherAssignment.repository.js';

const normalizeId = (value) => {
    const id = Number(value);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
};

export const listClassTeacherAssignments = async (organizationId) => {
    const activeYear = await findActiveYearByOrg(organizationId);
    if (!activeYear) return [];
    return getClassTeacherAssignments(organizationId, activeYear.id);
};

export const assignClassTeacher = async ({
    organizationId,
    teacherId,
    gradeId,
    sectionId
}) => {
    const normalizedTeacherId = normalizeId(teacherId);
    const normalizedGradeId = normalizeId(gradeId);
    const normalizedSectionId = normalizeId(sectionId);

    if (!normalizedTeacherId || !normalizedGradeId || !normalizedSectionId) {
        const error = new Error('Teacher, grade, and section are required');
        error.statusCode = 400;
        throw error;
    }

    const activeYear = await findActiveYearByOrg(organizationId);
    if (!activeYear) {
        const error = new Error('Create an active academic year before assigning class teachers');
        error.statusCode = 400;
        throw error;
    }

    return saveClassTeacherAssignment({
        organizationId,
        academicYearId: activeYear.id,
        teacherId: normalizedTeacherId,
        gradeId: normalizedGradeId,
        sectionId: normalizedSectionId
    });
};

export const removeClassTeacherAssignment = async (organizationId, assignmentId) => {
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

    const removed = await deleteClassTeacherAssignment(
        normalizedAssignmentId,
        organizationId,
        activeYear.id
    );
    if (!removed) {
        const error = new Error('Class teacher assignment not found');
        error.statusCode = 404;
        throw error;
    }
};
