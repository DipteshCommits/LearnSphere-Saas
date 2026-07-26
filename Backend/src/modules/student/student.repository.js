import db from '../../database/db.js';

export const findStudentByIdAndOrg = (studentId, organizationId) => {
    return new Promise((resolve, reject) => {
        db.query(
            `SELECT S.id 
            FROM students s 
            JOIN users u ON s.user_id = u.id 
            WHERE s.id = ? AND u.organization_id = ?`,
            [studentId, organizationId],
            (err, results) => {
                if (err) return reject(err);
                resolve(results.length ? results[0] : null);
            }
        );
    });
};

export const findActiveStudentsByOrganization = (organizationId)=>{
    return new Promise((resolve,reject)=>{
        const query=`
            SELECT
                s.id AS student_id,
                u.name,
                s.admission_no,
                e.roll_no,
                g.grade_name,
                sec.section_name,
                ay.year_label
            FROM enrollments e
            JOIN students s ON e.student_id = s.id
            JOIN users u ON s.user_id = u.id
            JOIN grades g ON e.grade_id = g.id
            JOIN sections sec ON e.section_id = sec.id
            JOIN academic_years ay ON e.academic_year_id = ay.id
            WHERE
                u.organization_id = ?
                AND ay.is_active = 1
        `;

        db.query(query, [organizationId], (err,results)=>{
            if(err) return reject(err);
            resolve(results);
        })
    })
}