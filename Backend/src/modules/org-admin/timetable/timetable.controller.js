import { generateTimetable, getTimetable } from './timetable.service.js';

export const getTimetableData = async (req, res, next) => {
    try {
        const data = await getTimetable(req.user.organizationId);
        res.status(200).json({ data });
    } catch (error) {
        next(error);
    }
};

export const postGenerateTimetable = async (req, res, next) => {
    try {
        const result = await generateTimetable({
            ...req.body,
            organizationId: req.user.organizationId
        });
        res.status(200).json({
            message: 'A conflict-free timetable was generated',
            data: result
        });
    } catch (error) {
        next(error);
    }
};
