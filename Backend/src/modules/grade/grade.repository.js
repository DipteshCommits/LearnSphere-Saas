import db from '../../database/db.js';

export const findGradeByNameAndOrg = (gradeName, organizationId)=>{
    return new Promise((resolve,reject)=>{
        db.query(`SELECT id FROM grades WHERE grade_name=? AND organization_id=?`,
            [gradeName,organizationId],
            (err,results)=>{
                if(err) return reject(err);
                resolve(results.length?results[0]:null);
            }
        );
    });
};

export const findGradeByIdAndOrg = (gradeId,organizationId)=>{
    return new Promise((resolve,reject)=>{
        db.query(`SELECT * FROM grades WHERE id=? AND organization_id=?`,
            [gradeId,organizationId],
            (err,results)=>{
                if(err) return reject(err);
                resolve(results.length?results[0]:null);
            }
        );
    });
};

export const createGrade = ({gradeName,organizationId,academicYearId})=>{
    return new Promise((resolve,reject)=>{ 

        db.query(`INSERT INTO grades(grade_name,organization_id,academic_year_id) VALUES (?,?,?)`,
            [gradeName,organizationId,academicYearId],
            (err,result)=>{
                if(err) return reject(err);
                resolve(result.insertId);
            }
        );
    });
};


export const getGradesByOrganization = (organizationId)=>{
    return new Promise((resolve,reject)=>{
        db.query(`SELECT id, grade_name, created_at FROM grades WHERE organization_id = ? ORDER BY created_at DESC`,
            [organizationId],
            (err,results)=>{
                if(err) return reject(err);
                resolve(results);
            }
        );
    });
};