import { findActiveYearByOrg } from '../../academic-year/academicYear.repository.js';
import {
    getAttendanceMode,
    getDayTimetableEntries,
    getAttendanceRoster,
    getSectionAttendanceInfo,
    gradeBelongsToAcademicYear,
    saveAttendanceMode,
    saveAttendanceRecords
} from './attendance.repository.js';
import {
    normalizeAttendanceDate,
    normalizeAttendanceRecords
} from './attendance.rules.js';

const normalizeId = (value) => {
    const id = Number(value);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
};

const normalizeAttendanceMode = (value) =>
    value === 'DAILY' || value === 'SUBJECT' ? value : null;

const getWeekday = (attendanceDate) => {
    const weekday = new Date(`${attendanceDate}T00:00:00Z`).getUTCDay();
    return ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][weekday];
};

const toDateOnly = (value) => {
    if (value instanceof Date) {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, '0');
        const day = String(value.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    return String(value).slice(0, 10);
};

const getAttendanceContext = async (organizationId, sectionId, dateValue) => {
    const normalizedSectionId = normalizeId(sectionId);
    const attendanceDate = normalizeAttendanceDate(dateValue);
    if (!normalizedSectionId || !attendanceDate) {
        const error = new Error('Provide a valid section and attendance date');
        error.statusCode = 400;
        throw error;
    }

    const activeYear = await findActiveYearByOrg(organizationId);
    if (!activeYear) {
        const error = new Error('Create an active academic year before taking attendance');
        error.statusCode = 400;
        throw error;
    }

    const yearStart = toDateOnly(activeYear.start_date);
    const yearEnd = toDateOnly(activeYear.end_date);
    if (attendanceDate < yearStart || attendanceDate > yearEnd) {
        const error = new Error('Attendance date must fall within the active academic year');
        error.statusCode = 400;
        throw error;
    }
    const section = await getSectionAttendanceInfo(
        organizationId,
        activeYear.id,
        normalizedSectionId
    );
    if (!section) {
        const error = new Error('Section not found for the active academic year');
        error.statusCode = 404;
        throw error;
    }

    const attendanceMode = await getAttendanceMode(
        organizationId,
        activeYear.id,
        section.gradeId
    );
    return {
        activeYear,
        sectionId: normalizedSectionId,
        gradeId: Number(section.gradeId),
        attendanceDate,
        attendanceMode
    };
};

export const getAttendanceForSection = ({
    organizationId,
    sectionId,
    date,
    timetableEntryId: timetableEntryValue
}) => getAttendanceData({ organizationId, sectionId, date, timetableEntryValue });

const getAttendanceData = async ({
    organizationId,
    sectionId,
    date,
    timetableEntryValue
}) => {
    const { activeYear, sectionId: normalizedSectionId, attendanceDate, attendanceMode } =
        await getAttendanceContext(organizationId, sectionId, date);
    const timetableEntryId = timetableEntryValue ? normalizeId(timetableEntryValue) : null;
    if (timetableEntryValue && !timetableEntryId) {
        const error = new Error('Select a valid timetable period');
        error.statusCode = 400;
        throw error;
    }

    const periods = attendanceMode === 'SUBJECT'
        ? await getDayTimetableEntries(
            organizationId,
            activeYear.id,
            normalizedSectionId,
            getWeekday(attendanceDate)
        )
        : [];
    if (attendanceMode === 'SUBJECT' && timetableEntryId
        && !periods.some((period) => Number(period.timetableEntryId) === timetableEntryId)) {
        const error = new Error('The selected period is not scheduled for this section on this date');
        error.statusCode = 400;
        throw error;
    }
    if (attendanceMode === 'DAILY' && timetableEntryId) {
        const error = new Error('This grade records attendance once per day');
        error.statusCode = 400;
        throw error;
    }

    const students = attendanceMode === 'DAILY' || timetableEntryId
        ? await getAttendanceRoster(
            organizationId,
            activeYear.id,
            normalizedSectionId,
            attendanceDate,
            timetableEntryId || 0
        )
        : [];
    return {
        academicYear: activeYear.year_label,
        attendanceDate,
        attendanceMode,
        periods,
        students: students.map((student) => ({
            ...student,
            attendanceStatus: student.attendanceStatus || null
        }))
    };
};

export const getAttendanceSettings = async ({ organizationId, gradeId: gradeIdValue }) => {
    const gradeId = normalizeId(gradeIdValue);
    if (!gradeId) {
        const error = new Error('Provide a valid grade');
        error.statusCode = 400;
        throw error;
    }
    const activeYear = await findActiveYearByOrg(organizationId);
    if (!activeYear) {
        const error = new Error('Create an active academic year before configuring attendance');
        error.statusCode = 400;
        throw error;
    }
    if (!await gradeBelongsToAcademicYear(organizationId, activeYear.id, gradeId)) {
        const error = new Error('Grade not found for the active academic year');
        error.statusCode = 404;
        throw error;
    }
    return {
        academicYear: activeYear.year_label,
        attendanceMode: await getAttendanceMode(organizationId, activeYear.id, gradeId)
    };
};

export const updateAttendanceSettings = async ({
    organizationId,
    gradeId: gradeIdValue,
    attendanceMode: modeValue,
    applyToAllGrades = false
}) => {
    const gradeId = normalizeId(gradeIdValue);
    const attendanceMode = normalizeAttendanceMode(modeValue);
    if ((!gradeId && !applyToAllGrades) || !attendanceMode) {
        const error = new Error('Provide a valid grade and attendance mode');
        error.statusCode = 400;
        throw error;
    }
    const activeYear = await findActiveYearByOrg(organizationId);
    if (!activeYear) {
        const error = new Error('Create an active academic year before configuring attendance');
        error.statusCode = 400;
        throw error;
    }
    await saveAttendanceMode({
        organizationId,
        academicYearId: activeYear.id,
        gradeId,
        attendanceMode,
        applyToAllGrades
    });
    return { attendanceMode, appliedToAllGrades: applyToAllGrades };
};

export const recordSectionAttendance = async ({
    organizationId,
    markedBy,
    sectionId,
    date,
    records: inputRecords,
    timetableEntryId: timetableEntryValue
}) => {
    const {
        activeYear,
        sectionId: normalizedSectionId,
        attendanceDate,
        attendanceMode
    } =
        await getAttendanceContext(organizationId, sectionId, date);
    const timetableEntryId = timetableEntryValue ? normalizeId(timetableEntryValue) : null;
    if ((attendanceMode === 'SUBJECT' && !timetableEntryId)
        || (attendanceMode === 'DAILY' && timetableEntryValue)) {
        const error = new Error(attendanceMode === 'SUBJECT'
            ? 'Select a scheduled subject period before saving attendance'
            : 'This grade records attendance once per day');
        error.statusCode = 400;
        throw error;
    }
    if (timetableEntryValue && !timetableEntryId) {
        const error = new Error('Select a valid timetable period');
        error.statusCode = 400;
        throw error;
    }
    if (attendanceMode === 'SUBJECT') {
        const periods = await getDayTimetableEntries(
            organizationId,
            activeYear.id,
            normalizedSectionId,
            getWeekday(attendanceDate)
        );
        if (!periods.some((period) => Number(period.timetableEntryId) === timetableEntryId)) {
            const error = new Error('The selected period is not scheduled for this section on this date');
            error.statusCode = 400;
            throw error;
        }
    }
    const records = normalizeAttendanceRecords(inputRecords);
    if (!records) {
        const error = new Error('Provide one valid attendance status for every student');
        error.statusCode = 400;
        throw error;
    }

    await saveAttendanceRecords({
        organizationId,
        academicYearId: activeYear.id,
        sectionId: normalizedSectionId,
        attendanceDate,
        markedBy,
        records,
        timetableEntryId: timetableEntryId || 0
    });
    return { attendanceDate, studentCount: records.length, attendanceMode };
};
