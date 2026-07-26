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
    console.log({organizationId,activeYear});

    if (!activeYear) {
        const error = new Error('No active academic year found!!!!!');
        error.statusCode = 400;
        throw error;
    }

    const grade = await findGradeByIdAndOrg(gradeId, organizationId);

    if (!grade) {
        const error = new Error('Grade not found for this organization');
        error.statusCode = 404;
        throw error;
    }

    const existingSection = await findSectionByNameAndYear(
        gradeId,
        activeYear.id,
        sectionName
    );

    if (existingSection) {
        const error = new Error('Section already exists for this grade and year');
        error.statusCode = 409;
        throw error;
    }

    await createSection({
        gradeId,
        academicYearId: activeYear.id,
        sectionName
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

    return await getSectionsByGradeAndYear(gradeId, activeYear.id);
};