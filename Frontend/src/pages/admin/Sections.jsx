import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    MenuItem,
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

export default function Sections() {
    const [grades, setGrades] = useState([]);
    const [sections, setSections] = useState([]);
    const [gradeId, setGradeId] = useState("");
    const [sectionName, setSectionName] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadSections = async (selectedGradeId) => {
        if (!selectedGradeId) {
            setSections([]);
            return;
        }
        try {
            const { data } = await axios.get("/org-admin/sections", {
                params: { gradeId: selectedGradeId },
            });
            setSections(data.data || []);
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Could not load sections.");
        }
    };

    useEffect(() => {
        const loadGrades = async () => {
            try {
                const { data } = await axios.get("/org-admin/grades");
                const availableGrades = data.data || [];
                setGrades(availableGrades);
                setGradeId(availableGrades.length ? String(availableGrades[0].id) : "");
            } catch (requestError) {
                setError(requestError.response?.data?.message || "Could not load grades.");
            } finally {
                setLoading(false);
            }
        };

        loadGrades();
    }, []);

    useEffect(() => {
        loadSections(gradeId);
    }, [gradeId]);

    const handleCreate = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await axios.post("/org-admin/sections", { gradeId, sectionName });
            setSectionName("");
            setSuccess("Section created.");
            await loadSections(gradeId);
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Could not create section.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight={600} gutterBottom>Sections</Typography>
            <Typography color="text.secondary" mb={3}>
                Add sections to grades in your active academic year.
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {loading ? <CircularProgress aria-label="Loading grades" /> : (
                <>
                    {grades.length === 0 ? (
                        <Alert severity="info" sx={{ mb: 3 }}>
                            Create an active academic year and at least one grade before adding sections.
                        </Alert>
                    ) : (
                        <>
                            <Paper component="form" onSubmit={handleCreate} sx={{ p: 3, mb: 4 }}>
                                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Grade"
                                        value={gradeId}
                                        onChange={(event) => setGradeId(event.target.value)}
                                    >
                                        {grades.map((grade) => (
                                            <MenuItem key={grade.id} value={String(grade.id)}>
                                                {grade.grade_name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Section name"
                                        placeholder="A"
                                        value={sectionName}
                                        onChange={(event) => setSectionName(event.target.value)}
                                    />
                                    <Button type="submit" variant="contained" disabled={saving} sx={{ minWidth: 160 }}>
                                        {saving ? "Creating..." : "Add section"}
                                    </Button>
                                </Stack>
                            </Paper>

                            <Typography variant="h6" mb={2}>
                                Sections for {grades.find((grade) => String(grade.id) === String(gradeId))?.grade_name || "selected grade"}
                            </Typography>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead><TableRow><TableCell>Section</TableCell></TableRow></TableHead>
                                    <TableBody>
                                        {sections.length === 0 ? (
                                            <TableRow><TableCell align="center">No sections for this grade yet.</TableCell></TableRow>
                                        ) : sections.map((section) => (
                                            <TableRow key={section.id}>
                                                <TableCell>{section.section_name}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}
                </>
            )}
        </Box>
    );
}
