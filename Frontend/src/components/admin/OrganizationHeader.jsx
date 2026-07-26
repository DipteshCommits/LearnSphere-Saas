import { Box, Typography } from "@mui/material";

export default function OrganizationHeader({ organization }) {
    if (!organization) return null;

    return (
        <Box sx={{ mb: 3 }}>
            <Typography variant="h4" fontWeight="bold">
                {organization.name}
            </Typography>
            <Typography color="text.secondary">
                Organization Admin Dashboard
            </Typography>
        </Box>
    );
}
