import db from '../../database/db.js';

export const findUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        db.query(
            `SELECT id,
            name,
            email,
            password_hash,
            role,
            organization_id AS organizationId
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