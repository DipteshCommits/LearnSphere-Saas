import { useEffect, useState } from "react";
import axios from "../../../utils/axios";
import {
    Alert,
    Button,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import StudentsTable from '../../../components/admin/students/StudentsTable';
import StudentSearchBar from '../../../components/admin/students/StudentSearchBar';
import { useLocation, useNavigate } from "react-router-dom";

export default function StudentsList() {
    const [students, setStudents] = useState([]);
    const [grades, setGrades] = useState([]);
    const [sections, setSections] = useState([]);
    const [search, setSearch] = useState("");
    const [gradeId, setGradeId] = useState("");
    const [sectionId, setSectionId] = useState("");
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const { data } = await axios.get("/org-admin/grades");
                setGrades(data.data || []);
            } catch (requestError) {
                setError(requestError.response?.data?.message || "Could not load grade filters.");
            }
        };
        fetchGrades();
    }, []);

    useEffect(() => {
        let cancelled = false;
        const timer = setTimeout(async () => {
            setLoading(true);
            setError("");

            try {
                const { data } = await axios.get("/org-admin/students", {
                    params: {
                        search: search.trim() || undefined,
                        gradeId: gradeId || undefined,
                        sectionId: sectionId || undefined,
                        status: status || undefined,
                    },
                });
                if (!cancelled) setStudents(data.data || []);
            } catch (requestError) {
                if (!cancelled) {
                    setStudents([]);
                    setError(requestError.response?.data?.message || "Could not load students.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }, 250);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [search, gradeId, sectionId, status]);

    useEffect(() => {
        if (!gradeId) return undefined;

        let cancelled = false;
        axios.get("/org-admin/sections", { params: { gradeId } })
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
    }, [gradeId]);

    return (
        <>
            <Typography variant="h4" gutterBottom>
                Students
            </Typography>
            {location.state?.message && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {location.state.message}
                </Alert>
            )}

            <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
                <StudentSearchBar onSearch={setSearch} />
                <TextField
                    select
                    fullWidth
                    label="Grade"
                    value={gradeId}
                    onChange={(event) => {
                        setGradeId(event.target.value);
                        setSectionId("");
                        setSections([]);
                    }}
                >
                    <MenuItem value="">All grades</MenuItem>
                    {grades.map((grade) => (
                        <MenuItem key={grade.id} value={String(grade.id)}>
                            {grade.grade_name}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    select
                    fullWidth
                    label="Section"
                    value={sectionId}
                    disabled={!gradeId}
                    onChange={(event) => setSectionId(event.target.value)}
                >
                    <MenuItem value="">All sections</MenuItem>
                    {sections.map((section) => (
                        <MenuItem key={section.id} value={String(section.id)}>
                            {section.section_name}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    select
                    fullWidth
                    label="Status"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                >
                    <MenuItem value="">All statuses</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                </TextField>
            </Stack>

            <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
                <Button variant="contained" onClick={() => navigate("/admin/admissions")}>
                    Admit student
                </Button>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <StudentsTable students={students} loading={loading} />
        </>
    );


}