import {
    updateGeneralInformation, getGeneralInformation, updateContactInformation, getContactInformation, 
    updateAddressInformation,
    getAddressInformation,
    updateLogoInformation, getLogoInformation , removeLogoInformation
} from './schoolProfile.repository.js';

export const updateSchoolGeneralInformation = async ({ organizationId, generalInfo }) => {
    return await updateGeneralInformation({ organizationId, generalInfo });
};

export const getSchoolGeneralInformation = async (organizationId) => {
    return await getGeneralInformation(organizationId);
};

export const updateSchoolContactInformation = async ({ organizationId, contactInfo }) => {
    return await updateContactInformation({ organizationId, contactInfo });
}

export const getSchoolContactInformation = async (organizationId) => {
    return await getContactInformation(organizationId);
}

export const updateSchoolAddressInformation = async ({ organizationId, addressInfo }) => {
    return await updateAddressInformation({ organizationId, addressInfo });
}

export const getSchoolAddressInformation = async (organizationId) => {
    return await getAddressInformation(organizationId);
}


export const getLogo = async (organizationId) => {
    return await getLogoInformation(organizationId);
};

export const uploadLogo = async (
    organizationId,
    file
) => {
    if (!file) {
        const error = new Error("Logo file is required");
        error.statusCode = 400;
        throw error;
    }

    const logoUrl =
        `/uploads/organizations/${organizationId}/${file.filename}`;

    return await updateLogoInformation(
        organizationId,
        logoUrl,
        file.originalname
    );
};

export const removeLogo = async (organizationId) => {
    return await removeLogoInformation(
        organizationId
    );
};