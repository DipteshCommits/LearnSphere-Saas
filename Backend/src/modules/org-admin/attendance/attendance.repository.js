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

export const getAttendanceRoster = (
    organizationId,
    academicYearId,
    sectionId,
    attendanceDate,
    timetableEntryId
) =>
    new Promise((resolve, reject) => {
        db.query(
            `SELECT
                student.id AS studentId,
                student_user.name,
                enrollment.roll_no AS rollNo,
                attendance.status AS attendanceStatus,
                attendance.updated_at AS updatedAt
            FROM enrollments enrollment
            JOIN students student ON student.id = enrollment.student_id
            JOIN users student_user ON student_user.id = student.user_id
            LEFT JOIN attendance_records attendance
                ON attendance.student_id = student.id
                AND attendance.academic_year_id = enrollment.academic_year_id
                AND attendance.attendance_date = ?
                AND attendance.timetable_entry_id = ?
            WHERE student_user.organization_id = ?
                AND enrollment.academic_year_id = ?
                AND enrollment.section_id = ?
                AND student_user.role = 'STUDENT'
                AND student_user.is_active = 1
            ORDER BY enrollment.roll_no, student_user.name`,
            [attendanceDate, timetableEntryId, organizationId, academicYearId, sectionId],
            (error, rows) => {
                if (error) return reject(error);
                resolve(rows);
            }
        );
    });

export const getSectionAttendanceInfo = (organizationId, academicYearId, sectionId) =>
    new Promise((resolve, reject) => {
        db.query(
            `SELECT section.id, section.grade_id AS gradeId
            FROM sections section
            JOIN grades grade ON grade.id = section.grade_id
            WHERE section.id = ? AND section.academic_year_id = ?
                AND grade.organization_id = ? AND grade.academic_year_id = ?`,
            [sectionId, academicYearId, organizationId, academicYearId],
            (error, rows) => {
                if (error) return reject(error);
                resolve(rows[0] || null);
            }
        );
    });

export const getAttendanceMode = (organizationId, academicYearId, gradeId) =>
    new Promise((resolve, reject) => {
        db.query(
            `SELECT attendance_mode AS attendanceMode
            FROM attendance_grade_settings
            WHERE organization_id = ? AND academic_year_id = ? AND grade_id = ?`,
            [organizationId, academicYearId, gradeId],
            (error, rows) => {
                if (error) return reject(error);
                resolve(rows[0]?.attendanceMode || 'DAILY');
            }
        );
    });

export const gradeBelongsToAcademicYear = (organizationId, academicYearId, gradeId) =>
    new Promise((resolve, reject) => {
        db.query(
            `SELECT id FROM grades
            WHERE id = ? AND organization_id = ? AND academic_year_id = ?`,
            [gradeId, organizationId, academicYearId],
            (error, rows) => {
                if (error) return reject(error);
                resolve(rows.length > 0);
            }
        );
    });

export const getDayTimetableEntries = (organizationId, academicYearId, sectionId, weekday) =>
    new Promise((resolve, reject) => {
        db.query(
            `SELECT
                entry.id AS timetableEntryId,
                entry.period_number AS periodNumber,
                entry.subject_id AS subjectId,
                subject.subject_name AS subjectName,
                TIME_FORMAT(entry.start_time, '%H:%i') AS startTime,
                TIME_FORMAT(entry.end_time, '%H:%i') AS endTime
            FROM timetable_entries entry
            JOIN subjects subject ON subject.id = entry.subject_id
            WHERE entry.organization_id = ? AND entry.academic_year_id = ?
                AND entry.section_id = ? AND entry.weekday = ?
            ORDER BY entry.period_number`,
            [organizationId, academicYearId, sectionId, weekday],
            (error, rows) => {
                if (error) return reject(error);
                resolve(rows);
            }
        );
    });

