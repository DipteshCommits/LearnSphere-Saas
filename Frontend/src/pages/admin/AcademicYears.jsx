import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import axios from "../../utils/axios";

const initialForm = {
    yearLabel: "",
    startDate: "",
    endDate: "",
};

const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "-";

export default function AcademicYears() {
    const [years, setYears] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadYears = async () => {
        try {
            setError("");
            const { data } = await axios.get("/org-admin/academic-years");
            setYears(data.data || []);
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Could not load academic years.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadYears();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleCreate = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            await axios.post("/org-admin/academic-years", form);
            setForm(initialForm);
            setSuccess("Academic year created and set as active.");
            await loadYears();
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Could not create academic year.");
        } finally {
            setSaving(false);
        }
    };

    const handleActivate = async (yearId) => {
        setError("");
        setSuccess("");

        try {
            await axios.patch(`/org-admin/academic-years/${yearId}/activate`);
            setSuccess("Academic year activated.");
            await loadYears();
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Could not activate academic year.");
        }
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight={600} gutterBottom>
                Academic Years
            </Typography>
            <Typography color="text.secondary" mb={3}>
                Create a school year and choose which year is currently active.
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Paper component="form" onSubmit={handleCreate} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" mb={2}>Create academic year</Typography>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="flex-start">
                    <TextField
                        required
                        fullWidth
                        label="Year label"
                        name="yearLabel"
                        placeholder="2026-2027"
                        value={form.yearLabel}
                        onChange={handleChange}
                    />
                    <TextField
                        required
                        fullWidth
                        type="date"
                        label="Start date"
                        name="startDate"
                        value={form.startDate}
                        onChange={handleChange}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <TextField
                        required
                        fullWidth
                        type="date"
                        label="End date"
                        name="endDate"
                        value={form.endDate}
                        onChange={handleChange}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <Button type="submit" variant="contained" disabled={saving} sx={{ minHeight: 56, minWidth: 150 }}>
                        {saving ? "Creating..." : "Create year"}
                    </Button>
                </Stack>
            </Paper>

            <Typography variant="h6" mb={2}>School years</Typography>
            {loading ? (
                <CircularProgress aria-label="Loading academic years" />
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Year</TableCell>
                                <TableCell>Start date</TableCell>
                                <TableCell>End date</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {years.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        No academic years yet. Create one to start configuring grades.
                                    </TableCell>
                                </TableRow>
                            ) : years.map((year) => (
                                <TableRow key={year.id}>
                                    <TableCell>{year.year_label}</TableCell>
                                    <TableCell>{formatDate(year.start_date)}</TableCell>
                                    <TableCell>{formatDate(year.end_date)}</TableCell>
                                    <TableCell>{year.is_active ? "Active" : "Inactive"}</TableCell>
                                    <TableCell align="right">
                                        {!year.is_active && (
                                            <Button onClick={() => handleActivate(year.id)}>
                                                Set active
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}
