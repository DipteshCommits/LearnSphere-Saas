import { findActiveYearByOrg } from '../../academic-year/academicYear.repository.js';
import { getAssignmentsByOrganization } from '../teacher-assignment/teacherAssignment.repository.js';
import {
    getTimetableEntries,
    getTimetableLoads,
    getTimetableSettings,
    saveGeneratedTimetable
} from './timetable.repository.js';
import { generateSchedule } from './timetable.scheduler.js';

const DEFAULT_SETTINGS = {
    schoolDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
    schoolStartTime: '08:00',
    periodDurationMinutes: 45,
    periodsPerDay: 7,
    lunchAfterPeriod: 4,
    lunchDurationMinutes: 40
};

const VALID_DAYS = new Set(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']);

const createError = (message, statusCode = 400) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const normalizeSettings = (input) => {
    const schoolDays = Array.isArray(input?.schoolDays)
        ? [...new Set(input.schoolDays.map((day) => String(day).toUpperCase()))]
        : DEFAULT_SETTINGS.schoolDays;
    const settings = {
        schoolDays,
        schoolStartTime: typeof input?.schoolStartTime === 'string'
            ? input.schoolStartTime
            : DEFAULT_SETTINGS.schoolStartTime,
        periodDurationMinutes: Number(input?.periodDurationMinutes ?? DEFAULT_SETTINGS.periodDurationMinutes),
        periodsPerDay: Number(input?.periodsPerDay ?? DEFAULT_SETTINGS.periodsPerDay),
        lunchAfterPeriod: Number(input?.lunchAfterPeriod ?? DEFAULT_SETTINGS.lunchAfterPeriod),
        lunchDurationMinutes: Number(input?.lunchDurationMinutes ?? DEFAULT_SETTINGS.lunchDurationMinutes)
    };

    if (!settings.schoolDays.length || settings.schoolDays.some((day) => !VALID_DAYS.has(day))) {
        throw createError('Choose at least one valid school day');
    }
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(settings.schoolStartTime)) {
        throw createError('Provide a valid school start time');
    }
    if (!Number.isInteger(settings.periodDurationMinutes)
        || settings.periodDurationMinutes < 30 || settings.periodDurationMinutes > 90) {
        throw createError('Class periods must be between 30 and 90 minutes');
    }
    if (!Number.isInteger(settings.periodsPerDay)
        || settings.periodsPerDay < 2 || settings.periodsPerDay > 12) {
        throw createError('Choose between 2 and 12 periods per day');
    }
    if (!Number.isInteger(settings.lunchAfterPeriod)
        || settings.lunchAfterPeriod < 1 || settings.lunchAfterPeriod >= settings.periodsPerDay) {
        throw createError('Lunch must be scheduled between class periods');
    }
    if (!Number.isInteger(settings.lunchDurationMinutes)
        || settings.lunchDurationMinutes < 30 || settings.lunchDurationMinutes > 45) {
        throw createError('Lunch break must be between 30 and 45 minutes');
    }
    const [startHour, startMinute] = settings.schoolStartTime.split(':').map(Number);
    const schoolDayEnd = (startHour * 60) + startMinute
        + (settings.periodDurationMinutes * settings.periodsPerDay)
        + settings.lunchDurationMinutes;
    if (schoolDayEnd >= 24 * 60) {
        throw createError('The school schedule must finish before midnight');
    }
    return settings;
};

const normalizeLoads = (input, assignments) => {
    if (!Array.isArray(input)) throw createError('Set the weekly period count for every subject assignment');
    const assignmentsByKey = new Map(
        assignments.map((assignment) => [
            `${assignment.sectionId}:${assignment.subjectId}`,
            assignment
        ])
    );
    const seen = new Set();
    const loads = input.map((item) => {
        const sectionId = Number(item?.sectionId);
        const subjectId = Number(item?.subjectId);
        const periodsPerWeek = Number(item?.periodsPerWeek);
        const key = `${sectionId}:${subjectId}`;
        if (!assignmentsByKey.has(key) || seen.has(key)
            || !Number.isInteger(periodsPerWeek) || periodsPerWeek < 1 || periodsPerWeek > 60) {
            throw createError('Each assigned subject must have a valid weekly period count');
        }
        seen.add(key);
        return { ...assignmentsByKey.get(key), periodsPerWeek };
    });
    if (seen.size !== assignmentsByKey.size) {
        throw createError('Set the weekly period count for every assigned subject');
    }
    return loads;
};

const parseDays = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : DEFAULT_SETTINGS.schoolDays;
        } catch {
            return DEFAULT_SETTINGS.schoolDays;
        }
    }
    return DEFAULT_SETTINGS.schoolDays;
};

export const getTimetable = async (organizationId) => {
    const activeYear = await findActiveYearByOrg(organizationId);
    if (!activeYear) {
        return { academicYear: null, settings: null, loads: [], entries: [], assignments: [] };
    }

    const [settingsRows, loads, entries, assignments] = await Promise.all([
        getTimetableSettings(organizationId, activeYear.id),
        getTimetableLoads(organizationId, activeYear.id),
        getTimetableEntries(organizationId, activeYear.id),
        getAssignmentsByOrganization(organizationId, activeYear.id)
    ]);
    const settings = settingsRows[0]
        ? { ...settingsRows[0], schoolDays: parseDays(settingsRows[0].schoolDays) }
        : null;
    return {
        academicYear: activeYear.year_label,
        settings,
        loads,
        entries,
        assignments
    };
};

export const generateTimetable = async ({ organizationId, settings: inputSettings, loads: inputLoads }) => {
    const activeYear = await findActiveYearByOrg(organizationId);
    if (!activeYear) throw createError('Create an active academic year before generating a timetable');

    const assignments = await getAssignmentsByOrganization(organizationId, activeYear.id);
    if (!assignments.length) {
        throw createError('Assign teachers to subjects and sections before generating a timetable');
    }

    const settings = normalizeSettings(inputSettings);
    const loads = normalizeLoads(inputLoads, assignments);
    const totalCapacity = settings.schoolDays.length * settings.periodsPerDay;
    const totalRequired = loads.reduce((total, load) => total + load.periodsPerWeek, 0);
    if (totalRequired > totalCapacity * new Set(loads.map((load) => load.sectionId)).size) {
        throw createError('Weekly subject requirements exceed the available class periods');
    }

    const entries = generateSchedule(settings, loads);
    await saveGeneratedTimetable({
        organizationId,
        academicYearId: activeYear.id,
        settings,
        loads,
        entries
    });
    return { generatedPeriods: entries.length };
};
