import { getActiveAcademicYear } from "../modules/academic-year/academicYear.service";

export const attachActiveAcademicYear = async (req, res, next) => {
    try {
        const organizationId = req.user.organizationId;
        req.academicYear = await getActiveAcademicYear(organizationId);
        next();
    }catch(error){
        next(error);
    }

}