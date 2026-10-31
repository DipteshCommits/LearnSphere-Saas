import {
    createAcademicYear,
    getAcademicYearsByOrganization,
    activateYear,
    findYearByLabelAndOrg,
    findYearByIdAndOrg,
    findActiveYearByOrg
} from './academicYear.repository.js';

export const addAcademicYear = async({
    organizationId,
    yearLabel,
    startDate,
    endDate
})=>{
    const normalizedLabel = typeof yearLabel === 'string' ? yearLabel.trim() : '';
    const validDate = (date) => {
        if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return false;
        }

        const parsedDate = new Date(`${date}T00:00:00Z`);
        return !Number.isNaN(parsedDate.getTime())
            && parsedDate.toISOString().slice(0, 10) === date;
    };

    if (!normalizedLabel || !validDate(startDate) || !validDate(endDate)
        || startDate >= endDate) {
        const error = new Error('Provide a year label and valid dates with the end date after the start date');
        error.statusCode = 400;
        throw error;
    }

    const existingYear = await findYearByLabelAndOrg
    (normalizedLabel, organizationId);

    if (existingYear){
        const error = new Error('Academic year with this label already exists');
        error.statusCode = 409;//conflict
        throw error;
    }

    //Create the academic year
    const yearId = await createAcademicYear({
        organizationId,
        yearLabel: normalizedLabel,
        startDate,
        endDate
    });
    

    await activateYear(yearId, organizationId);
    return yearId;
}


export const listAcademicYears = async(organizationId) => {
    return await getAcademicYearsByOrganization(organizationId);
}

export const getActiveAcademicYear = async (organizationId)=>{
    return await findActiveYearByOrg(organizationId);
}

export const activateAcademicYearById = async (yearId,organizationId)=>{
    const year = await findYearByIdAndOrg(yearId, organizationId);
    if (!year) {
        const error = new Error('Academic year not found');
        error.statusCode = 404;
        throw error;
    }

    await activateYear(yearId, organizationId);
}