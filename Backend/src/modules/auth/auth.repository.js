import db from '../../database/db.js';

export const findUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        db.query(
            `SELECT id,
            name,
            email,
            password_hash,
            role,
            organization_id AS organizationId,
            must_change_password AS mustChangePassword
            FROM users WHERE email=?`,
            [email],
            (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results.length ? results[0] : null);
            }
        );
    });
};

export const findUserPasswordById = (userId) => {
    return new Promise((resolve, reject) => {
        db.query(
            `SELECT password_hash, must_change_password, role,
                organization_id AS organizationId
            FROM users
            WHERE id = ?`,
            [userId],
            (err, results) => {
                if (err) return reject(err);
                resolve(results.length ? results[0] : null);
            }
        );
    });
};

export const updateUserPassword = (userId, passwordHash) => {
    return new Promise((resolve, reject) => {
        db.query(
            `UPDATE users
            SET password_hash = ?, must_change_password = 0
            WHERE id = ?`,
            [passwordHash, userId],
            (err) => {
                if (err) return reject(err);
                resolve();
            }
        );
    });
};