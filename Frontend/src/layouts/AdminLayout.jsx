import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminTopbar from "../components/admin/AdminTopbar";

const SIDEBAR_WIDTH = 260;

const AdminLayout = () => {
    return (
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f9fafb" }}>
            {/* Sidebar */}
            <AdminSidebar width={SIDEBAR_WIDTH} />

            {/* Main Content */}
            <Box
                sx={{
                    flexGrow: 1,
                    ml: `${SIDEBAR_WIDTH}px`,
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* Topbar */}
                <AdminTopbar />

                {/* Page Content */}
                <Box sx={{ p: 3, flexGrow: 1 }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};

export default AdminLayout;
