import assert from 'node:assert/strict';
import test from 'node:test';
import {
    ATTENDANCE_STATUSES,
    normalizeAttendanceDate,
    normalizeAttendanceRecords
} from './attendance.rules.js';

test('accepts valid calendar dates and rejects malformed dates', () => {
    assert.equal(normalizeAttendanceDate('2026-11-01'), '2026-11-01');
    assert.equal(normalizeAttendanceDate('2026-02-29'), null);
    assert.equal(normalizeAttendanceDate('not-a-date'), null);
});

test('normalizes attendance statuses and rejects duplicate students', () => {
    assert.deepEqual(normalizeAttendanceRecords([
        { studentId: '4', status: 'present' },
        { studentId: 7, status: 'LATE' }
    ]), [
        { studentId: 4, status: 'PRESENT' },
        { studentId: 7, status: 'LATE' }
    ]);
    assert.equal(normalizeAttendanceRecords([
        { studentId: 4, status: 'PRESENT' },
        { studentId: 4, status: 'ABSENT' }
    ]), null);
    assert.equal(normalizeAttendanceRecords([{ studentId: 4, status: 'EXCUSED' }]), null);
    assert.equal(ATTENDANCE_STATUSES.size, 3);
});
