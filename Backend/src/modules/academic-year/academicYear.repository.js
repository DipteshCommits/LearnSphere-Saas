import db from '../../database/db.js';

export const createAcademicYear = ({
    organizationId,
    yearLabel,
    startDate,
    endDate }) => {
    return new Promise((resolve, reject) => {
        db.query(`INSERT INTO academic_years (organization_id, year_label, start_date, end_date) VALUES (?,?,?,?)`,
            [organizationId, yearLabel, startDate, endDate],
            (err, result) => {
                if (err)
                    return reject(err);
                else
                    resolve(result.insertId);
            }

        );
    })

}


export const getAcademicYearsByOrganization = (organizationId) => {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM academic_years WHERE organization_id=?`,
            [`organizationId`],
            (err, result) => {
                if (err)
                    return reject(err);
                else
                    resolve(result);
            });

    });
}

export const deactivateAllYears = (organizationId) => {
    return new Promise((resolve, reject) => {
        db.query(`UPDATE academic_years SET is_active= false WHERE organization_id=?`,
            [organizationId],
            (err) => {
                if (err) {
                    return reject(err);
                } else {
                    resolve();
                }
            }
        )
    });
};

export const activateYear = (yearId) => {
    return new Promise((resolve, reject) => {
        db.query(`UPDATE academic_years SET is_active=true WHERE id=?`,
            [yearId],
            (err) => {
                if (err) return reject(err);
                resolve();
            }
        )
    })
};


export const findYearByLabelAndOrg = (yearLabel, organizationId) => {
    return new Promise((resolve, reject) => {
        db.query(
            `SELECT id FROM academic_years WHERE year_label=? AND organization_id=?`,
            [yearLabel, organizationId],
            (err, results) => {
                if (err) {
                    return reject(err);
                } else {
                    resolve(results.length?results[0]:null);
                }
            }
        )
    });
}


export const findActiveYearByOrg= (organizationId)=>{
    return new Promise((resolve,reject)=>{
        db.query(
            `SELECT * FROM academic_years WHERE organization_id = ? AND is_active=1 LIMIT 1`,
            [organizationId],
            (err,results)=>{
                if(err) return reject(err);
                resolve(results[0] || null);
            }
        );
    });
};


