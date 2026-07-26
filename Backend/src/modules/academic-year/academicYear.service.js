import {
    createAcademicYear,
    getAcademicYearsByOrganization,
    deactivateAllYears,
    activateYear,
    findYearByLabelAndOrg,
    findActiveYearByOrg
} from './academicYear.repository.js';

export const addAcademicYear = async({
    organizationId,
    yearLabel,
    startDate,
    endDate
})=>{

    const existingYear = await findYearByLabelAndOrg
    (yearLabel, organizationId);

    if (existingYear){
        const error = new Error('Academic year with this label already exists');
        error.statusCode = 409;//conflict
        throw error;
    }

    //Create the academic year
    const yearId = await createAcademicYear({
        organizationId,
        yearLabel,
        startDate,
        endDate
    });
    

    //To ensure only one active year at a time, deactivate all other years
    await deactivateAllYears(organizationId);
    await activateYear(yearId);
    return yearId;
}


export const listAcademicYears = async(organizationId) => {
    return await getAcademicYearsByOrganization(organizationId);
}

export const getActiveAcademicYear = async (organizationId)=>{
    return await findActiveYearByOrg(organizationId);
}

export const activateAcademicYearById = async (yearId,organizationId)=>{
    await deactivateAllYears(organizationId);
    await activateYear(yearId);
}