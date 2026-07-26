import db from '../../../database/db.js';

export const getOrganizationById = (organizationId) => {
    return new Promise((resolve, reject) => {
        db.query(
            `SELECT id, name FROM organizations WHERE id = ?`,
            [organizationId],
            (err, results) => {
                if (err) return reject(err);
                resolve(results[0] || null);
            }
        );
    });
};


export const getActiveAcademicYear = (organizationId) => {
    return new Promise((resolve, reject) => {
        db.query(
            `SELECT id , year_label AS yearLabel, start_date, end_date FROM academic_years WHERE organization_id = ? AND is_active = 1 LIMIT 1`,
            [organizationId],
            (err, results) => {
                if (err) return reject(err);
                resolve(results[0] || null);
            }
        );
    });
};

export const getStatsByOrganization = (organizationId) => {
    return new Promise((resolve, reject) => {
        db.query(
            `SELECT
              (SELECT COUNT(*) FROM students s
               JOIN users u ON s.user_id = u.id
               WHERE u.organization_id = ?) AS students,
              (SELECT COUNT(*) FROM users WHERE role = 'TEACHER' AND organization_id = ?) AS teachers,
              (SELECT COUNT(*) FROM grades WHERE organization_id = ?) AS grades,
              (SELECT COUNT(*) FROM sections sec
               JOIN grades g ON sec.grade_id = g.id
               WHERE g.organization_id = ?) AS sections
        `,
            [organizationId, organizationId, organizationId, organizationId],
            (err, results) => {
                if (err) return reject(err);
                resolve(results[0]);
            }
        );
    });
};

export const getSetupStatus = async (organizationId) => {
    const stats = await getStatsByOrganization(organizationId);

    return {
        academicYear: true, //active year already checked earlier
        grades: stats.grades > 0,
        sections: stats.sections > 0,
        students: stats.students > 0
    };
};


export const getRecentActivity = (organizationId) => {
    return new Promise((resolve, reject) => {
        db.query(
            `SELECT
              (SELECT COUNT(*) FROM students s
               JOIN users u ON s.user_id = u.id
               WHERE u.organization_id = ?
               AND s.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
              ) AS studentsAdded,
              (SELECT COUNT(*) FROM enrollments e
               JOIN academic_years ay ON e.academic_year_id = ay.id
               WHERE ay.organization_id = ?
               AND ay.is_active = 1
              ) AS enrollmentsThisYear`,
            [organizationId, organizationId],
            (err, results) => {
                if (err) return reject(err);
                resolve(results[0]);
            }
        );
    });
};