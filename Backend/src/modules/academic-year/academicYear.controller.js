import {
    activateAcademicYearById,
    addAcademicYear,
    getActiveAcademicYear,
    listAcademicYears
} from './academicYear.service.js';

export const createYear = async (req, res, next) => {
    try {
        const { yearLabel, startDate, endDate } = req.body;

        const organizationId = req.user.organizationId;

        if (!yearLabel || !startDate || !endDate) {
            return res.status(400).json({
                message: "Missing required fields"
            });
        }

        await addAcademicYear({
            organizationId,
            yearLabel,
            startDate,
            endDate
        });

        res.status(201).json({
            message: "Academic year created successfully"
        });

    } catch (error) {
        next(error);
    }
}

export const getYears = async (req, res, next) => {
    try {
        const organizationId = req.user.organizationId;

        const years = await listAcademicYears(organizationId);

        res.status(200).json({
            data: years
        });

    } catch (error) {
        next(error);
    }
};


export const getActiveYear = async (req, res, next) => {
    try {
        const organizationId = req.user.organizationId;

        const year = await getActiveAcademicYear(organizationId);

        if (!year) {
            return res.status(404).json({
                message: 'No active academic year found'
            });
        }

        res.status(200).json({ data: year });
    } catch (err) {
        next(err);
    }
}

export const activateAcademicYear = async (req,res,next)=>{
    try{
        const {id}= req.params;

        const organizationId = req.user.organizationId;

        await activateAcademicYearById(id,organizationId);

        res.status(200).json({
            message:'Academic year activated successfully'
        });

    }catch(err){
        next(err);
    }
}