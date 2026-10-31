import db from '../../../database/db.js';

export const getTeachersByOrganization = (organizationId, search, status) => {
    return new Promise((resolve, reject) => {
        let query = `
            SELECT
                id,
                name,
                email,
                is_active AS isActive,
                must_change_password AS mustChangePassword,
                created_at AS createdAt
            FROM users
            WHERE organization_id = ? AND role = 'TEACHER'
        `;
        const values = [organizationId];

        if (search) {
            query += ` AND (name LIKE ? OR email LIKE ?)`;
            values.push(`%${search}%`, `%${search}%`);
        }

        if (status === 'active') {
            query += ` AND is_active = 1`;
        } else if (status === 'inactive') {
            query += ` AND is_active = 0`;
        }

        query += ` ORDER BY name ASC`;

        db.query(query, values, (error, rows) => {
            if (error) return reject(error);
            resolve(rows);
        });
    });
};

export const createTeacherAccount = ({
    organizationId,
    name,
    email,
    passwordHash
}) => new Promise((resolve, reject) => {
    db.query(
        `INSERT INTO users
            (organization_id, name, email, password_hash, role, is_active, must_change_password)
        VALUES (?, ?, ?, ?, 'TEACHER', 1, 1)`,
        [organizationId, name, email, passwordHash],
        (error, result) => {
            if (error) return reject(error);
            resolve(result.insertId);
        }
    );
});
