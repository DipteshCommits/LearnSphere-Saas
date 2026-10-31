import { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
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
    Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../../utils/axios";

const formatDate = (date) => date ? new Date(date).toLocaleDateString() : "-";
const emptyForm = {
    name: "",
    email: "",
    admissionNo: "",
    gradeId: "",
    sectionId: "",
    rollNo: "",
};

export default function StudentProfile() {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [grades, setGrades] = useState([]);
    const [sections, setSections] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const loadStudent = useCallback(async (cancelled = () => false) => {
        setLoading(true);
        setError("");
        try {
            const [{ data: profileResponse }, { data: gradeResponse }] = await Promise.all([
                axios.get(`/org-admin/students/${studentId}`),
                axios.get("/org-admin/grades"),
            ]);
            if (cancelled()) return;

            const profile = profileResponse.data;
            const activeEnrollment = profile.enrollments.find((enrollment) => enrollment.isCurrentYear);
            setStudent(profile);
            setGrades(gradeResponse.data || []);
            setForm({
                name: profile.name || "",
                email: profile.email || "",
                admissionNo: profile.admissionNo || "",
                gradeId: activeEnrollment ? String(activeEnrollment.gradeId) : "",
                sectionId: activeEnrollment ? String(activeEnrollment.sectionId) : "",
                rollNo: activeEnrollment?.rollNo || "",
            });
        } catch (requestError) {
            if (!cancelled()) {
                setError(requestError.response?.data?.message || "Could not load student profile.");
            }
        } finally {
            if (!cancelled()) setLoading(false);
        }
    }, [studentId]);

    useEffect(() => {
        let cancelled = false;
        loadStudent(() => cancelled);

        return () => {
            cancelled = true;
        };
    }, [loadStudent]);

    useEffect(() => {
        if (!form.gradeId) {
            setSections([]);
            return undefined;
        }

        let cancelled = false;
        axios.get("/org-admin/sections", { params: { gradeId: form.gradeId } })
            .then(({ data }) => {
                if (!cancelled) setSections(data.data || []);
            })
            .catch((requestError) => {
                if (!cancelled) {
                    setError(requestError.response?.data?.message || "Could not load sections.");
                }
            });
        return () => {
            cancelled = true;
        };
    }, [form.gradeId]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({
            ...current,
            [name]: value,
            ...(name === "gradeId" ? { sectionId: "" } : {}),
        }));
        if (name === "gradeId") setSections([]);
    };

    const handleSave = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        try {
            await axios.patch(`/org-admin/students/${studentId}`, form);
            setEditing(false);
            await loadStudent();
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Could not update student.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <CircularProgress aria-label="Loading student profile" />;
    }

    if (error) {
        return (
            <Box>
                <Button onClick={() => navigate("/admin/students")} sx={{ mb: 2 }}>
                    Back to students
                </Button>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!student) return null;

    return (
        <Box>
            <Button onClick={() => navigate("/admin/students")} sx={{ mb: 2 }}>
                Back to students
            </Button>
            <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                mb={3}
            >
                <Box>
                    <Typography variant="h4" fontWeight={600}>{student.name}</Typography>
                    <Typography color="text.secondary">
                        Admission number: {student.admissionNo}
                    </Typography>
                </Box>
                <Chip
                    label={student.isActive ? "Active" : "Inactive"}
                    color={student.isActive ? "success" : "default"}
                />
            </Stack>
            <Stack direction="row" justifyContent="flex-end" mb={2}>
                {!editing && student.enrollments.some((enrollment) => enrollment.isCurrentYear) && (
                    <Button variant="contained" onClick={() => setEditing(true)}>
                        Edit student / placement
                    </Button>
                )}
            </Stack>

            {student.mustChangePassword && (
                <Alert severity="info" sx={{ mb: 3 }}>
                    The student has not changed their temporary password yet.
                </Alert>
            )}

            <Paper
                component={editing ? "form" : "div"}
                onSubmit={editing ? handleSave : undefined}
                sx={{ p: 3, mb: 4 }}
            >
                <Typography variant="h6" mb={2}>Student information</Typography>
                {editing ? (
                    <Stack spacing={2}>
                        <TextField required label="Student name" name="name" value={form.name} onChange={handleChange} />
                        <TextField required type="email" label="Email" name="email" value={form.email} onChange={handleChange} />
                        <TextField required label="Admission number" name="admissionNo" value={form.admissionNo} onChange={handleChange} />
                        <Typography color="text.secondary">
                            Placement changes affect the active academic year only. Past enrollment history is preserved.
                        </Typography>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
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
                                    <MenuItem key={grade.id} value={String(grade.id)}>{grade.grade_name}</MenuItem>
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
                                disabled={!form.gradeId || sections.length === 0}
                            >
                                {sections.map((section) => (
                                    <MenuItem key={section.id} value={String(section.id)}>{section.section_name}</MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                fullWidth
                                label="Roll number"
                                name="rollNo"
                                value={form.rollNo}
                                onChange={handleChange}
                            />
                        </Stack>
                        <Stack direction="row" justifyContent="flex-end" spacing={2}>
                            <Button onClick={() => setEditing(false)} disabled={saving}>Cancel</Button>
                            <Button type="submit" variant="contained" disabled={saving || !form.gradeId || !form.sectionId}>
                                {saving ? "Saving..." : "Save changes"}
                            </Button>
                        </Stack>
                    </Stack>
                ) : (
                    <Stack spacing={1}>
                        <Typography><strong>Email:</strong> {student.email}</Typography>
                        <Typography><strong>Admitted:</strong> {formatDate(student.admittedAt)}</Typography>
                    </Stack>
                )}
            </Paper>

            <Typography variant="h5" fontWeight={600} mb={2}>Enrollment history</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Academic year</TableCell>
                            <TableCell>Grade</TableCell>
                            <TableCell>Section</TableCell>
                            <TableCell>Roll number</TableCell>
                            <TableCell>Enrolled on</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {student.enrollments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No enrollment history found.
                                </TableCell>
                            </TableRow>
                        ) : student.enrollments.map((enrollment) => (
                            <TableRow key={enrollment.enrollmentId}>
                                <TableCell>{enrollment.academicYear}</TableCell>
                                <TableCell>{enrollment.gradeName}</TableCell>
                                <TableCell>{enrollment.sectionName}</TableCell>
                                <TableCell>{enrollment.rollNo || "-"}</TableCell>
                                <TableCell>{formatDate(enrollment.enrolledAt)}</TableCell>
                                <TableCell>{enrollment.isCurrentYear ? "Current year" : "Previous year"}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}