import { getStudentsWithFilters } from "./studentManagement.repository";
import { findActiveYearByOrg } from '../../academic-year/academicYear.repository.js';

export const listStudents = async ({
    organizationId,
    academicYearId,
    gradeId,
    sectionId,
    search,
    status
}) => {
    // If academicYearId not passed → use active year
    if(!academicYearId){
        const activeYear = await findActiveYearByOrg(organizationId);


        if(!activeYear){
            const error = new Error("No active academic year found");
            error.statusCode = 400;
            throw error;
        }

        academicYearId = activeYear.id;
    }


    return await getStudentsWithFilters({
        organizationId,
        academicYearId,
        gradeId,
        sectionId,
        search,
        status
    });
};