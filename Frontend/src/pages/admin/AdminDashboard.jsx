import { useEffect, useState } from "react";
import ActiveYearBanner from "../../components/admin/ActiveYearBanner";
import DashboardStats from "../../components/admin/DashboardStats";
import SetupChecklist from "../../components/admin/SetupChecklist";
import OrganizationHeader from "../../components/admin/OrganizationHeader";
import RecentActivity from "../../components/admin/RecentActivity";
import QuickActions from "../../components/admin/QuickActions";
import axios from "../../utils/axios";

export default function AdminDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await axios.get("/org-admin/dashboard");
                setDashboard(res.data.data);
                console.log("Dashboard data:", dashboard.setupStatus);
            } catch (err) {
                console.error("Failed to load dashboard", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) return <div>Loading dashboard...</div>;

    if (!dashboard) return <div>Something went wrong</div>;

    return (
        <>
            <OrganizationHeader organization={dashboard.organization} />

            <ActiveYearBanner activeYear={dashboard.activeAcademicYear} />

            <DashboardStats stats={dashboard.stats} />

            <SetupChecklist checklist={dashboard.setupStatus} />

            <QuickActions />

            <RecentActivity activity={dashboard.recentActivity} />
        </>
    );
}
