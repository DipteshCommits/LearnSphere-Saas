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
