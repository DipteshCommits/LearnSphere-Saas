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


export const getEnrollmentsByStudent = (studentId) =>{
    return new Promise((resolve,reject)=>{
        db.query(
            `SELECT * FROM enrollments WHERE student_id = ? ORDER BY academic_year_id DESC`,
            [studentId],
            (err, results)=>{
                if(err) return reject(err);
                resolve(results);
            }
        )
    })
}