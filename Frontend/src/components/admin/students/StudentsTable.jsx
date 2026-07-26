import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress
} from "@mui/material";

export default function StudentsTable({ students, loading }) {
    if (loading) return <CircularProgress />;

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Admission No</TableCell>
                        <TableCell>Grade</TableCell>
                        <TableCell>Section</TableCell>
                        <TableCell>Roll No</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {students.map((s) => (
                        <TableRow>
                            <TableCell>{s.name}</TableCell>
                            <TableCell>{s.admissionNo}</TableCell>
                            <TableCell>{s.gradeName || "-"}</TableCell>
                            <TableCell>{s.sectionName || "-"}</TableCell>
                            <TableCell>{s.rollNo || "-"}</TableCell>
                        </TableRow>

                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}