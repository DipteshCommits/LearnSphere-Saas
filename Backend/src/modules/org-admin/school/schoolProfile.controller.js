import { updateSchoolGeneralInformation, getSchoolGeneralInformation, updateSchoolContactInformation, getSchoolContactInformation, updateSchoolAddressInformation, getSchoolAddressInformation, 
uploadLogo,
getLogo, removeLogo
} from './schoolProfile.service.js';

export const updateGeneralInformation = async (req, res, next) => {
    try {
        const organizationId = req.user.organizationId;
        const generalInfo = req.body;

        const result = await updateSchoolGeneralInformation({ organizationId, generalInfo });

        res.status(200).json({
            message: 'General information updated successfully',
            data: result
        });

    } catch (error) {
        next(error);
    }

}


export const getGeneralInformation = async (req, res, next) => {
    try {
        const organizationId = req.user.organizationId;

        const result = await getSchoolGeneralInformation(organizationId);

        res.status(200).json({
            message: 'General information retrieved successfully',
            data: result
        });

    } catch (error) {
        next(error);
    }
}

export const updateContactInformation = async (req, res, next) => {
    try {
        const organizationId = req.user.organizationId;
        const contactInfo = req.body;

        const result = await updateSchoolContactInformation({ organizationId, contactInfo });

        res.status(200).json({
            message: 'Contact information updated successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
}


export const getContactInformation = async (req, res, next) => {
    try {
        const organizationId = req.user.organizationId;

        const result = await getSchoolContactInformation(organizationId);
        res.status(200).json({
            message: 'Contact information retrieved successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
}

export const updateAddressInformation = async (req, res, next) => {
    try {
        const organizationId = req.user.organizationId;
        const addressInfo = req.body;

        const result = await updateSchoolAddressInformation({ organizationId, addressInfo });

        res.status(200).json({
            message: 'Address information updated successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
}

export const getAddressInformation = async (req, res, next) => {
    try {
        const organizationId = req.user.organizationId;

        const result = await getSchoolAddressInformation(organizationId);
        res.status(200).json({
            message: 'Address information retrieved successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
}


export const getOrgLogo = async (req, res, next) => {
    try {
        const data =
            await getLogo(
                req.user.organizationId
            );

        res.json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

export const uploadOrgLogo = async (req, res, next) => {
    try {
        const data =
            await uploadLogo(
                req.user.organizationId,
                req.file
            );

        res.json({
            success: true,
            message: "Logo uploaded successfully",
            data
        });
    } catch (error) {
        next(error);
    }
};

export const removeOrgLogo = async (req, res, next) => {
    try {
        await removeLogo(
            req.user.organizationId
        );

        res.json({
            success: true,
            message: "Logo removed successfully"
        });
    } catch (error) {
        next(error);
    }
};