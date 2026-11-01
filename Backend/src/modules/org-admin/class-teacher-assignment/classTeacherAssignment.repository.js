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

export const getClassTeacherAssignments = (organizationId, academicYearId) =>
    new Promise((resolve, reject) => {
        db.query(
            `SELECT
                assignment.id,
                assignment.teacher_id AS teacherId,
                teacher.name AS teacherName,
                assignment.grade_id AS gradeId,
                grade.grade_name AS gradeName,
                assignment.section_id AS sectionId,
                section.section_name AS sectionName,
                assignment.updated_at AS updatedAt
            FROM class_teacher_assignments assignment
            JOIN users teacher ON teacher.id = assignment.teacher_id
            JOIN grades grade ON grade.id = assignment.grade_id
            JOIN sections section ON section.id = assignment.section_id
            WHERE assignment.organization_id = ? AND assignment.academic_year_id = ?
            ORDER BY grade.grade_name, section.section_name`,
            [organizationId, academicYearId],
            (error, rows) => {
                if (error) return reject(error);
                resolve(rows);
            }
        );
    });

export const saveClassTeacherAssignment = async ({
    organizationId,
    academicYearId,
    teacherId,
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
            WHERE teacher.id = ? AND teacher.organization_id = ?
                AND teacher.role = 'TEACHER' AND teacher.is_active = 1
                AND ay.id = ? AND ay.is_active = 1
                AND grade.id = ? AND section.id = ?`,
            [teacherId, organizationId, academicYearId, gradeId, sectionId]
        );

        if (!validAssignment.length) {
            const error = new Error('Choose an active teacher and a section in the active academic year');
            error.statusCode = 400;
            throw error;
        }

        await runQuery(
            connection,
            `INSERT INTO class_teacher_assignments
                (organization_id, teacher_id, academic_year_id, grade_id, section_id)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE teacher_id = VALUES(teacher_id), grade_id = VALUES(grade_id)`,
            [organizationId, teacherId, academicYearId, gradeId, sectionId]
        );

        await finishTransaction(connection, 'commit');
    } catch (error) {
        try {
            await finishTransaction(connection, 'rollback');
        } catch (rollbackError) {
            console.error('Failed to roll back class teacher assignment transaction', rollbackError);
        }
        throw error;
    } finally {
        connection.release();
    }
};

export const deleteClassTeacherAssignment = (assignmentId, organizationId, academicYearId) =>
    new Promise((resolve, reject) => {
        db.query(
            `DELETE FROM class_teacher_assignments
            WHERE id = ? AND organization_id = ? AND academic_year_id = ?`,
            [assignmentId, organizationId, academicYearId],
            (error, result) => {
                if (error) return reject(error);
                resolve(result.affectedRows > 0);
            }
        );
    });
