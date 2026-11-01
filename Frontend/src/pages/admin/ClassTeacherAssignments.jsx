import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
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

const initialForm = { teacherId: "", gradeId: "", sectionId: "" };

export default function ClassTeacherAssignments() {
    const [teachers, setTeachers] = useState([]);
    const [grades, setGrades] = useState([]);
    const [sections, setSections] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [assignmentToRemove, setAssignmentToRemove] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingSections, setLoadingSections] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadData = useCallback(async () => {
        setLoading(true);
        setLoadError("");
        try {
            const [teacherResponse, gradeResponse, assignmentResponse] = await Promise.all([
                axios.get("/org-admin/teachers", { params: { status: "active" } }),
                axios.get("/org-admin/grades"),
                axios.get("/org-admin/class-teacher-assignments"),
            ]);
            setTeachers(teacherResponse.data.data || []);
            setGrades(gradeResponse.data.data || []);
            setAssignments(assignmentResponse.data.data || []);
        } catch (requestError) {
            setLoadError(requestError.response?.data?.message || "Could not load class teacher assignments.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        if (!form.gradeId) {
            setSections([]);
            setForm((current) => ({ ...current, sectionId: "" }));
            return undefined;
        }

        let cancelled = false;
        setLoadingSections(true);
        axios.get("/org-admin/sections", { params: { gradeId: form.gradeId } })
            .then(({ data }) => {
                if (!cancelled) setSections(data.data || []);
            })
            .catch((requestError) => {
                if (!cancelled) {
                    setError(requestError.response?.data?.message || "Could not load sections.");
                }
            })
            .finally(() => {
                if (!cancelled) setLoadingSections(false);
            });
        return () => {
            cancelled = true;
        };
    }, [form.gradeId]);

    const selectedSectionAssignment = useMemo(
        () => assignments.find((assignment) => String(assignment.sectionId) === form.sectionId),
        [assignments, form.sectionId]
    );

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({
            ...current,
            [name]: value,
            ...(name === "gradeId" ? { sectionId: "" } : {}),
            ...(name === "sectionId"
                ? {
                    teacherId: assignments.find(
                        (assignment) => String(assignment.sectionId) === value
                    )?.teacherId?.toString() || "",
                }
                : {}),
        }));
        setError("");
    };

    const handleAssign = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await axios.put(`/org-admin/class-teacher-assignments/${form.sectionId}`, {
                teacherId: form.teacherId,
                gradeId: form.gradeId,
            });
            setSuccess(selectedSectionAssignment
                ? "Class teacher updated."
                : "Class teacher assigned.");
            await loadData();
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Could not save class teacher assignment.");
        } finally {
            setSaving(false);
        }
    };

    const handleRemove = async () => {
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await axios.delete(`/org-admin/class-teacher-assignments/${assignmentToRemove.id}`);
            setAssignmentToRemove(null);
            setForm((current) => (
                String(current.sectionId) === String(assignmentToRemove.sectionId)
                    ? { ...current, teacherId: "" }
                    : current
            ));
            setSuccess("Class teacher assignment removed.");
            await loadData();
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Could not remove class teacher assignment.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <CircularProgress aria-label="Loading class teacher assignments" />;
    }

    return (
        <Box>
            <Typography variant="h4" fontWeight={600} gutterBottom>Class teachers</Typography>
            <Typography color="text.secondary" mb={3}>
                Assign one class teacher to each section for the current academic year.
            </Typography>
            {loadError && (
                <Alert
                    severity="error"
                    action={<Button color="inherit" size="small" onClick={loadData}>Retry</Button>}
                    sx={{ mb: 2 }}
                >
                    {loadError}
                </Alert>
            )}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {!loadError && (
                <>
                    {!grades.length ? (
                        <Alert severity="info" sx={{ mb: 3 }}>
                            Create an active academic year with grades and sections before assigning class teachers.
                        </Alert>
                    ) : !teachers.length ? (
                        <Alert severity="info" sx={{ mb: 3 }}>
                            Create an active teacher account before assigning class teachers.
                        </Alert>
                    ) : (
                        <Paper component="form" onSubmit={handleAssign} sx={{ p: 3, mb: 4 }}>
                            <Typography variant="h6" mb={2}>Assign a class teacher</Typography>
                            <Stack spacing={2}>
                                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                    <TextField
                                        select
                                        required
                                        fullWidth
                                        label="Grade"
                                        name="gradeId"
                                        value={form.gradeId}
                                        onChange={handleChange}
                                    >
                                        {grades.map((grade) => (
                                            <MenuItem key={grade.id} value={String(grade.id)}>
                                                {grade.grade_name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                    <TextField
                                        select
                                        required
                                        fullWidth
                                        label="Section"
                                        name="sectionId"
                                        value={form.sectionId}
                                        onChange={handleChange}
                                        disabled={!form.gradeId || loadingSections || !sections.length}
                                        helperText={form.gradeId && !loadingSections && !sections.length
                                            ? "Create a section for this grade first."
                                            : undefined}
                                    >
                                        {sections.map((section) => (
                                            <MenuItem key={section.id} value={String(section.id)}>
                                                {section.section_name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                    <TextField
                                        select
                                        required
                                        fullWidth
                                        label="Class teacher"
                                        name="teacherId"
                                        value={form.teacherId}
                                        onChange={handleChange}
                                        disabled={!form.sectionId}
                                    >
                                        {teachers.map((teacher) => (
                                            <MenuItem key={teacher.id} value={String(teacher.id)}>
                                                {teacher.name} ({teacher.email})
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Stack>
                                <Box display="flex" justifyContent="flex-end">
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={saving || !form.gradeId || !form.sectionId || !form.teacherId}
                                    >
                                        {saving
                                            ? "Saving..."
                                            : selectedSectionAssignment ? "Update class teacher" : "Assign class teacher"}
                                    </Button>
                                </Box>
                            </Stack>
                        </Paper>
                    )}

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Grade</TableCell>
                                    <TableCell>Section</TableCell>
                                    <TableCell>Class teacher</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {!assignments.length ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            No class teachers have been assigned for the active year.
                                        </TableCell>
                                    </TableRow>
                                ) : assignments.map((assignment) => (
                                    <TableRow key={assignment.id}>
                                        <TableCell>{assignment.gradeName}</TableCell>
                                        <TableCell>{assignment.sectionName}</TableCell>
                                        <TableCell>{assignment.teacherName}</TableCell>
                                        <TableCell align="right">
                                            <Button
                                                color="error"
                                                onClick={() => setAssignmentToRemove(assignment)}
                                            >
                                                Remove
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}

            <Dialog
                open={Boolean(assignmentToRemove)}
                onClose={() => !saving && setAssignmentToRemove(null)}
            >
                <DialogTitle>Remove class teacher?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This will remove {assignmentToRemove?.teacherName} as the class teacher for
                        {" "}{assignmentToRemove?.gradeName} - {assignmentToRemove?.sectionName}.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAssignmentToRemove(null)} disabled={saving}>Cancel</Button>
                    <Button color="error" onClick={handleRemove} disabled={saving}>
                        {saving ? "Removing..." : "Remove assignment"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
