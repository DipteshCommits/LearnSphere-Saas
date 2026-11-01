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

export const getSubjectsByOrganization = (organizationId, academicYearId) =>
    new Promise((resolve, reject) => {
        db.query(
            `SELECT
                s.id,
                s.subject_name AS subjectName,
                s.created_at AS createdAt,
                GROUP_CONCAT(DISTINCT g.grade_name ORDER BY g.grade_name SEPARATOR ',') AS grades,
                GROUP_CONCAT(DISTINCT g.id ORDER BY g.grade_name SEPARATOR ',') AS gradeIds
            FROM subjects s
            LEFT JOIN grade_subjects gs ON gs.subject_id = s.id
            LEFT JOIN grades g ON g.id = gs.grade_id
                AND g.organization_id = s.organization_id
                AND g.academic_year_id = ?
            WHERE s.organization_id = ?
            GROUP BY s.id, s.subject_name, s.created_at
            ORDER BY s.subject_name`,
            [academicYearId, organizationId],
            (error, rows) => {
                if (error) return reject(error);
                resolve(rows);
            }
        );
    });

export const findSubjectByName = (organizationId, subjectName, excludeSubjectId = null) =>
    new Promise((resolve, reject) => {
        const excludeClause = excludeSubjectId === null ? '' : ' AND id <> ?';
        const values = [organizationId, subjectName];
        if (excludeSubjectId !== null) values.push(excludeSubjectId);

        db.query(
            `SELECT id FROM subjects
            WHERE organization_id = ? AND LOWER(subject_name) = LOWER(?)
            ${excludeClause}`,
            values,
            (error, rows) => {
                if (error) return reject(error);
                resolve(rows.length ? rows[0] : null);
            }
        );
    });

export const createSubjectWithGrades = async ({
    organizationId,
    subjectName,
    gradeIds
}) => {
    const connection = await getConnection();
    try {
        await finishTransaction(connection, 'beginTransaction');
        const subjectResult = await runQuery(
            connection,
            `INSERT INTO subjects (organization_id, subject_name) VALUES (?, ?)`,
            [organizationId, subjectName]
        );

        for (const gradeId of gradeIds) {
            await runQuery(
                connection,
                `INSERT INTO grade_subjects (grade_id, subject_id) VALUES (?, ?)`,
                [gradeId, subjectResult.insertId]
            );
        }

        await finishTransaction(connection, 'commit');
        return subjectResult.insertId;
    } catch (error) {
        try {
            await finishTransaction(connection, 'rollback');
        } catch (rollbackError) {
            console.error('Failed to roll back subject creation transaction', rollbackError);
        }
        throw error;
    } finally {
        connection.release();
    }
};

export const updateSubject = async ({
    organizationId,
    subjectId,
    subjectName,
    academicYearId,
    gradeIds
}) => {
    const connection = await getConnection();
    try {
        await finishTransaction(connection, 'beginTransaction');
        const subjects = await runQuery(
            connection,
            `SELECT id FROM subjects WHERE id = ? AND organization_id = ? FOR UPDATE`,
            [subjectId, organizationId]
        );
        if (!subjects.length) {
            const error = new Error('Subject not found');
            error.statusCode = 404;
            throw error;
        }

        await runQuery(
            connection,
            `UPDATE subjects SET subject_name = ? WHERE id = ? AND organization_id = ?`,
            [subjectName, subjectId, organizationId]
        );
        await runQuery(
            connection,
            `DELETE gs FROM grade_subjects gs
            JOIN grades g ON g.id = gs.grade_id
            WHERE gs.subject_id = ? AND g.organization_id = ? AND g.academic_year_id = ?`,
            [subjectId, organizationId, academicYearId]
        );
        for (const gradeId of gradeIds) {
            await runQuery(
                connection,
                `INSERT INTO grade_subjects (grade_id, subject_id) VALUES (?, ?)`,
                [gradeId, subjectId]
            );
        }

        await finishTransaction(connection, 'commit');
    } catch (error) {
        try {
            await finishTransaction(connection, 'rollback');
        } catch (rollbackError) {
            console.error('Failed to roll back subject assignment transaction', rollbackError);
        }
        throw error;
    } finally {
        connection.release();
    }
};
