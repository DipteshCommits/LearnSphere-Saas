import db from '../../../database/db.js';

export const updateGeneralInformation = ({ organizationId, generalInfo }) => {
    return new Promise((resolve, reject) => {

        const { schoolName, schoolCode, schoolType, otherSchoolType, establishedYear, registrationNumber, website } = generalInfo;

        const query = `
        UPDATE organizations
        SET
        name = ?,
        school_code = ?,
        school_type = ?,
        other_school_type = ?,
        established_year = ?,
        registration_number = ?,
        website = ?
        WHERE id = ?;
    `;

        const values = [schoolName, schoolCode, schoolType, otherSchoolType, establishedYear, registrationNumber, website, organizationId];

        db.query(query, values, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}

export const getGeneralInformation = (organizationId) => {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT
            name,
            school_code,
            school_type,
            other_school_type,
            established_year,
            registration_number,
            website
        FROM organizations
        WHERE id = ?
    `;

        db.query(query, [organizationId], (err, results) => {
            if (err) return reject(err);
            const data = results[0];

            const payload = {
                schoolName: data.name,
                schoolCode: data.school_code,
                schoolType: data.school_type,
                otherSchoolType: data.other_school_type,
                establishedYear: data.established_year,
                registrationNumber: data.registration_number,
                website: data.website
            };
            resolve(payload);
        });
    });
}

export const updateContactInformation = ({ organizationId, contactInfo }) => {
    return new Promise((resolve, reject) => {
        const { email, phoneNumber, alternatePhoneNumber, supportEmail } = contactInfo;

        const query = `
            UPDATE organizations
            SET
                email = ?,
                phone = ?,
                alternate_phone = ?,
                support_email = ?
            WHERE id = ?
        `;

        const values = [email, phoneNumber, alternatePhoneNumber, supportEmail, organizationId];

        db.query(query, values, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}

export const getContactInformation = (organizationId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT
                email,
                phone,
                alternate_phone,
                support_email
            FROM organizations
            WHERE id = ?
        `;

        db.query(query, [organizationId], (err, results) => {
            if (err) return reject(err);
            const data = results[0];
            const payload = {
                email: data.email,
                phone: data.phone,
                altPhone: data.alternate_phone,
                supportEmail: data.support_email
            };
            resolve(payload);
        });
    });
}

export const updateAddressInformation = ({ organizationId, addressInfo }) => {
    return new Promise((resolve, reject) => {
        const { addressLine1, addressLine2, city, state, country, postalCode } = addressInfo;

        const query = `
            UPDATE organizations
            SET
                address_line1 = ?,
                address_line2 = ?,
                city = ?,
                state = ?,
                country = ?,
                postal_code = ?
            WHERE id = ?
        `;

        const values = [addressLine1, addressLine2, city, state, country, postalCode, organizationId];

        db.query(query, values, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}

export const getAddressInformation = (organizationId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT
                address_line1,
                address_line2,
                city,
                state,
                country,
                postal_code
            FROM organizations
            WHERE id = ?
        `;

        db.query(query, [organizationId], (err, results) => {
            if (err) return reject(err);
            const data = results[0];
            const payload = {
                addressLine1: data.address_line1,
                addressLine2: data.address_line2,
                city: data.city,
                state: data.state,
                country: data.country,
                postalCode: data.postal_code
            };
            resolve(payload);
        });
    });
}

export const getLogoInformation = (organizationId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT
                logo_url,
                logo_file_name
            FROM organizations
            WHERE id = ?
        `;

        db.query(query, [organizationId], (err, results) => {
            if (err) return reject(err);

            const data = results[0];

            if (!data) {
                return resolve(null);
            }

            resolve({
                logoUrl: data.logo_url,
                logoFileName: data.logo_file_name
            });
        });
    });
};

export const updateLogoInformation = (
    organizationId,
    logoUrl,
    logoFileName
) => {
    return new Promise((resolve, reject) => {
        const query = `
            UPDATE organizations
            SET
                logo_url = ?,
                logo_file_name = ?
            WHERE id = ?
        `;

        db.query(
            query,
            [logoUrl, logoFileName, organizationId],
            (err, results) => {
                if (err) return reject(err);

                resolve({
                    logoUrl,
                    logoFileName
                });
            }
        );
    });
};

export const removeLogoInformation = (organizationId) => {
    return new Promise((resolve, reject) => {
        const query = `
            UPDATE organizations
            SET
                logo_url = NULL,
                logo_file_name = NULL
            WHERE id = ?
        `;

        db.query(
            query,
            [organizationId],
            (err, results) => {
                if (err) return reject(err);

                resolve();
            }
        );
    });
};