import {
    createSubject,
    listSubjects,
    updateSubject
} from './subjectManagement.service.js';

export const getSubjects = async (req, res, next) => {
    try {
        const data = await listSubjects(req.user.organizationId);
        res.status(200).json({ data });
    } catch (error) {
        next(error);
    }
};

export const postSubject = async (req, res, next) => {
    try {
        const subjectId = await createSubject({
            ...req.body,
            organizationId: req.user.organizationId
        });
        res.status(201).json({
            message: 'Subject created and assigned to selected grades',
            data: { subjectId }
        });
    } catch (error) {
        next(error);
    }
};

export const putSubject = async (req, res, next) => {
    try {
        await updateSubject({
            ...req.body,
            subjectId: req.params.subjectId,
            organizationId: req.user.organizationId
        });
        res.status(200).json({ message: 'Subject updated' });
    } catch (error) {
        next(error);
    }
};
