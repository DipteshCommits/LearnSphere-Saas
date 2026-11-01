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

const initialForm = {
    teacherId: "",
    gradeId: "",
    sectionId: "",
    subjectId: "",
};

const subjectGradeIds = (value) => (
    typeof value === "string" ? value.split(",").filter(Boolean) : []
);

export default function TeacherAssignments() {
    const [teachers, setTeachers] = useState([]);
    const [grades, setGrades] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [sections, setSections] = useState([]);
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
            const [teacherResponse, gradeResponse, subjectResponse, assignmentResponse] = await Promise.all([
                axios.get("/org-admin/teachers", { params: { status: "active" } }),
                axios.get("/org-admin/grades"),
                axios.get("/org-admin/subjects"),
                axios.get("/org-admin/teacher-assignments"),
            ]);
            setTeachers(teacherResponse.data.data || []);
            setGrades(gradeResponse.data.data || []);
            setSubjects(subjectResponse.data.data || []);
            setAssignments(assignmentResponse.data.data || []);
        } catch (requestError) {
            setLoadError(requestError.response?.data?.message || "Could not load teacher assignments.");
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
            setForm((current) => ({ ...current, sectionId: "", subjectId: "" }));
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

    const availableSubjects = useMemo(() => subjects.filter((subject) => (
        subjectGradeIds(subject.gradeIds).includes(String(form.gradeId))
    )), [subjects, form.gradeId]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({
            ...current,
            [name]: value,
            ...(name === "gradeId" ? { sectionId: "", subjectId: "" } : {}),
        }));
        setError("");
    };

    const handleAssign = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await axios.post("/org-admin/teacher-assignments", form);
            setForm(initialForm);
            setSections([]);
            setSuccess("Teacher assigned to the subject and section.");
            await loadData();
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Could not assign teacher.");
        } finally {
            setSaving(false);
        }
    };

    const handleRemove = async () => {
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await axios.delete(`/org-admin/teacher-assignments/${assignmentToRemove.id}`);
            setAssignmentToRemove(null);
            setSuccess("Teacher assignment removed.");
            await loadData();
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Could not remove teacher assignment.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <CircularProgress aria-label="Loading teacher assignments" />;
    }

    return (
        <Box>
            <Typography variant="h4" fontWeight={600} gutterBottom>Teacher assignments</Typography>
            <Typography color="text.secondary" mb={3}>
                Assign active teachers to subjects and sections for the current academic year.
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
                            Create an active academic year with grades and sections before assigning teachers.
                        </Alert>
                    ) : !teachers.length ? (
                        <Alert severity="info" sx={{ mb: 3 }}>
                            Create an active teacher account before assigning classes.
                        </Alert>
                    ) : (
                        <Paper component="form" onSubmit={handleAssign} sx={{ p: 3, mb: 4 }}>
                            <Typography variant="h6" mb={2}>Assign a teacher</Typography>
                            <Stack spacing={2}>
                                <TextField
                                    select
                                    required
                                    fullWidth
                                    label="Teacher"
                                    name="teacherId"
                                    value={form.teacherId}
                                    onChange={handleChange}
                                >
                                    {teachers.map((teacher) => (
                                        <MenuItem key={teacher.id} value={String(teacher.id)}>
                                            {teacher.name} ({teacher.email})
                                        </MenuItem>
                                    ))}
                                </TextField>
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
                                        label="Subject"
                                        name="subjectId"
                                        value={form.subjectId}
                                        onChange={handleChange}
                                        disabled={!form.gradeId || !availableSubjects.length}
                                        helperText={form.gradeId && !availableSubjects.length
                                            ? "Assign subjects to this grade first."
                                            : undefined}
                                    >
                                        {availableSubjects.map((subject) => (
                                            <MenuItem key={subject.id} value={String(subject.id)}>
                                                {subject.subjectName}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Stack>
                                <Box display="flex" justifyContent="flex-end">
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={saving || !form.teacherId || !form.sectionId || !form.subjectId}
                                    >
                                        {saving ? "Saving..." : "Assign teacher"}
                                    </Button>
                                </Box>
                            </Stack>
                        </Paper>
                    )}

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Teacher</TableCell>
                                    <TableCell>Subject</TableCell>
                                    <TableCell>Grade</TableCell>
                                    <TableCell>Section</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {!assignments.length ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            No teachers have been assigned for the active year.
                                        </TableCell>
                                    </TableRow>
                                ) : assignments.map((assignment) => (
                                    <TableRow key={assignment.id}>
                                        <TableCell>{assignment.teacherName}</TableCell>
                                        <TableCell>{assignment.subjectName}</TableCell>
                                        <TableCell>{assignment.gradeName}</TableCell>
                                        <TableCell>{assignment.sectionName}</TableCell>
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
                <DialogTitle>Remove teacher assignment?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This will unassign {assignmentToRemove?.teacherName} from {assignmentToRemove?.subjectName}
                        {" "}in {assignmentToRemove?.gradeName} - {assignmentToRemove?.sectionName}.
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
