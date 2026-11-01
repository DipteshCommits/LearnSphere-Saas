import {
    assignClassTeacher,
    listClassTeacherAssignments,
    removeClassTeacherAssignment
} from './classTeacherAssignment.service.js';

export const getClassTeacherAssignments = async (req, res, next) => {
    try {
        const data = await listClassTeacherAssignments(req.user.organizationId);
        res.status(200).json({ data });
    } catch (error) {
        next(error);
    }
};

export const putClassTeacherAssignment = async (req, res, next) => {
    try {
        await assignClassTeacher({
            ...req.body,
            sectionId: req.params.sectionId,
            organizationId: req.user.organizationId
        });
        res.status(200).json({ message: 'Class teacher assigned successfully' });
    } catch (error) {
        next(error);
    }
};

export const deleteClassTeacherAssignmentById = async (req, res, next) => {
    try {
        await removeClassTeacherAssignment(req.user.organizationId, req.params.assignmentId);
        res.status(200).json({ message: 'Class teacher assignment removed' });
    } catch (error) {
        next(error);
    }
};
