import assert from 'node:assert/strict';
import test from 'node:test';
import { buildTimetableSlots, generateSchedule } from './timetable.scheduler.js';

const settings = {
    schoolDays: ['MON', 'TUE'],
    schoolStartTime: '08:00',
    periodDurationMinutes: 45,
    periodsPerDay: 3,
    lunchAfterPeriod: 1,
    lunchDurationMinutes: 40
};

test('builds period times with the configured lunch break', () => {
    const slots = buildTimetableSlots(settings);
    assert.deepEqual(
        slots.filter((slot) => slot.weekday === 'MON'),
        [
            { weekday: 'MON', periodNumber: 1, startTime: '08:00', endTime: '08:45' },
            { weekday: 'MON', periodNumber: 2, startTime: '09:25', endTime: '10:10' },
            { weekday: 'MON', periodNumber: 3, startTime: '10:10', endTime: '10:55' }
        ]
    );
});

test('schedules every required period without section or teacher overlaps', () => {
    const loads = [
        {
            sectionId: 1, subjectId: 1, teacherId: 10, gradeId: 1,
            subjectName: 'Math', teacherName: 'Teacher A', periodsPerWeek: 2
        },
        {
            sectionId: 1, subjectId: 2, teacherId: 11, gradeId: 1,
            subjectName: 'Science', teacherName: 'Teacher B', periodsPerWeek: 2
        },
        {
            sectionId: 2, subjectId: 1, teacherId: 10, gradeId: 1,
            subjectName: 'Math', teacherName: 'Teacher A', periodsPerWeek: 2
        }
    ];

    const entries = generateSchedule(settings, loads);
    assert.equal(entries.length, 6);

    const sectionSlots = new Set();
    const teacherSlots = new Set();
    for (const entry of entries) {
        const sectionSlot = `${entry.sectionId}:${entry.weekday}:${entry.periodNumber}`;
        const teacherSlot = `${entry.teacherId}:${entry.weekday}:${entry.periodNumber}`;
        assert.equal(sectionSlots.has(sectionSlot), false);
        assert.equal(teacherSlots.has(teacherSlot), false);
        sectionSlots.add(sectionSlot);
        teacherSlots.add(teacherSlot);
    }

    for (const load of loads) {
        assert.equal(
            entries.filter((entry) => (
                entry.sectionId === load.sectionId && entry.subjectId === load.subjectId
            )).length,
            load.periodsPerWeek
        );
    }
});

test('rejects schedules where a teacher is required in overlapping sections', () => {
    assert.throws(
        () => generateSchedule(settings, [
            { sectionId: 1, subjectId: 1, teacherId: 10, periodsPerWeek: 4 },
            { sectionId: 2, subjectId: 2, teacherId: 10, periodsPerWeek: 3 }
        ]),
        (error) => error.statusCode === 409
            && error.message.includes('No conflict-free timetable')
    );
});
