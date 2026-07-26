import {
    enrollStudent,
    getStudentEnrollments
} from './enrollment.service.js';

export const createEnrollment = async (req, res, next) => {
    try {
        const { studentId, gradeId, sectionId, rollNo } = req.body;
        const organizationId = req.user.organizationId;

        if (!studentId || !gradeId || !sectionId) {
            return res.status(400).json({
                message: 'studentId, gradeId, and sectionId are required'
            });
        }

        await enrollStudent({
            organizationId,
            studentId,
            gradeId,
            sectionId,
            rollNo
        });


        res.status(201).json({
            message: 'Student enrolled successfully'
        });


    } catch (error) {
        next(error)
    }
};

export const getEnrollments = async (req, res, next) => {
    try {
        const { studentId } = req.params;

        const data = await getStudentEnrollments(studentId);

        res.status(200).json({ data });
    } catch (error) {
        next(error);
    }
}