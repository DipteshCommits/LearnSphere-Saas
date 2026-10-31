import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
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

export default function StudentProfile() {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        const loadStudent = async () => {
            setLoading(true);
            setError("");
            try {
                const { data } = await axios.get(`/org-admin/students/${studentId}`);
                if (!cancelled) setStudent(data.data);
            } catch (requestError) {
                if (!cancelled) {
                    setError(requestError.response?.data?.message || "Could not load student profile.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        loadStudent();

        return () => {
            cancelled = true;
        };
    }, [studentId]);

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

            {student.mustChangePassword && (
                <Alert severity="info" sx={{ mb: 3 }}>
                    The student has not changed their temporary password yet.
                </Alert>
            )}

            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" mb={2}>Student information</Typography>
                <Stack spacing={1}>
                    <Typography><strong>Email:</strong> {student.email}</Typography>
                    <Typography><strong>Admitted:</strong> {formatDate(student.admittedAt)}</Typography>
                </Stack>
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