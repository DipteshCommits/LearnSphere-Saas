import {
    AppBar,
    Toolbar,
    Box,
    Typography,
    Button,
    Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const AdminTopbar = () => {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                bgcolor: "#ffffff",
                color: "#111827",
                borderBottom: "1px solid #e5e7eb",
            }}
        >
            <Toolbar sx={{ justifyContent: "space-between" }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Admin Dashboard
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Chip
                        label="ORG ADMIN"
                        size="small"
                        sx={{ bgcolor: "#e0f2fe", color: "#0284c7", fontWeight: 600 }}
                    />

                    <Typography sx={{ fontWeight: 500 }}>
                        {user?.name || "Admin"}
                    </Typography>

                    <Button
                        variant="outlined"
                        size="small"
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default AdminTopbar;
