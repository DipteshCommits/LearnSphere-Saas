import {
    addTeacher,
    listTeachers
} from './teacherManagement.service.js';

export const getTeachers = async (req, res, next) => {
    try {
        const teachers = await listTeachers({
            organizationId: req.user.organizationId,
            search: req.query.search,
            status: req.query.status
        });
        res.status(200).json({ data: teachers });
    } catch (error) {
        next(error);
    }
};

export const createTeacher = async (req, res, next) => {
    try {
        const teacherId = await addTeacher({
            ...req.body,
            organizationId: req.user.organizationId
        });
        res.status(201).json({
            message: 'Teacher account created. The teacher must change their temporary password at first login.',
            data: { teacherId }
        });
    } catch (error) {
        next(error);
    }
};
