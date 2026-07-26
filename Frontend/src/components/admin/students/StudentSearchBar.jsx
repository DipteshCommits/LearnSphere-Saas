import { TextField, Box } from "@mui/material";

export default function StudentSearchBar({ onSearch }) {
    return (
        <Box sx={{ mb: 2 }}>
            <TextField
                fullWidth
                label="Search by name or admission number"
                variant="outlined"
                onChange={(e) => onSearch(e.target.value)}
            />
        </Box>
    );
}
