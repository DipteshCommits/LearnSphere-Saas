import {
    addSection,
    listSectionsByGrade
} from './section.service.js';

export const createSection = async (req, res, next) => {
    try {
        const { gradeId, sectionName } = req.body;

        const organizationId = req.user.organizationId;

        if (!gradeId || !sectionName) {
            return res.status(400).json({
                message: 'gradeId and sectionName are required'
            });
        }

        await addSection({
            organizationId,
            gradeId,
            sectionName
        });

        res.status(201).json({
            message: 'Section created successfully'
        });

    } catch (error) {
        next(error);
    }
};


export const getSections = async (req, res, next) => {
    try {
        const { gradeId } = req.query;
        const organizationId = req.user.organizationId;

        if (!gradeId) {
            return res.status(400).json({
                message: 'gradeId is required'
            });
        }

        const sections = await listSectionsByGrade({
            organizationId,
            gradeId
        });

        res.status(200).json({ data: sections });
    } catch (error) {
        next(error);
    }
};