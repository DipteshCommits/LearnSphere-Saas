import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
} from "@mui/material";

export default function StudentsTable({ students, loading }) {
    if (loading) return <CircularProgress aria-label="Loading students" />;

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Admission No</TableCell>
                        <TableCell>Academic Year</TableCell>
                        <TableCell>Grade</TableCell>
                        <TableCell>Section</TableCell>
                        <TableCell>Roll No</TableCell>
                        <TableCell>Status</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {students.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} align="center">
                                No students found for these filters.
                            </TableCell>
                        </TableRow>
                    ) : students.map((student) => (
                        <TableRow key={student.studentId}>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>{student.admissionNo}</TableCell>
                            <TableCell>{student.academicYear}</TableCell>
                            <TableCell>{student.gradeName || "-"}</TableCell>
                            <TableCell>{student.sectionName || "-"}</TableCell>
                            <TableCell>{student.rollNo || "-"}</TableCell>
                            <TableCell>{student.isActive ? "Active" : "Inactive"}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}