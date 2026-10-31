import {
    createSection,
    findSectionByNameAndYear,
    getSectionsByGradeAndYear
} from './section.repository.js';

import { getActiveAcademicYear } from '../academic-year/academicYear.service.js';
import { findGradeByIdAndOrg } from '../grade/grade.repository.js';


export const addSection = async ({
    organizationId,
    gradeId,
    sectionName
}) => {
    const activeYear = await getActiveAcademicYear(organizationId);

    if (!activeYear) {
        const error = new Error('No active academic year found');
        error.statusCode = 400;
        throw error;
    }

    const grade = await findGradeByIdAndOrg(gradeId, organizationId);

    if (!grade) {
        const error = new Error('Grade not found for this organization');
        error.statusCode = 404;
        throw error;
    }

    if (Number(grade.academic_year_id) !== Number(activeYear.id)) {
        const error = new Error('Grade does not belong to the active academic year');
        error.statusCode = 400;
        throw error;
    }

    const normalizedName = typeof sectionName === 'string' ? sectionName.trim() : '';
    if (!normalizedName || normalizedName.length > 50) {
        const error = new Error('Section name is required and must be 50 characters or fewer');
        error.statusCode = 400;
        throw error;
    }

    const existingSection = await findSectionByNameAndYear(
        gradeId,
        activeYear.id,
        normalizedName
    );

    if (existingSection) {
        const error = new Error('Section already exists for this grade and year');
        error.statusCode = 409;
        throw error;
    }

    await createSection({
        gradeId,
        academicYearId: activeYear.id,
        sectionName: normalizedName
    });
};


export const listSectionsByGrade = async ({
    organizationId,
    gradeId
}) => {
    const activeYear = await getActiveAcademicYear(organizationId);

    if (!activeYear) {
        return [];
    }

    const grade = await findGradeByIdAndOrg(gradeId, organizationId);
    if (!grade || Number(grade.academic_year_id) !== Number(activeYear.id)) {
        const error = new Error('Grade not found for the active academic year');
        error.statusCode = 404;
        throw error;
    }

    return await getSectionsByGradeAndYear(gradeId, activeYear.id);
};