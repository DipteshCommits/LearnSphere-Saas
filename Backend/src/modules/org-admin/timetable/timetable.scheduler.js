const addMinutes = (time, minutes) => {
    const [hours, mins] = time.split(':').map(Number);
    const total = hours * 60 + mins + minutes;
    return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

export const buildTimetableSlots = (settings) => {
    const slots = [];
    for (const weekday of settings.schoolDays) {
        let startTime = settings.schoolStartTime;
        for (let periodNumber = 1; periodNumber <= settings.periodsPerDay; periodNumber += 1) {
            const endTime = addMinutes(startTime, settings.periodDurationMinutes);
            slots.push({ weekday, periodNumber, startTime, endTime });
            startTime = endTime;
            if (periodNumber === settings.lunchAfterPeriod) {
                startTime = addMinutes(startTime, settings.lunchDurationMinutes);
            }
        }
    }
    return slots;
};

export const generateSchedule = (settings, loads) => {
    const slots = buildTimetableSlots(settings);
    const totalRequired = loads.reduce((total, load) => total + load.periodsPerWeek, 0);
    const remaining = loads.map((load) => ({ ...load, remaining: load.periodsPerWeek }));
    const sectionSlots = new Set();
    const teacherSlots = new Set();
    const sectionDayLoads = new Map();
    const teacherDayLoads = new Map();
    const subjectDayLoads = new Map();
    const entries = [];
    let searchNodes = 0;
    const maxSearchNodes = 250000;

    const dayKey = (entityId, weekday) => `${entityId}:${weekday}`;
    const availableSlots = (load) => slots.filter((slot) => (
        !sectionSlots.has(`${load.sectionId}:${slot.weekday}:${slot.periodNumber}`)
        && !teacherSlots.has(`${load.teacherId}:${slot.weekday}:${slot.periodNumber}`)
    ));

    const search = (remainingCount) => {
        if (remainingCount === 0) return true;
        searchNodes += 1;
        if (searchNodes > maxSearchNodes) return false;

        let selectedIndex = -1;
        let selectedCandidates = null;
        for (let index = 0; index < remaining.length; index += 1) {
            const load = remaining[index];
            if (load.remaining === 0) continue;
            const candidates = availableSlots(load);
            if (!candidates.length) return false;
            if (!selectedCandidates || candidates.length < selectedCandidates.length) {
                selectedIndex = index;
                selectedCandidates = candidates;
                if (candidates.length === 1) break;
            }
        }

        const load = remaining[selectedIndex];
        selectedCandidates.sort((left, right) => {
            const leftScore = (sectionDayLoads.get(dayKey(load.sectionId, left.weekday)) || 0)
                + (teacherDayLoads.get(dayKey(load.teacherId, left.weekday)) || 0)
                + ((subjectDayLoads.get(`${load.sectionId}:${load.subjectId}:${left.weekday}`) || 0) * 10);
            const rightScore = (sectionDayLoads.get(dayKey(load.sectionId, right.weekday)) || 0)
                + (teacherDayLoads.get(dayKey(load.teacherId, right.weekday)) || 0)
                + ((subjectDayLoads.get(`${load.sectionId}:${load.subjectId}:${right.weekday}`) || 0) * 10);
            return leftScore - rightScore || left.periodNumber - right.periodNumber;
        });

        for (const slot of selectedCandidates) {
            const sectionSlotKey = `${load.sectionId}:${slot.weekday}:${slot.periodNumber}`;
            const teacherSlotKey = `${load.teacherId}:${slot.weekday}:${slot.periodNumber}`;
            const sectionDay = dayKey(load.sectionId, slot.weekday);
            const teacherDay = dayKey(load.teacherId, slot.weekday);
            const subjectDay = `${load.sectionId}:${load.subjectId}:${slot.weekday}`;
            sectionSlots.add(sectionSlotKey);
            teacherSlots.add(teacherSlotKey);
            sectionDayLoads.set(sectionDay, (sectionDayLoads.get(sectionDay) || 0) + 1);
            teacherDayLoads.set(teacherDay, (teacherDayLoads.get(teacherDay) || 0) + 1);
            subjectDayLoads.set(subjectDay, (subjectDayLoads.get(subjectDay) || 0) + 1);
            entries.push({ ...slot, ...load });
            load.remaining -= 1;

            if (search(remainingCount - 1)) return true;

            load.remaining += 1;
            entries.pop();
            sectionSlots.delete(sectionSlotKey);
            teacherSlots.delete(teacherSlotKey);
            sectionDayLoads.set(sectionDay, sectionDayLoads.get(sectionDay) - 1);
            teacherDayLoads.set(teacherDay, teacherDayLoads.get(teacherDay) - 1);
            subjectDayLoads.set(subjectDay, subjectDayLoads.get(subjectDay) - 1);
            if (searchNodes > maxSearchNodes) return false;
        }
        return false;
    };

    if (!search(totalRequired)) {
        const error = new Error(
            searchNodes > maxSearchNodes
                ? 'Could not find a timetable within the search limit. Reduce weekly periods or simplify teacher assignments.'
                : 'No conflict-free timetable fits these weekly period requirements. Reduce period counts or add daily capacity.'
        );
        error.statusCode = 409;
        throw error;
    }
    return entries;
};
