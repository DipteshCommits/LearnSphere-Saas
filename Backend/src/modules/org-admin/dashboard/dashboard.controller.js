import { getOrgAdminDashboard } from './dashboard.service.js';

export const getDashboard = async (req, res, next) => {
    try {
        const organizationId = req.user.organizationId;

        const dashboardData = await getOrgAdminDashboard(organizationId);

        res.status(200).json({
            data: dashboardData
        });
    } catch (error) {
        next(error);
    }
}