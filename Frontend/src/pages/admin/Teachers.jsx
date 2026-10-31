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

const initialForm = {
    name: "",
    email: "",
    temporaryPassword: "",
};

const formatDate = (date) => date ? new Date(date).toLocaleDateString() : "-";

export default function Teachers() {
    const [teachers, setTeachers] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        let cancelled = false;
        const timer = setTimeout(async () => {
            setLoading(true);
            setError("");
            try {
                const { data } = await axios.get("/org-admin/teachers", {
                    params: {
                        search: search.trim() || undefined,
                        status: status || undefined,
                    },
                });
                if (!cancelled) setTeachers(data.data || []);
            } catch (requestError) {
                if (!cancelled) {
                    setError(requestError.response?.data?.message || "Could not load teachers.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }, 200);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [search, status]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleCreate = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await axios.post("/org-admin/teachers", form);
            setForm(initialForm);
            setSuccess("Teacher account created. Share the temporary password securely; the teacher must change it at first login.");
            const { data } = await axios.get("/org-admin/teachers", {
                params: { search: search.trim() || undefined, status: status || undefined },
            });
            setTeachers(data.data || []);
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Could not create teacher account.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight={600} gutterBottom>Teachers</Typography>
            <Typography color="text.secondary" mb={3}>
                Create and manage teacher login accounts for your school.
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Paper component="form" onSubmit={handleCreate} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" mb={2}>Add teacher</Typography>
                <Stack spacing={2}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                        <TextField
                            required
                            fullWidth
                            label="Teacher name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                        />
                        <TextField
                            required
                            fullWidth
                            type="email"
                            label="Teacher email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                        />
                    </Stack>
                    <TextField
                        required
                        fullWidth
                        type="password"
                        label="Temporary password (at least 10 characters)"
                        name="temporaryPassword"
                        inputProps={{ minLength: 10 }}
                        value={form.temporaryPassword}
                        onChange={handleChange}
                        helperText="Provide it to the teacher through a secure channel. It will not be shown again."
                    />
                    <Box display="flex" justifyContent="flex-end">
                        <Button type="submit" variant="contained" disabled={saving}>
                            {saving ? "Creating..." : "Create teacher account"}
                        </Button>
                    </Box>
                </Stack>
            </Paper>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2}>
                <TextField
                    fullWidth
                    label="Search teachers by name or email"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />
                <TextField
                    select
                    fullWidth
                    label="Account status"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                >
                    <MenuItem value="">All statuses</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                </TextField>
            </Stack>

            {loading ? (
                <CircularProgress aria-label="Loading teachers" />
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>First login</TableCell>
                                <TableCell>Created</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {teachers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        No teacher accounts found.
                                    </TableCell>
                                </TableRow>
                            ) : teachers.map((teacher) => (
                                <TableRow key={teacher.id}>
                                    <TableCell>{teacher.name}</TableCell>
                                    <TableCell>{teacher.email}</TableCell>
                                    <TableCell>{teacher.isActive ? "Active" : "Inactive"}</TableCell>
                                    <TableCell>
                                        {teacher.mustChangePassword ? "Password change required" : "Complete"}
                                    </TableCell>
                                    <TableCell>{formatDate(teacher.createdAt)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}
