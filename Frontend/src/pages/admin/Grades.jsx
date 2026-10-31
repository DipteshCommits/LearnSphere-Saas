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

export default function Grades() {
    const [grades, setGrades] = useState([]);
    const [gradeName, setGradeName] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadGrades = async () => {
        try {
            setError("");
            const { data } = await axios.get("/org-admin/grades");
            setGrades(data.data || []);
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Could not load grades.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGrades();
    }, []);

    const handleCreate = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            await axios.post("/org-admin/grades", { gradeName });
            setGradeName("");
            setSuccess("Grade created.");
            await loadGrades();
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Could not create grade.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight={600} gutterBottom>Grades</Typography>
            <Typography color="text.secondary" mb={3}>
                Grades are created for your active academic year.
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Paper component="form" onSubmit={handleCreate} sx={{ p: 3, mb: 4 }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField
                        required
                        fullWidth
                        label="Grade name"
                        placeholder="Grade 1"
                        value={gradeName}
                        onChange={(event) => setGradeName(event.target.value)}
                    />
                    <Button type="submit" variant="contained" disabled={saving} sx={{ minWidth: 150 }}>
                        {saving ? "Creating..." : "Add grade"}
                    </Button>
                </Stack>
            </Paper>

            {loading ? (
                <CircularProgress aria-label="Loading grades" />
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Grade</TableCell>
                                <TableCell>Created</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {grades.length === 0 ? (
                                <TableRow><TableCell colSpan={2} align="center">No grades for the active year yet.</TableCell></TableRow>
                            ) : grades.map((grade) => (
                                <TableRow key={grade.id}>
                                    <TableCell>{grade.grade_name}</TableCell>
                                    <TableCell>{grade.created_at ? new Date(grade.created_at).toLocaleDateString() : "-"}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}
