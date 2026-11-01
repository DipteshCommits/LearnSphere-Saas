export const ATTENDANCE_STATUSES = new Set(['PRESENT', 'ABSENT', 'LATE']);

export const normalizeAttendanceDate = (value) => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const parsedDate = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(parsedDate.getTime())
        && parsedDate.toISOString().slice(0, 10) === value
        ? value
        : null;
};

export const normalizeAttendanceRecords = (records) => {
    if (!Array.isArray(records) || records.length === 0) return null;
    const seenStudentIds = new Set();
    const normalized = [];

    for (const record of records) {
        const studentId = Number(record?.studentId);
        const status = typeof record?.status === 'string' ? record.status.toUpperCase() : '';
        if (!Number.isSafeInteger(studentId) || studentId <= 0
            || !ATTENDANCE_STATUSES.has(status) || seenStudentIds.has(studentId)) {
            return null;
        }
        seenStudentIds.add(studentId);
        normalized.push({ studentId, status });
    }

    return normalized;
};
