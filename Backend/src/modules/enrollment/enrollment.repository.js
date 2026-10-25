import db from '../../database/db.js';

export const findEnrollmentsByStudentAndYear = (
    studentId,
    academicYearId
) => {
    return new Promise((resolve,reject)=>{
        db.query(
            `SELECT id FROM enrollments WHERE student_id = ? AND academic_year_id = ?`,
            [studentId,academicYearId],
            (err,results)=>{``
                if(err) return reject(err);
                resolve(results.length?results[0]:null);
            }
        );
    });
};

export const createEnrollment = ({
    studentId,
    academicYearId,
    gradeId,
    sectionId,
    rollNo
})=>{
    return new Promise((resolve,reject)=>{
        db.query(
            `INSERT INTO enrollments(student_id, academic_year_id, grade_id, section_id, roll_no) values(?,?,?,?,?)`,
            [studentId, academicYearId, gradeId, sectionId, rollNo],
            (err, result)=>{
                if(err) return reject(err);
                resolve(result.insertId);
            }
        );
    });
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