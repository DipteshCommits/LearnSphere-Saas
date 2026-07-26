import db from '../../../database/db.js';

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
                s.admission_no,
                ay.year_label AS academicYear,
                g.grade_name AS grade,
                sec.section_name AS section,
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
