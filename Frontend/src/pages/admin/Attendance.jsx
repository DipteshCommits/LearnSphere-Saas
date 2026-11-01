import { useCallback, useEffect, useMemo, useState } from "react";
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
    TextField,
    Typography,
} from "@mui/material";
import axios from "../../utils/axios";

const getLocalDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

const STATUS_OPTIONS = [
    { value: "PRESENT", label: "Present" },
    { value: "ABSENT", label: "Absent" },
    { value: "LATE", label: "Late" },
];

export default function Attendance() {
    const [grades, setGrades] = useState([]);
    const [sections, setSections] = useState([]);
    const [students, setStudents] = useState([]);
    const [gradeId, setGradeId] = useState("");
    const [sectionId, setSectionId] = useState("");
    const [attendanceDate, setAttendanceDate] = useState(getLocalDate);
    const [attendanceMode, setAttendanceMode] = useState("DAILY");
    const [attendanceModeDraft, setAttendanceModeDraft] = useState("DAILY");
    const [periods, setPeriods] = useState([]);
    const [timetableEntryId, setTimetableEntryId] = useState("");
    const [statuses, setStatuses] = useState({});
    const [loadingSetup, setLoadingSetup] = useState(true);
    const [loadingSettings, setLoadingSettings] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingRoster, setLoadingRoster] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);
    const [sectionReload, setSectionReload] = useState(0);
    const [rosterReload, setRosterReload] = useState(0);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState("");
    const [settingsError, setSettingsError] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadGrades = useCallback(async () => {
        setLoadingSetup(true);
        setLoadError("");
        try {
            const { data } = await axios.get("/org-admin/grades");
            setGrades(data.data || []);
        } catch (requestError) {
            setLoadError(requestError.response?.data?.message || "Could not load grades.");
        } finally {
            setLoadingSetup(false);
        }
    }, []);

    useEffect(() => {
        loadGrades();
    }, [loadGrades]);

    useEffect(() => {
        let cancelled = false;
        if (!sectionId || !attendanceDate) {
            setStudents([]);
            setStatuses({});
            return undefined;
        }

        setLoadingRoster(true);
        setLoadError("");
        setError("");
        const params = { sectionId, date: attendanceDate };
        if (timetableEntryId) params.timetableEntryId = timetableEntryId;
        axios.get("/org-admin/attendance", {
            params,
        })
            .then(({ data }) => {
                if (cancelled) return;
                setAttendanceMode(data.data.attendanceMode);
                setPeriods(data.data.periods || []);
                const roster = data.data.students || [];
                setStudents(roster);
                setStatuses(Object.fromEntries(roster.map((student) => [
                    String(student.studentId),
                    student.attendanceStatus || "",
                ])));
            })
            .catch((requestError) => {
                if (cancelled) return;
                setStudents([]);
                setStatuses({});
                setPeriods([]);
                setLoadError(requestError.response?.data?.message || "Could not load attendance roster.");
            })
            .finally(() => {
                if (!cancelled) setLoadingRoster(false);
            });
        return () => {
            cancelled = true;
        };
    }, [sectionId, attendanceDate, timetableEntryId, rosterReload]);

    useEffect(() => {
        if (!gradeId) return undefined;
        let cancelled = false;
        setLoadingSettings(true);
        setSettingsError("");
        axios.get("/org-admin/attendance/settings", { params: { gradeId } })
            .then(({ data }) => {
                if (cancelled) return;
                const mode = data.data.attendanceMode || "DAILY";
                setAttendanceMode(mode);
                setAttendanceModeDraft(mode);
                setTimetableEntryId("");
            })
            .catch((requestError) => {
                if (!cancelled) {
                    setSettingsError(requestError.response?.data?.message
                        || "Could not load attendance settings.");
                }
            })
            .finally(() => {
                if (!cancelled) setLoadingSettings(false);
            });
        return () => {
            cancelled = true;
        };
    }, [gradeId]);

    useEffect(() => {
        if (!gradeId) {
            setSections([]);
            setSectionId("");
            return undefined;
        }

        let cancelled = false;
        setLoadingSections(true);
        setSectionId("");
        setTimetableEntryId("");
        setStudents([]);
        setStatuses({});
        axios.get("/org-admin/sections", { params: { gradeId } })
            .then(({ data }) => {
                if (!cancelled) setSections(data.data || []);
            })
            .catch((requestError) => {
                if (!cancelled) {
                    setLoadError(requestError.response?.data?.message || "Could not load sections.");
                }
            })
            .finally(() => {
                if (!cancelled) setLoadingSections(false);
            });
        return () => {
            cancelled = true;
        };
    }, [gradeId, sectionReload]);

    const summary = useMemo(() => students.reduce((counts, student) => {
        const status = statuses[String(student.studentId)];
        if (status === "PRESENT") counts.present += 1;
        else if (status === "ABSENT") counts.absent += 1;
        else if (status === "LATE") counts.late += 1;
        else counts.unmarked += 1;
        return counts;
    }, { present: 0, absent: 0, late: 0, unmarked: 0 }), [students, statuses]);

    const handleStatusChange = (studentId, value) => {
        setStatuses((current) => ({ ...current, [String(studentId)]: value }));
        setSuccess("");
    };

    const handleMarkAllPresent = () => {
        setStatuses(Object.fromEntries(students.map((student) => [
            String(student.studentId),
            "PRESENT",
        ])));
        setSuccess("");
    };

    const handleSave = async () => {
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            const records = students.map((student) => ({
                studentId: student.studentId,
                status: statuses[String(student.studentId)],
            }));
            await axios.put("/org-admin/attendance", {
                sectionId,
                date: attendanceDate,
                ...(attendanceMode === "SUBJECT" ? { timetableEntryId } : {}),
                records,
            });
            setSuccess("Attendance saved. You can edit and save again to correct it.");
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Could not save attendance.");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveMode = async (applyToAllGrades) => {
        setSavingSettings(true);
        setSettingsError("");
        setSuccess("");
        try {
            await axios.put("/org-admin/attendance/settings", {
                gradeId: applyToAllGrades ? undefined : gradeId,
                attendanceMode: attendanceModeDraft,
                applyToAllGrades,
            });
            setAttendanceMode(attendanceModeDraft);
            setTimetableEntryId("");
            setSuccess(applyToAllGrades
                ? "Attendance mode applied to all grades."
                : "Attendance mode saved for this grade.");
            setRosterReload((current) => current + 1);
        } catch (requestError) {
            setSettingsError(requestError.response?.data?.message
                || "Could not save attendance settings.");
        } finally {
            setSavingSettings(false);
        }
    };

    const allMarked = students.length > 0 && summary.unmarked === 0;

    if (loadingSetup) {
        return <CircularProgress aria-label="Loading attendance setup" />;
    }

    return (
        <Box>
            <Typography variant="h4" fontWeight={600} gutterBottom>Attendance</Typography>
            <Typography color="text.secondary" mb={3}>
                Configure attendance by grade, then record daily or scheduled subject-period attendance.
            </Typography>
            {loadError && (
                <Alert
                    severity="error"
                    action={(
                        <Button color="inherit" size="small" onClick={sectionId
                            ? () => setRosterReload((current) => current + 1)
                            : gradeId
                                ? () => setSectionReload((current) => current + 1)
                                : loadGrades}>
                            Retry
                        </Button>
                    )}
                    sx={{ mb: 2 }}
                >
                    {loadError}
                </Alert>
            )}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {!grades.length ? (
                <Alert severity="info">
                    Create an active academic year with grades and sections before taking attendance.
                </Alert>
            ) : (
                <>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                            <TextField
                                select
                                required
                                fullWidth
                                label="Grade"
                                value={gradeId}
                                onChange={(event) => {
                                    setGradeId(event.target.value);
                                    setLoadError("");
                                }}
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
                                value={sectionId}
                                onChange={(event) => {
                                    setSectionId(event.target.value);
                                    setTimetableEntryId("");
                                    setLoadError("");
                                }}
                                disabled={!gradeId || loadingSections || !sections.length}
                            >
                                {sections.map((section) => (
                                    <MenuItem key={section.id} value={String(section.id)}>
                                        {section.section_name}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                required
                                type="date"
                                fullWidth
                                label="Attendance date"
                                value={attendanceDate}
                                onChange={(event) => {
                                    setAttendanceDate(event.target.value);
                                    setTimetableEntryId("");
                                }}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Stack>
                    </Paper>

                    {gradeId && (
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" mb={1}>Attendance mode for this grade</Typography>
                            <Typography color="text.secondary" mb={2}>
                                Choose once per day or once for each scheduled subject period. You can apply the
                                same mode to every grade or configure grades individually.
                            </Typography>
                            {settingsError && (
                                <Alert severity="error" sx={{ mb: 2 }}>{settingsError}</Alert>
                            )}
                            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Attendance mode"
                                    value={attendanceModeDraft}
                                    onChange={(event) => setAttendanceModeDraft(event.target.value)}
                                    disabled={loadingSettings || savingSettings}
                                >
                                    <MenuItem value="DAILY">Daily attendance</MenuItem>
                                    <MenuItem value="SUBJECT">Subject / period-wise attendance</MenuItem>
                                </TextField>
                                <Button
                                    variant="contained"
                                    onClick={() => handleSaveMode(false)}
                                    disabled={loadingSettings || savingSettings}
                                >
                                    Save for this grade
                                </Button>
                                <Button
                                    onClick={() => handleSaveMode(true)}
                                    disabled={loadingSettings || savingSettings}
                                >
                                    Apply to all grades
                                </Button>
                            </Stack>
                        </Paper>
                    )}

                    {sectionId && attendanceMode === "SUBJECT" && (
                        <Paper sx={{ p: 3, mb: 3 }}>
                            {periods.length ? (
                                <TextField
                                    select
                                    required
                                    fullWidth
                                    label="Scheduled subject period"
                                    value={timetableEntryId}
                                    onChange={(event) => setTimetableEntryId(event.target.value)}
                                    disabled={loadingRoster}
                                >
                                    {periods.map((period) => (
                                        <MenuItem
                                            key={period.timetableEntryId}
                                            value={String(period.timetableEntryId)}
                                        >
                                            Period {period.periodNumber}: {period.subjectName}
                                            {" "}({period.startTime}-{period.endTime})
                                        </MenuItem>
                                    ))}
                                </TextField>
                            ) : loadingRoster ? (
                                <CircularProgress aria-label="Loading scheduled periods" />
                            ) : (
                                <Alert severity="info">
                                    No timetable periods are scheduled for this section on this date.
                                    Generate or update the timetable before taking subject-wise attendance.
                                </Alert>
                            )}
                        </Paper>
                    )}

                    {sectionId && (attendanceMode === "DAILY" || timetableEntryId) && (
                        <>
                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                justifyContent="space-between"
                                alignItems={{ xs: "flex-start", sm: "center" }}
                                spacing={2}
                                mb={2}
                            >
                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                    <Chip label={`Present ${summary.present}`} color="success" />
                                    <Chip label={`Absent ${summary.absent}`} color="error" />
                                    <Chip label={`Late ${summary.late}`} color="warning" />
                                    <Chip label={`Unmarked ${summary.unmarked}`} />
                                </Stack>
                                <Stack direction="row" spacing={1}>
                                    <Button
                                        onClick={handleMarkAllPresent}
                                        disabled={loadingRoster || saving || !students.length}
                                    >
                                        Mark all present
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleSave}
                                        disabled={loadingRoster || saving || !allMarked
                                            || (attendanceMode === "SUBJECT" && !timetableEntryId)}
                                    >
                                        {saving ? "Saving..." : "Save attendance"}
                                    </Button>
                                </Stack>
                            </Stack>

                            {loadingRoster ? (
                                <CircularProgress aria-label="Loading student attendance" />
                            ) : (
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Roll number</TableCell>
                                                <TableCell>Student</TableCell>
                                                <TableCell>Attendance</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {!students.length ? (
                                                <TableRow>
                                                    <TableCell colSpan={3} align="center">
                                                        No active students are enrolled in this section.
                                                    </TableCell>
                                                </TableRow>
                                            ) : students.map((student) => (
                                                <TableRow key={student.studentId}>
                                                    <TableCell>{student.rollNo || "-"}</TableCell>
                                                    <TableCell>{student.name}</TableCell>
                                                    <TableCell>
                                                        <TextField
                                                            select
                                                            size="small"
                                                            label="Status"
                                                            value={statuses[String(student.studentId)] || ""}
                                                            onChange={(event) => handleStatusChange(
                                                                student.studentId,
                                                                event.target.value
                                                            )}
                                                            sx={{ minWidth: 150 }}
                                                        >
                                                            <MenuItem value="">Unmarked</MenuItem>
                                                            {STATUS_OPTIONS.map((status) => (
                                                                <MenuItem key={status.value} value={status.value}>
                                                                    {status.label}
                                                                </MenuItem>
                                                            ))}
                                                        </TextField>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </>
                    )}
                </>
            )}
        </Box>
    );
}
