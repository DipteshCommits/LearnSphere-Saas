import { getActiveStudents } from './student.service.js';

export const getStudents = async (req, res, next) => {
    try {
        const organizationId = req.user.organizationId;

        const students = await getActiveStudents(organizationId);

        res.status(200).json({
            data: students
        });
    } catch (error) {
        next(error);
    }
}