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

export const createStudentWithEnrollment = async ({
    organizationId,
    name,
    email,
    passwordHash,
    admissionNo,
    academicYearId,
    gradeId,
    sectionId,
    rollNo
}) => {
    const connection = await getConnection();
    try {
        await finishTransaction(connection, 'beginTransaction');
        const userResult = await runQuery(
            connection,
            `INSERT INTO users
                (organization_id, name, email, password_hash, role, is_active, must_change_password)
            VALUES (?, ?, ?, ?, 'STUDENT', 1, 1)`,
            [organizationId, name, email, passwordHash]
        );
        const studentResult = await runQuery(
            connection,
            `INSERT INTO students (user_id, admission_no) VALUES (?, ?)`,
            [userResult.insertId, admissionNo]
        );
        await runQuery(
            connection,
            `INSERT INTO enrollments
                (student_id, academic_year_id, grade_id, section_id, roll_no)
            VALUES (?, ?, ?, ?, ?)`,
            [studentResult.insertId, academicYearId, gradeId, sectionId, rollNo || null]
        );
        await finishTransaction(connection, 'commit');
        return { studentId: studentResult.insertId, userId: userResult.insertId };
    } catch (error) {
        try {
            await finishTransaction(connection, 'rollback');
        } catch (rollbackError) {
            console.error('Failed to roll back student admission transaction', rollbackError);
        }
        throw error;
    } finally {
        connection.release();
    }
};

export const getStudentsWithFilters = ({
    organizationId,
    academicYearId,
    gradeId,
    sectionId,
    search,
    status
}) => {
    return new Promise((resolve, reject) => {

        let query = `
            SELECT
                s.id AS studentId,
                u.name,
                s.admission_no AS admissionNo,
                ay.year_label AS academicYear,
                g.grade_name AS gradeName,
                sec.section_name AS sectionName,
                e.roll_no AS rollNo,
                u.is_active AS isActive
            FROM enrollments e
            JOIN students s ON e.student_id = s.id
            JOIN users u ON s.user_id = u.id
            JOIN academic_years ay ON e.academic_year_id = ay.id
            JOIN grades g ON e.grade_id = g.id
            JOIN sections sec ON e.section_id = sec.id
            WHERE u.organization_id = ?
        `;

        const params = [organizationId];

        if (academicYearId) {
            query += ` AND e.academic_year_id = ?`;
            params.push(academicYearId);
        }

        if (gradeId) {
            query += ` AND e.grade_id = ?`;
            params.push(gradeId);
        }

        if (sectionId) {
            query += ` AND e.section_id = ?`;
            params.push(sectionId);
        }

        if (search) {
            query += ` AND (u.name LIKE ? OR s.admission_no LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        if (status === 'active') {
            query += ` AND u.is_active = 1`;
        }

        if (status === 'inactive') {
            query += ` AND u.is_active = 0`;
        }

        query += ` ORDER BY u.name ASC`;

        db.query(query, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });

    });
};

export const getStudentProfileByOrganization = (studentId, organizationId) => {
    return new Promise((resolve, reject) => {
        db.query(
            `SELECT
                s.id AS studentId,
                s.admission_no AS admissionNo,
                s.created_at AS admittedAt,
                u.name,
                u.email,
                u.is_active AS isActive,
                u.must_change_password AS mustChangePassword
            FROM students s
            JOIN users u ON s.user_id = u.id
            WHERE s.id = ? AND u.organization_id = ? AND u.role = 'STUDENT'`,
            [studentId, organizationId],
            (error, results) => {
                if (error) return reject(error);
                resolve(results.length ? results[0] : null);
            }
        );
    });
};

export const getStudentEnrollmentHistory = (studentId, organizationId) => {
    return new Promise((resolve, reject) => {
        db.query(
            `SELECT
                e.id AS enrollmentId,
                e.roll_no AS rollNo,
                e.created_at AS enrolledAt,
                ay.id AS academicYearId,
                ay.year_label AS academicYear,
                ay.is_active AS isCurrentYear,
                g.id AS gradeId,
                g.grade_name AS gradeName,
                sec.id AS sectionId,
                sec.section_name AS sectionName
            FROM enrollments e
            JOIN students s ON e.student_id = s.id
            JOIN users u ON s.user_id = u.id
            JOIN academic_years ay ON e.academic_year_id = ay.id
            JOIN grades g ON e.grade_id = g.id
            JOIN sections sec ON e.section_id = sec.id
            WHERE e.student_id = ? AND u.organization_id = ? AND u.role = 'STUDENT'
            ORDER BY ay.start_date DESC, e.id DESC`,
            [studentId, organizationId],
            (error, results) => {
                if (error) return reject(error);
                resolve(results);
            }
        );
    });
};

export const updateStudentAndCurrentEnrollment = async ({
    studentId,
    organizationId,
    academicYearId,
    name,
    email,
    admissionNo,
    gradeId,
    sectionId,
    rollNo
}) => {
    const connection = await getConnection();
    try {
        await finishTransaction(connection, 'beginTransaction');
        const validPlacement = await runQuery(
            connection,
            `SELECT g.id
            FROM academic_years ay
            JOIN grades g ON g.organization_id = ay.organization_id
                AND g.academic_year_id = ay.id
            JOIN sections sec ON sec.grade_id = g.id
                AND sec.academic_year_id = ay.id
            WHERE ay.id = ? AND ay.organization_id = ? AND ay.is_active = 1
                AND g.id = ? AND sec.id = ?
            FOR UPDATE`,
            [academicYearId, organizationId, gradeId, sectionId]
        );
        if (!validPlacement.length) {
            const error = new Error('The selected grade and section are no longer available for the active academic year');
            error.statusCode = 409;
            throw error;
        }

        const students = await runQuery(
            connection,
            `SELECT s.id, e.id AS enrollment_id
            FROM students s
            JOIN users u ON s.user_id = u.id
            LEFT JOIN enrollments e
                ON e.student_id = s.id AND e.academic_year_id = ?
            WHERE s.id = ? AND u.organization_id = ? AND u.role = 'STUDENT'
            FOR UPDATE`,
            [academicYearId, studentId, organizationId]
        );

        if (!students.length) {
            const error = new Error('Student not found');
            error.statusCode = 404;
            throw error;
        }

        if (!students[0].enrollment_id) {
            const error = new Error('Student has no enrollment in the active academic year');
            error.statusCode = 409;
            throw error;
        }

        await runQuery(
            connection,
            `UPDATE users
            SET name = ?, email = ?
            WHERE id = (
                SELECT user_id FROM students WHERE id = ?
            )`,
            [name, email, studentId]
        );
        await runQuery(
            connection,
            `UPDATE students SET admission_no = ? WHERE id = ?`,
            [admissionNo, studentId]
        );
        await runQuery(
            connection,
            `UPDATE enrollments
            SET grade_id = ?, section_id = ?, roll_no = ?
            WHERE id = ? AND academic_year_id = ?`,
            [gradeId, sectionId, rollNo || null, students[0].enrollment_id, academicYearId]
        );

        await finishTransaction(connection, 'commit');
    } catch (error) {
        try {
            await finishTransaction(connection, 'rollback');
        } catch (rollbackError) {
            console.error('Failed to roll back student update transaction', rollbackError);
        }
        throw error;
    } finally {
        connection.release();
    }
};
