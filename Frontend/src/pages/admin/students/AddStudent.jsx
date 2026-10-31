import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "../../../utils/axios";

const initialForm = {
    name: "",
    email: "",
    admissionNo: "",
    temporaryPassword: "",
    gradeId: "",
    sectionId: "",
    rollNo: "",
};

export default function AddStudent() {
    const navigate = useNavigate();
    const [form, setForm] = useState(initialForm);
    const [grades, setGrades] = useState([]);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        axios.get("/org-admin/grades")
            .then(({ data }) => {
                if (cancelled) return;
                const availableGrades = data.data || [];
                setGrades(availableGrades);
                setForm((current) => ({
                    ...current,
                    gradeId: availableGrades.length ? String(availableGrades[0].id) : "",
                }));
            })
            .catch((requestError) => {
                if (!cancelled) {
                    setError(requestError.response?.data?.message || "Could not load grades.");
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!form.gradeId) return undefined;

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

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        try {
            await axios.post("/org-admin/students", form);
            navigate("/admin/students", {
                replace: true,
                state: { message: "Student admitted and enrolled successfully." },
            });
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Could not admit student.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight={600} gutterBottom>Admit student</Typography>
            <Typography color="text.secondary" mb={3}>
                Create a student account and enroll them in a grade and section for the active year.
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {!loading && grades.length === 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    Set up an active academic year and grade before admitting students.
                </Alert>
            )}
            <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
                <Stack spacing={2}>
                    <TextField required fullWidth label="Student name" name="name" value={form.name} onChange={handleChange} />
                    <TextField required fullWidth type="email" label="Student email" name="email" value={form.email} onChange={handleChange} />
                    <TextField required fullWidth label="Admission number" name="admissionNo" value={form.admissionNo} onChange={handleChange} />
                    <TextField
                        required
                        fullWidth
                        type="password"
                        label="Temporary password (at least 10 characters)"
                        name="temporaryPassword"
                        inputProps={{ minLength: 10 }}
                        value={form.temporaryPassword}
                        onChange={handleChange}
                        helperText="Give this password to the student through a secure channel. They must change it at first login."
                    />
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <TextField
                            select
                            required
                            fullWidth
                            label="Grade"
                            name="gradeId"
                            value={form.gradeId}
                            onChange={handleChange}
                            disabled={loading || grades.length === 0}
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
                        <TextField fullWidth label="Roll number (optional)" name="rollNo" value={form.rollNo} onChange={handleChange} />
                    </Stack>
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <Button onClick={() => navigate("/admin/students")} disabled={saving}>Cancel</Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={saving || loading || grades.length === 0 || sections.length === 0}
                        >
                            {saving ? "Admitting..." : "Admit student"}
                        </Button>
                    </Stack>
                </Stack>
            </Paper>
        </Box>
    );
}