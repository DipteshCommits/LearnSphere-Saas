import {
    admitStudent,
    getStudentProfile,
    listStudents
} from "./studentManagement.service.js";

export const createStudent = async (req, res, next) => {
    try {
        const result = await admitStudent({
            ...req.body,
            organizationId: req.user.organizationId
        });
        res.status(201).json({
            message: "Student admitted successfully. They must change the temporary password at first login.",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

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

export const getStudent = async (req, res, next) => {
    try {
        const studentId = Number(req.params.studentId);
        if (!Number.isSafeInteger(studentId) || studentId <= 0) {
            return res.status(400).json({ message: 'A valid student ID is required' });
        }

        const student = await getStudentProfile(studentId, req.user.organizationId);
        res.status(200).json({ data: student });
    } catch (error) {
        next(error);
    }
};