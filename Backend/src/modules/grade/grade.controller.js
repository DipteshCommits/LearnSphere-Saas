import {
    addGrade,
    listGrades
} from './grade.service.js';

export const createGrade = async (req, res, next) => {
    try {
        const { gradeName } = req.body;

        const organizationId = req.user.organizationId;

        if (!gradeName) {
            return res.status(400).json({ message: 'Grade name is required' });
        }

        await addGrade({ organizationId, gradeName });

        res.status(201).json({ message: 'Grade created successfully' });
    } catch (error) {
        next(error);
    }
}


export const getGrades = async (req, res, next) => {
    try {
        const organizationId = req.user.organizationId;

        const grades = await listGrades(organizationId);

        res.status(200).json({ data: grades });
    } catch (error) {
        next(error);
    }
}