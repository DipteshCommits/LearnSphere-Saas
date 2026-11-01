import {
    addTeacherAssignment,
    listTeacherAssignments,
    removeTeacherAssignment
} from './teacherAssignment.service.js';

export const getTeacherAssignments = async (req, res, next) => {
    try {
        const data = await listTeacherAssignments(req.user.organizationId);
        res.status(200).json({ data });
    } catch (error) {
        next(error);
    }
};

export const postTeacherAssignment = async (req, res, next) => {
    try {
        const assignmentId = await addTeacherAssignment({
            ...req.body,
            organizationId: req.user.organizationId
        });
        res.status(201).json({
            message: 'Teacher assigned successfully',
            data: { assignmentId }
        });
    } catch (error) {
        next(error);
    }
};

export const deleteTeacherAssignmentById = async (req, res, next) => {
    try {
        await removeTeacherAssignment(req.user.organizationId, req.params.assignmentId);
        res.status(200).json({ message: 'Teacher assignment removed' });
    } catch (error) {
        next(error);
    }
};
