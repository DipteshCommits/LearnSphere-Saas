import { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    ListItemText,
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
import EditOutlined from "@mui/icons-material/EditOutlined";
import axios from "../../utils/axios";

const getGradeIds = (value) => (
    typeof value === "string" && value
        ? value.split(",").filter(Boolean)
        : []
);

export default function Subjects() {
    const [subjects, setSubjects] = useState([]);
    const [grades, setGrades] = useState([]);
    const [subjectName, setSubjectName] = useState("");
    const [selectedGradeIds, setSelectedGradeIds] = useState([]);
    const [editingSubject, setEditingSubject] = useState(null);
    const [editingSubjectName, setEditingSubjectName] = useState("");
    const [editingGradeIds, setEditingGradeIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [loadError, setLoadError] = useState("");
    const [success, setSuccess] = useState("");

    const loadData = useCallback(async () => {
        setLoading(true);
        setLoadError("");
        try {
            const [subjectsResponse, gradesResponse] = await Promise.all([
                axios.get("/org-admin/subjects"),
                axios.get("/org-admin/grades"),
            ]);
            setSubjects(subjectsResponse.data.data || []);
            setGrades(gradesResponse.data.data || []);
        } catch (requestError) {
            setLoadError(requestError.response?.data?.message || "Could not load subjects.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleCreate = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            await axios.post("/org-admin/subjects", {
                subjectName,
                gradeIds: selectedGradeIds,
            });
            setSubjectName("");
            setSelectedGradeIds([]);
            setSuccess("Subject created and assigned to selected grades.");
            await loadData();
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Could not create subject.");
        } finally {
            setSaving(false);
        }
    };

    const handleSubjectSave = async () => {
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await axios.put(`/org-admin/subjects/${editingSubject.id}`, {
                subjectName: editingSubjectName,
                gradeIds: editingGradeIds,
            });
            setEditingSubject(null);
            setSuccess("Subject updated.");
            await loadData();
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Could not update subject.");
        } finally {
            setSaving(false);
        }
    };

    const renderGradeSelect = (label, value, onChange) => (
        <TextField
            select
            fullWidth
            label={label}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            SelectProps={{
                multiple: true,
                renderValue: (selected) => selected
                    .map((id) => grades.find((grade) => String(grade.id) === String(id))?.grade_name)
                    .filter(Boolean)
                    .join(", "),
            }}
        >
            {grades.map((grade) => (
                <MenuItem key={grade.id} value={String(grade.id)}>
                    <Checkbox checked={value.includes(String(grade.id))} />
                    <ListItemText primary={grade.grade_name} />
                </MenuItem>
            ))}
        </TextField>
    );

    return (
        <Box>
            <Typography variant="h4" fontWeight={600} gutterBottom>Subjects</Typography>
            <Typography color="text.secondary" mb={3}>
                Manage your school&apos;s subject catalog and assign subjects to grades in the active academic year.
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {loadError && (
                <Alert
                    severity="error"
                    action={(
                        <Button color="inherit" size="small" onClick={loadData}>
                            Retry
                        </Button>
                    )}
                    sx={{ mb: 2 }}
                >
                    {loadError}
                </Alert>
            )}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {loading ? (
                <CircularProgress aria-label="Loading subjects" />
            ) : loadError ? null : (
                <>
                    {grades.length === 0 ? (
                        <Alert severity="info" sx={{ mb: 3 }}>
                            Create an active academic year and at least one grade before managing subjects.
                        </Alert>
                    ) : (
                        <Paper component="form" onSubmit={handleCreate} sx={{ p: 3, mb: 4 }}>
                            <Stack spacing={2}>
                                <Typography variant="h6">Add a subject</Typography>
                                <TextField
                                    required
                                    fullWidth
                                    label="Subject name"
                                    value={subjectName}
                                    onChange={(event) => setSubjectName(event.target.value)}
                                    inputProps={{ maxLength: 100 }}
                                />
                                {renderGradeSelect("Assign to grades", selectedGradeIds, setSelectedGradeIds)}
                                <Box>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={saving || selectedGradeIds.length === 0}
                                    >
                                        {saving ? "Saving..." : "Add subject"}
                                    </Button>
                                </Box>
                            </Stack>
                        </Paper>
                    )}

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Subject</TableCell>
                                    <TableCell>Assigned grades</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {subjects.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center">No subjects have been added yet.</TableCell>
                                    </TableRow>
                                ) : subjects.map((subject) => (
                                    <TableRow key={subject.id}>
                                        <TableCell>{subject.subjectName}</TableCell>
                                        <TableCell>{subject.grades || "None"}</TableCell>
                                        <TableCell align="right">
                                            <Button
                                                startIcon={<EditOutlined />}
                                                onClick={() => {
                                                    setEditingSubject(subject);
                                                    setEditingSubjectName(subject.subjectName);
                                                    setEditingGradeIds(getGradeIds(subject.gradeIds));
                                                }}
                                                aria-label={`Edit ${subject.subjectName}`}
                                            >
                                                Edit
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
                open={Boolean(editingSubject)}
                onClose={() => !saving && setEditingSubject(null)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Edit subject</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField
                            required
                            fullWidth
                            label="Subject name"
                            value={editingSubjectName}
                            onChange={(event) => setEditingSubjectName(event.target.value)}
                            inputProps={{ maxLength: 100 }}
                            disabled={saving}
                        />
                        {grades.length
                            ? renderGradeSelect("Assigned grades", editingGradeIds, setEditingGradeIds)
                            : <Alert severity="info">No grades are available for the active academic year.</Alert>}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditingSubject(null)} disabled={saving}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSubjectSave}
                        disabled={saving || !editingSubject}
                    >
                        {saving ? "Saving..." : "Save changes"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
