import {
    getAttendanceSettings,
    getAttendanceForSection,
    recordSectionAttendance,
    updateAttendanceSettings
} from './attendance.service.js';

export const getGradeAttendanceSettings = async (req, res, next) => {
    try {
        const data = await getAttendanceSettings({
            organizationId: req.user.organizationId,
            gradeId: req.query.gradeId
        });
        res.status(200).json({ data });
    } catch (error) {
        next(error);
    }
};

export const putGradeAttendanceSettings = async (req, res, next) => {
    try {
        const data = await updateAttendanceSettings({
            ...req.body,
            organizationId: req.user.organizationId
        });
        res.status(200).json({
            message: 'Attendance settings saved successfully',
            data
        });
    } catch (error) {
        next(error);
    }
};

export const getSectionAttendance = async (req, res, next) => {
    try {
        const data = await getAttendanceForSection({
            organizationId: req.user.organizationId,
            sectionId: req.query.sectionId,
            date: req.query.date,
            timetableEntryId: req.query.timetableEntryId
        });
        res.status(200).json({ data });
    } catch (error) {
        next(error);
    }
};

export const putSectionAttendance = async (req, res, next) => {
    try {
        const data = await recordSectionAttendance({
            ...req.body,
            organizationId: req.user.organizationId,
            markedBy: req.user.id
        });
        res.status(200).json({
            message: 'Attendance saved successfully',
            data
        });
    } catch (error) {
        next(error);
    }
};
