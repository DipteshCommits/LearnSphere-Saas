import { listStudents } from "./studentManagement.service";

export const getStudents = async (req, res, next) => {
    try {
        const organizationId = req.user.organizationId;

        const {
            academicYearId,
            gradeId,
            sectionId,
            search,
            status
        } = req.query;

        const students = await listStudents({
            organizationId,
            academicYearId,
            gradeId,
            sectionId,
            search,
            status
        });


        res.status(200).json({
            data: students
        });
    } catch (error) {
        next(error);
    }
};