import {
    getActiveAcademicYear,
    getOrganizationById,
    getStatsByOrganization,
    getSetupStatus,
    getRecentActivity
} from './dashboard.repository.js';

export const getOrgAdminDashboard = async (organizationId) => {
    const organization = await getOrganizationById(organizationId);

    const activeAcademicYear = await getActiveAcademicYear(organizationId);

    const stats = await getStatsByOrganization(organizationId);

    const setupStatus = await getSetupStatus(organizationId);

    const recentActivity = await getRecentActivity(organizationId);

    return {
        organization,
        activeAcademicYear,
        stats,
        setupStatus,
        recentActivity
    };
};