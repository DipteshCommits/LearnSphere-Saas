import { findActiveYearByOrg } from '../../academic-year/academicYear.repository.js';
import { getGradesByOrganization } from '../../grade/grade.repository.js';
import {
    createSubjectWithGrades,
    findSubjectByName,
    getSubjectsByOrganization,
    updateSubject as updateSubjectRecord
} from './subjectManagement.repository.js';

const normalizeGradeIds = (gradeIds) => {
    if (!Array.isArray(gradeIds)) return null;
    const normalized = gradeIds.map(Number);
    if (normalized.some((id) => !Number.isSafeInteger(id) || id <= 0)) return null;
    return [...new Set(normalized)];
};

const validateCurrentYearGrades = async (organizationId, gradeIds) => {
    const activeYear = await findActiveYearByOrg(organizationId);
    if (!activeYear) {
        const error = new Error('Create an active academic year before managing subjects');
        error.statusCode = 400;
        throw error;
    }

    const grades = await getGradesByOrganization(organizationId, activeYear.id);
    const availableIds = new Set(grades.map((grade) => Number(grade.id)));
    if (gradeIds.some((gradeId) => !availableIds.has(gradeId))) {
        const error = new Error('One or more selected grades are not part of the active academic year');
        error.statusCode = 400;
        throw error;
    }

    return activeYear;
};

export const listSubjects = async (organizationId) => {
    const activeYear = await findActiveYearByOrg(organizationId);
    if (!activeYear) return [];
    return getSubjectsByOrganization(organizationId, activeYear.id);
};

export const createSubject = async ({ organizationId, subjectName, gradeIds }) => {
    const normalizedName = typeof subjectName === 'string' ? subjectName.trim() : '';
    const normalizedGradeIds = normalizeGradeIds(gradeIds);

    if (!normalizedName || normalizedName.length > 100) {
        const error = new Error('Subject name is required and must be 100 characters or fewer');
        error.statusCode = 400;
        throw error;
    }
    if (!normalizedGradeIds || normalizedGradeIds.length === 0) {
        const error = new Error('Assign the subject to at least one grade');
        error.statusCode = 400;
        throw error;
    }

    await validateCurrentYearGrades(organizationId, normalizedGradeIds);
    if (await findSubjectByName(organizationId, normalizedName)) {
        const error = new Error('A subject with this name already exists in your school');
        error.statusCode = 409;
        throw error;
    }

    try {
        return await createSubjectWithGrades({
            organizationId,
            subjectName: normalizedName,
            gradeIds: normalizedGradeIds
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            const conflict = new Error('A subject with this name or grade assignment already exists');
            conflict.statusCode = 409;
            throw conflict;
        }
        throw error;
    }
};

export const updateSubject = async ({
    organizationId,
    subjectId,
    subjectName,
    gradeIds
}) => {
    const normalizedSubjectId = Number(subjectId);
    const normalizedName = typeof subjectName === 'string' ? subjectName.trim() : '';
    const normalizedGradeIds = normalizeGradeIds(gradeIds);
    if (!Number.isSafeInteger(normalizedSubjectId) || normalizedSubjectId <= 0) {
        const error = new Error('Provide a valid subject');
        error.statusCode = 400;
        throw error;
    }
    if (!normalizedName || normalizedName.length > 100) {
        const error = new Error('Subject name is required and must be 100 characters or fewer');
        error.statusCode = 400;
        throw error;
    }
    if (!normalizedGradeIds) {
        const error = new Error('Provide a valid grade list');
        error.statusCode = 400;
        throw error;
    }

    const activeYear = await validateCurrentYearGrades(organizationId, normalizedGradeIds);
    if (await findSubjectByName(organizationId, normalizedName, normalizedSubjectId)) {
        const error = new Error('A subject with this name already exists in your school');
        error.statusCode = 409;
        throw error;
    }

    try {
        await updateSubjectRecord({
            organizationId,
            subjectId: normalizedSubjectId,
            subjectName: normalizedName,
            academicYearId: activeYear.id,
            gradeIds: normalizedGradeIds
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            const conflict = new Error('A subject with this name or grade assignment already exists');
            conflict.statusCode = 409;
            throw conflict;
        }
        throw error;
    }
};
