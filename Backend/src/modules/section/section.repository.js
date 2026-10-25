import db from '../../database/db.js';

export const createSection = ({
    gradeId,
    academicYearId,
    sectionName
}) => {
    return new Promise(async (resolve, reject) => {
        db.query(`INSERT INTO sections (grade_id, academic_year_id, section_name) VALUES(?,?,?)`,
            [gradeId, academicYearId, sectionName],
            (err, result) => {
                if (err) return reject(err);
                resolve(result.insertId);
            }
        );
    });
};


export const findSectionByNameAndYear = (
    gradeId,
    academicYearId,
    sectionName
) => {
    return new Promise((resolve, reject) => {
        db.query(
            `SELECT id FROM sections WHERE grade_id=? AND academic_year_id = ? AND section_name =?`,
            [gradeId, academicYearId, sectionName],
            (err, results) => {
                if (err) return reject(err);
                resolve(results.length ? results[0] : null);
            }
        );
    });
};

export const findSectionById = (sectionId, gradeId, academicYearId)=>{
    return new Promise((resolve,reject)=>{
        db.query(
            `SELECT id FROM sections
            WHERE id = ? AND grade_id = ? AND academic_year_id = ?`,
            [sectionId, gradeId, academicYearId],
            (err,results)=>{
                if(err) return reject(err);
                resolve(results.length ? results[0] : null);
            }
        )
    })
}

export const getSectionsByGradeAndYear = (
    gradeId,
    academicYearId
) => {
    return new Promise((resolve, reject) => {
        db.query(
            `SELECT id, section_name FROM sections WHERE grade_id = ? AND academic_year_id = ?`,
            [gradeId, academicYearId],
            (err, results) => {
                if (err) return reject(err);
                resolve(results);
            }
        );
    });
};
