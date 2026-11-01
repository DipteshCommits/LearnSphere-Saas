import db from '../../database/db.js';

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

export const createEnrollment = async ({
    organizationId,
    studentId,
    academicYearId,
    gradeId,
    sectionId,
    rollNo
}) => {
    const connection = await getConnection();
    try {
        await finishTransaction(connection, 'beginTransaction');
        const students = await runQuery(
            connection,
            `SELECT s.id
            FROM students s
            JOIN users u ON u.id = s.user_id
            WHERE s.id = ? AND u.organization_id = ? AND u.role = 'STUDENT'
            FOR UPDATE`,
            [studentId, organizationId]
        );
        if (!students.length) {
            const error = new Error('Student not found');
            error.statusCode = 404;
            throw error;
        }

        const existing = await runQuery(
            connection,
            `SELECT id FROM enrollments
            WHERE student_id = ? AND academic_year_id = ?
            FOR UPDATE`,
            [studentId, academicYearId]
        );
        if (existing.length) {
            const error = new Error('Student already enrolled in active academic year');
            error.statusCode = 409;
            throw error;
        }

        const sectionRows = await runQuery(
            connection,
            `SELECT id FROM sections
            WHERE id = ? AND grade_id = ? AND academic_year_id = ?
            FOR UPDATE`,
            [sectionId, gradeId, academicYearId]
        );
        if (!sectionRows.length) {
            const error = new Error('The selected section is no longer available for the active academic year');
            error.statusCode = 409;
            throw error;
        }

        const placements = await runQuery(
            connection,
            `SELECT sec.id
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
        if (!placements.length) {
            const error = new Error('The selected grade and section are no longer available for the active academic year');
            error.statusCode = 409;
            throw error;
        }

        const duplicateRollNumber = await runQuery(
            connection,
            `SELECT id FROM enrollments
            WHERE academic_year_id = ? AND section_id = ? AND roll_no = ?
            LIMIT 1
            FOR UPDATE`,
            [academicYearId, sectionId, rollNo]
        );
        if (duplicateRollNumber.length) {
            const error = new Error('This roll number is already assigned in the selected section');
            error.statusCode = 409;
            throw error;
        }

        const result = await runQuery(
            connection,
            `INSERT INTO enrollments
                (student_id, academic_year_id, grade_id, section_id, roll_no)
            VALUES (?, ?, ?, ?, ?)`,
            [studentId, academicYearId, gradeId, sectionId, rollNo || null]
        );
        await finishTransaction(connection, 'commit');
        return result.insertId;
    } catch (error) {
        try {
            await finishTransaction(connection, 'rollback');
        } catch (rollbackError) {
            console.error('Failed to roll back enrollment transaction', rollbackError);
        }
        throw error;
    } finally {
        connection.release();
    }
};


export const getEnrollmentsByStudent = (studentId, organizationId) =>{
    return new Promise((resolve,reject)=>{
        db.query(
            `SELECT
                e.id,
                e.student_id,
                e.academic_year_id,
                e.grade_id,
                e.section_id,
                e.roll_no
            FROM enrollments e
            JOIN students s ON e.student_id = s.id
            JOIN users u ON s.user_id = u.id
            WHERE e.student_id = ? AND u.organization_id = ?
            ORDER BY e.academic_year_id DESC`,
            [studentId, organizationId],
            (err, results)=>{
                if(err) return reject(err);
                resolve(results);
            }
        )
    })
}