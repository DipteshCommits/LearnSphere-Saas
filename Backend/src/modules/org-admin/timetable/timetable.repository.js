import db from '../../../database/db.js';

const runQuery = (connection, query, values) => new Promise((resolve, reject) => {
    connection.query(query, values, (error, result) => {
        if (error) return reject(error);
        resolve(result);
    });
});

const getConnection = () => new Promise((resolve, reject) => {
    db.getConnection((error, connection) => {
        if (error) return reject(error);
        resolve(connection);
    });
});

const finishTransaction = (connection, action) => new Promise((resolve, reject) => {
    connection[action]((error) => {
        if (error) return reject(error);
        resolve();
    });
});

const query = (sql, values) => new Promise((resolve, reject) => {
    db.query(sql, values, (error, rows) => {
        if (error) return reject(error);
        resolve(rows);
    });
});

export const getTimetableSettings = (organizationId, academicYearId) => query(
    `SELECT
        school_days AS schoolDays,
        TIME_FORMAT(school_start_time, '%H:%i') AS schoolStartTime,
        period_duration_minutes AS periodDurationMinutes,
        periods_per_day AS periodsPerDay,
        lunch_after_period AS lunchAfterPeriod,
        lunch_duration_minutes AS lunchDurationMinutes
    FROM timetable_settings
    WHERE organization_id = ? AND academic_year_id = ?`,
    [organizationId, academicYearId]
);

export const getTimetableLoads = (organizationId, academicYearId) => query(
    `SELECT section_id AS sectionId, subject_id AS subjectId, periods_per_week AS periodsPerWeek
    FROM timetable_subject_loads
    WHERE organization_id = ? AND academic_year_id = ?`,
    [organizationId, academicYearId]
);

export const getTimetableEntries = (organizationId, academicYearId) => query(
    `SELECT
        entry.id,
        entry.weekday AS weekday,
        entry.period_number AS periodNumber,
        TIME_FORMAT(entry.start_time, '%H:%i') AS startTime,
        TIME_FORMAT(entry.end_time, '%H:%i') AS endTime,
        entry.section_id AS sectionId,
        grade.grade_name AS gradeName,
        section.section_name AS sectionName,
        entry.subject_id AS subjectId,
        subject.subject_name AS subjectName,
        entry.teacher_id AS teacherId,
        teacher.name AS teacherName
    FROM timetable_entries entry
    JOIN grades grade ON grade.id = entry.grade_id
    JOIN sections section ON section.id = entry.section_id
    JOIN subjects subject ON subject.id = entry.subject_id
    JOIN users teacher ON teacher.id = entry.teacher_id
    WHERE entry.organization_id = ? AND entry.academic_year_id = ?
    ORDER BY entry.weekday, entry.period_number, grade.grade_name, section.section_name`,
    [organizationId, academicYearId]
);

export const saveGeneratedTimetable = async ({
    organizationId,
    academicYearId,
    settings,
    loads,
    entries
}) => {
    const connection = await getConnection();
    try {
        await finishTransaction(connection, 'beginTransaction');
        await runQuery(
            connection,
            `INSERT INTO timetable_settings
                (organization_id, academic_year_id, school_days, school_start_time,
                period_duration_minutes, periods_per_day, lunch_after_period, lunch_duration_minutes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                school_days = VALUES(school_days),
                school_start_time = VALUES(school_start_time),
                period_duration_minutes = VALUES(period_duration_minutes),
                periods_per_day = VALUES(periods_per_day),
                lunch_after_period = VALUES(lunch_after_period),
                lunch_duration_minutes = VALUES(lunch_duration_minutes)`,
            [
                organizationId,
                academicYearId,
                JSON.stringify(settings.schoolDays),
                settings.schoolStartTime,
                settings.periodDurationMinutes,
                settings.periodsPerDay,
                settings.lunchAfterPeriod,
                settings.lunchDurationMinutes
            ]
        );
        await runQuery(
            connection,
            `DELETE FROM timetable_entries
            WHERE organization_id = ? AND academic_year_id = ?`,
            [organizationId, academicYearId]
        );
        await runQuery(
            connection,
            `DELETE FROM timetable_subject_loads
            WHERE organization_id = ? AND academic_year_id = ?`,
            [organizationId, academicYearId]
        );

        for (const load of loads) {
            await runQuery(
                connection,
                `INSERT INTO timetable_subject_loads
                    (organization_id, academic_year_id, section_id, subject_id, periods_per_week)
                VALUES (?, ?, ?, ?, ?)`,
                [organizationId, academicYearId, load.sectionId, load.subjectId, load.periodsPerWeek]
            );
        }

        for (const entry of entries) {
            await runQuery(
                connection,
                `INSERT INTO timetable_entries
                    (organization_id, academic_year_id, weekday, period_number, start_time, end_time,
                    section_id, grade_id, subject_id, teacher_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    organizationId,
                    academicYearId,
                    entry.weekday,
                    entry.periodNumber,
                    entry.startTime,
                    entry.endTime,
                    entry.sectionId,
                    entry.gradeId,
                    entry.subjectId,
                    entry.teacherId
                ]
            );
        }

        await finishTransaction(connection, 'commit');
    } catch (error) {
        try {
            await finishTransaction(connection, 'rollback');
        } catch (rollbackError) {
            console.error('Failed to roll back timetable generation', rollbackError);
        }
        throw error;
    } finally {
        connection.release();
    }
};
