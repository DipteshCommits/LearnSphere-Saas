import {
    findGradeByNameAndOrg,
    createGrade,
    getGradesByOrganization
} from './grade.repository.js';

import {
    getActiveAcademicYear
} from '../academic-year/academicYear.service.js';

export const addGrade = async ({gradeName,organizationId}) => {
    const normalizedName = typeof gradeName === 'string' ? gradeName.trim() : '';
    if (!normalizedName || normalizedName.length > 50) {
        const error = new Error('Grade name is required and must be 50 characters or fewer');
        error.statusCode = 400;
        throw error;
    }

    const activeYear = await getActiveAcademicYear(organizationId);

    if(!activeYear){
        const error = new Error('An active academic year is required to add grades');
        error.statusCode=400;
        throw error;
    }

    const existing = await findGradeByNameAndOrg(normalizedName, organizationId, activeYear.id);

    if(existing){
        const error = new Error('Grade already exists');
        error.statusCode=409;
        throw error;
    }

    return await createGrade({
        gradeName: normalizedName,
        organizationId,
        academicYearId: activeYear.id
    });

};


export const listGrades = async (organizationId)=>{
    const activeYear = await getActiveAcademicYear(organizationId);
    if (!activeYear) return [];
    return await getGradesByOrganization(organizationId, activeYear.id);
};