export const saveAttendanceMode = async ({
    organizationId,
    academicYearId,
    gradeId,
    attendanceMode,
    applyToAllGrades
}) => {
    const connection = await getConnection();
    try {
        await finishTransaction(connection, 'beginTransaction');
        const grades = await runQuery(
            connection,
            `SELECT id FROM grades
            WHERE organization_id = ? AND academic_year_id = ?
                AND (? = 1 OR id = ?)`,
            [organizationId, academicYearId, applyToAllGrades ? 1 : 0, gradeId]
        );
        if (!grades.length) {
            const error = new Error('Grade not found for the active academic year');
            error.statusCode = 404;
            throw error;
        }

        for (const grade of grades) {
            await runQuery(
                connection,
                `INSERT INTO attendance_grade_settings
                    (organization_id, academic_year_id, grade_id, attendance_mode)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE attendance_mode = VALUES(attendance_mode)`,
                [organizationId, academicYearId, grade.id, attendanceMode]
            );
        }
        await finishTransaction(connection, 'commit');
    } catch (error) {
        try {
            await finishTransaction(connection, 'rollback');
        } catch (rollbackError) {
            console.error('Failed to roll back attendance settings', rollbackError);
        }
        throw error;
    } finally {
        connection.release();
    }
};

export const saveAttendanceRecords = async ({
    organizationId,
    academicYearId,
    sectionId,
    attendanceDate,
    markedBy,
    records,
    timetableEntryId
}) => {
    const connection = await getConnection();
    try {
        await finishTransaction(connection, 'beginTransaction');
        const sections = await runQuery(
            connection,
            `SELECT section.id
            FROM sections section
            JOIN grades grade ON grade.id = section.grade_id
            JOIN academic_years year
                ON year.id = section.academic_year_id
                AND year.organization_id = grade.organization_id
            WHERE section.id = ? AND section.academic_year_id = ?
                AND grade.organization_id = ? AND year.is_active = 1`,
            [sectionId, academicYearId, organizationId]
        );
        if (!sections.length) {
            const error = new Error('Section not found for the active academic year');
            error.statusCode = 404;
            throw error;
        }

        const roster = await runQuery(
            connection,
            `SELECT student.id AS studentId
            FROM enrollments enrollment
            JOIN students student ON student.id = enrollment.student_id
            JOIN users student_user ON student_user.id = student.user_id
            WHERE student_user.organization_id = ? AND student_user.role = 'STUDENT'
                AND student_user.is_active = 1 AND enrollment.academic_year_id = ?
                AND enrollment.section_id = ?
            ORDER BY student.id`,
            [organizationId, academicYearId, sectionId]
        );
        if (!roster.length) {
            const error = new Error('There are no active students enrolled in this section');
            error.statusCode = 400;
            throw error;
        }

        const rosterIds = new Set(roster.map((student) => Number(student.studentId)));
        const submittedIds = new Set(records.map((record) => record.studentId));
        if (rosterIds.size !== submittedIds.size
            || [...rosterIds].some((studentId) => !submittedIds.has(studentId))) {
            const error = new Error('Attendance must include exactly the students enrolled in this section');
            error.statusCode = 409;
            throw error;
        }

        for (const record of records) {
            await runQuery(
                connection,
                `INSERT INTO attendance_records
                    (organization_id, academic_year_id, section_id, timetable_entry_id, student_id,
                    attendance_date, status, marked_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    section_id = VALUES(section_id),
                    status = VALUES(status),
                    marked_by = VALUES(marked_by)`,
                [
                    organizationId,
                    academicYearId,
                    sectionId,
                    timetableEntryId,
                    record.studentId,
                    attendanceDate,
                    record.status,
                    markedBy
                ]
            );
        }

        await finishTransaction(connection, 'commit');
    } catch (error) {
        try {
            await finishTransaction(connection, 'rollback');
        } catch (rollbackError) {
            console.error('Failed to roll back attendance save transaction', rollbackError);
        }
        throw error;
    } finally {
        connection.release();
    }
};
