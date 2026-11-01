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

export const getAssignmentsByOrganization = (organizationId, academicYearId) =>
    new Promise((resolve, reject) => {
        db.query(
            `SELECT
                ta.id,
                ta.teacher_id AS teacherId,
                teacher.name AS teacherName,
                ta.subject_id AS subjectId,
                subject.subject_name AS subjectName,
                ta.grade_id AS gradeId,
                grade.grade_name AS gradeName,
                ta.section_id AS sectionId,
                section.section_name AS sectionName,
                ta.created_at AS createdAt
            FROM teacher_assignments ta
            JOIN users teacher ON teacher.id = ta.teacher_id
            JOIN subjects subject ON subject.id = ta.subject_id
            JOIN grades grade ON grade.id = ta.grade_id
            JOIN sections section ON section.id = ta.section_id
            WHERE ta.organization_id = ? AND ta.academic_year_id = ?
            ORDER BY grade.grade_name, section.section_name, subject.subject_name`,
            [organizationId, academicYearId],
            (error, rows) => {
                if (error) return reject(error);
                resolve(rows);
            }
        );
    });

export const createTeacherAssignment = async ({
    organizationId,
    academicYearId,
    teacherId,
    subjectId,
    gradeId,
    sectionId
}) => {
    const connection = await getConnection();
    try {
        await finishTransaction(connection, 'beginTransaction');
        const validAssignment = await runQuery(
            connection,
            `SELECT teacher.id
            FROM users teacher
            JOIN academic_years ay
                ON ay.organization_id = teacher.organization_id
            JOIN grades grade
                ON grade.organization_id = ay.organization_id
                AND grade.academic_year_id = ay.id
            JOIN sections section
                ON section.grade_id = grade.id
                AND section.academic_year_id = ay.id
            JOIN subjects subject
                ON subject.organization_id = ay.organization_id
            JOIN grade_subjects gs
                ON gs.grade_id = grade.id AND gs.subject_id = subject.id
            WHERE teacher.id = ? AND teacher.organization_id = ?
                AND teacher.role = 'TEACHER' AND teacher.is_active = 1
                AND ay.id = ? AND ay.is_active = 1
                AND grade.id = ? AND section.id = ? AND subject.id = ?
            `,
            [teacherId, organizationId, academicYearId, gradeId, sectionId, subjectId]
        );

        if (!validAssignment.length) {
            const error = new Error('Choose an active teacher and a subject assigned to a section in the active academic year');
            error.statusCode = 400;
            throw error;
        }

        const result = await runQuery(
            connection,
            `INSERT INTO teacher_assignments
                (organization_id, teacher_id, subject_id, academic_year_id, grade_id, section_id)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [organizationId, teacherId, subjectId, academicYearId, gradeId, sectionId]
        );
        await finishTransaction(connection, 'commit');
        return result.insertId;
    } catch (error) {
        try {
            await finishTransaction(connection, 'rollback');
        } catch (rollbackError) {
            console.error('Failed to roll back teacher assignment transaction', rollbackError);
        }
        throw error;
    } finally {
        connection.release();
    }
};

export const deleteTeacherAssignment = (assignmentId, organizationId, academicYearId) =>
    new Promise((resolve, reject) => {
        db.query(
            `DELETE FROM teacher_assignments
            WHERE id = ? AND organization_id = ? AND academic_year_id = ?`,
            [assignmentId, organizationId, academicYearId],
            (error, result) => {
                if (error) return reject(error);
                resolve(result.affectedRows > 0);
            }
        );
    });
