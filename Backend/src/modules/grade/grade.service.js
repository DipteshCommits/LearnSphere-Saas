import {
    findGradeByNameAndOrg,
    createGrade,
    getGradesByOrganization
} from './grade.repository.js';

import {
    getActiveAcademicYear
} from '../academic-year/academicYear.service.js';

export const addGrade = async ({gradeName,organizationId}) => {

    const activeYear = await getActiveAcademicYear(organizationId);

    if(!activeYear){
        const error = new Error('An active academic year is required to add grades');
        error.statusCode=400;
        throw error;
    }

    const existing = await findGradeByNameAndOrg(gradeName,organizationId, activeYear.id);

    if(existing){
        const error = new Error('Grade already exists');
        error.statusCode=409;
        throw error;
    }

    return await createGrade({
        gradeName,
        organizationId,
        academicYearId: activeYear.id
    });

};


export const listGrades = async (organizationId)=>{
    return await getGradesByOrganization(organizationId);
}