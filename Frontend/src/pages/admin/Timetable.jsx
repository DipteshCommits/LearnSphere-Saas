import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormLabel,
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

const DAYS = [
    { value: "MON", label: "Monday" },
    { value: "TUE", label: "Tuesday" },
    { value: "WED", label: "Wednesday" },
    { value: "THU", label: "Thursday" },
    { value: "FRI", label: "Friday" },
    { value: "SAT", label: "Saturday" },
    { value: "SUN", label: "Sunday" },
];

const DEFAULT_SETTINGS = {
    schoolDays: ["MON", "TUE", "WED", "THU", "FRI"],
    schoolStartTime: "08:00",
    periodDurationMinutes: 45,
    periodsPerDay: 7,
    lunchAfterPeriod: 4,
    lunchDurationMinutes: 40,
};

const getAssignmentKey = (assignment) => `${assignment.sectionId}:${assignment.subjectId}`;

const toNumber = (value) => Number(value);

const timeAfter = (time, minutes) => {
    const [hours, mins] = time.split(":").map(Number);
    const total = hours * 60 + mins + minutes;
    return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

const createDaySlots = (settings) => {
    const slots = [];
    let startTime = settings.schoolStartTime;
    for (let periodNumber = 1; periodNumber <= settings.periodsPerDay; periodNumber += 1) {
        const endTime = timeAfter(startTime, settings.periodDurationMinutes);
        slots.push({ periodNumber, startTime, endTime });
        startTime = endTime;
        if (periodNumber === settings.lunchAfterPeriod) {
            startTime = timeAfter(startTime, settings.lunchDurationMinutes);
        }
    }
    return slots;
};

export default function Timetable() {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [generatedSettings, setGeneratedSettings] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [loads, setLoads] = useState({});
    const [entries, setEntries] = useState([]);
    const [selectedSectionId, setSelectedSectionId] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [loadError, setLoadError] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [academicYear, setAcademicYear] = useState("");

    const loadData = useCallback(async () => {
        setLoading(true);
        setLoadError("");
        try {
            const { data: timetableResponse } = await axios.get("/org-admin/timetable");
            const timetable = timetableResponse.data;
            const nextAssignments = timetable.assignments || [];
            setAssignments(nextAssignments);
            setEntries(timetable.entries || []);
            setAcademicYear(timetable.academicYear || "");

            if (timetable.settings) {
                const loadedSettings = {
                    ...timetable.settings,
                    schoolDays: Array.isArray(timetable.settings.schoolDays)
                        ? timetable.settings.schoolDays
                        : DEFAULT_SETTINGS.schoolDays,
                };
                setSettings(loadedSettings);
                setGeneratedSettings(loadedSettings);
            } else {
                setGeneratedSettings(null);
            }

            const savedLoads = new Map(
                (timetable.loads || []).map((load) => [
                    `${load.sectionId}:${load.subjectId}`,
                    String(load.periodsPerWeek),
                ])
            );
            setLoads(Object.fromEntries(nextAssignments.map((assignment) => [
                getAssignmentKey(assignment),
                savedLoads.get(getAssignmentKey(assignment)) || "",
            ])));
            setSelectedSectionId((current) => (
                nextAssignments.some((assignment) => String(assignment.sectionId) === current)
                    ? current
                    : String(nextAssignments[0]?.sectionId || "")
            ));
            setDirty(false);
        } catch (requestError) {
            setLoadError(requestError.response?.data?.message || "Could not load timetable setup.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const sections = useMemo(() => {
        const uniqueSections = new Map();
        assignments.forEach((assignment) => {
            uniqueSections.set(String(assignment.sectionId), {
                id: String(assignment.sectionId),
                gradeName: assignment.gradeName,
                sectionName: assignment.sectionName,
            });
        });
        return [...uniqueSections.values()].sort((left, right) => (
            left.gradeName.localeCompare(right.gradeName)
            || left.sectionName.localeCompare(right.sectionName)
        ));
    }, [assignments]);

    const selectedEntries = useMemo(() => {
        const entryMap = new Map();
        entries
            .filter((entry) => String(entry.sectionId) === selectedSectionId)
            .forEach((entry) => entryMap.set(`${entry.weekday}:${entry.periodNumber}`, entry));
        return entryMap;
    }, [entries, selectedSectionId]);

    const displaySettings = generatedSettings || settings;
    const daySlots = useMemo(() => createDaySlots(displaySettings), [displaySettings]);

    const updateSettings = (name, value) => {
        setSettings((current) => ({ ...current, [name]: value }));
        setDirty(true);
        setSuccess("");
    };

    const updateLoad = (assignment, value) => {
        setLoads((current) => ({ ...current, [getAssignmentKey(assignment)]: value }));
        setDirty(true);
        setSuccess("");
    };

    const handleGenerate = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            const weeklyLoads = assignments.map((assignment) => ({
                sectionId: assignment.sectionId,
                subjectId: assignment.subjectId,
                periodsPerWeek: toNumber(loads[getAssignmentKey(assignment)]),
            }));
            const { data } = await axios.post("/org-admin/timetable/generate", {
                settings,
                loads: weeklyLoads,
            });
            setDirty(false);
            setSuccess(`Generated ${data.data.generatedPeriods} weekly class periods with no teacher or section overlaps.`);
            await loadData();
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Could not generate timetable.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <CircularProgress aria-label="Loading timetable" />;
    }

    return (
        <Box>
            <Typography variant="h4" fontWeight={600} gutterBottom>Timetable</Typography>
            <Typography color="text.secondary" mb={3}>
                Generate a weekly timetable from teacher assignments and required subject periods.
                {academicYear ? ` Academic year: ${academicYear}.` : ""}
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
            {dirty && entries.length > 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    Your settings have changed. The displayed timetable is the last generated version until you generate again.
                </Alert>
            )}

            {!loadError && !assignments.length ? (
                <Alert severity="info">
                    Assign teachers to subjects and sections before generating a timetable.
                </Alert>
            ) : !loadError && (
                <>
                    <Paper component="form" onSubmit={handleGenerate} sx={{ p: 3, mb: 4 }}>
                        <Stack spacing={3}>
                            <Typography variant="h6">School schedule</Typography>
                            <FormControl component="fieldset">
                                <FormLabel component="legend">School days</FormLabel>
                                <FormGroup row>
                                    {DAYS.map((day) => (
                                        <FormControlLabel
                                            key={day.value}
                                            label={day.label}
                                            control={(
                                                <Checkbox
                                                    checked={settings.schoolDays.includes(day.value)}
                                                    onChange={(event) => updateSettings(
                                                        "schoolDays",
                                                        event.target.checked
                                                            ? [...settings.schoolDays, day.value]
                                                            : settings.schoolDays.filter((value) => value !== day.value)
                                                    )}
                                                />
                                            )}
                                        />
                                    ))}
                                </FormGroup>
                            </FormControl>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                <TextField
                                    required
                                    type="time"
                                    label="School start time"
                                    value={settings.schoolStartTime}
                                    onChange={(event) => updateSettings("schoolStartTime", event.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ step: 300 }}
                                    fullWidth
                                />
                                <TextField
                                    required
                                    type="number"
                                    label="Class periods per day"
                                    value={settings.periodsPerDay}
                                    onChange={(event) => updateSettings("periodsPerDay", event.target.value)}
                                    inputProps={{ min: 2, max: 12 }}
                                    fullWidth
                                />
                                <TextField
                                    required
                                    type="number"
                                    label="Period length (minutes)"
                                    value={settings.periodDurationMinutes}
                                    onChange={(event) => updateSettings("periodDurationMinutes", event.target.value)}
                                    inputProps={{ min: 30, max: 90 }}
                                    fullWidth
                                />
                            </Stack>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                <TextField
                                    select
                                    required
                                    label="Lunch after period"
                                    value={settings.lunchAfterPeriod}
                                    onChange={(event) => updateSettings("lunchAfterPeriod", event.target.value)}
                                    fullWidth
                                >
                                    {Array.from(
                                        { length: Math.max(0, Number(settings.periodsPerDay) - 1) },
                                        (_, index) => index + 1
                                    ).map((period) => (
                                        <MenuItem key={period} value={period}>
                                            Period {period}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    select
                                    required
                                    label="Lunch duration"
                                    value={settings.lunchDurationMinutes}
                                    onChange={(event) => updateSettings("lunchDurationMinutes", event.target.value)}
                                    helperText="Lunch must be between 30 and 45 minutes."
                                    fullWidth
                                >
                                    {[30, 35, 40, 45].map((minutes) => (
                                        <MenuItem key={minutes} value={minutes}>{minutes} minutes</MenuItem>
                                    ))}
                                </TextField>
                            </Stack>

                            <Typography variant="h6">Required periods per week</Typography>
                            <Typography color="text.secondary">
                                Set how many weekly periods each assigned subject needs for its section.
                            </Typography>
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Grade / section</TableCell>
                                            <TableCell>Subject</TableCell>
                                            <TableCell>Teacher</TableCell>
                                            <TableCell>Periods per week</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {assignments.map((assignment) => (
                                            <TableRow key={getAssignmentKey(assignment)}>
                                                <TableCell>{assignment.gradeName} / {assignment.sectionName}</TableCell>
                                                <TableCell>{assignment.subjectName}</TableCell>
                                                <TableCell>{assignment.teacherName}</TableCell>
                                                <TableCell>
                                                    <TextField
                                                        required
                                                        type="number"
                                                        size="small"
                                                        value={loads[getAssignmentKey(assignment)] || ""}
                                                        onChange={(event) => updateLoad(assignment, event.target.value)}
                                                        inputProps={{ min: 1, max: 60, "aria-label": `Periods per week for ${assignment.subjectName}, ${assignment.gradeName} ${assignment.sectionName}` }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Box display="flex" justifyContent="flex-end">
                                <Button type="submit" variant="contained" disabled={saving}>
                                    {saving ? "Generating..." : "Generate timetable"}
                                </Button>
                            </Box>
                        </Stack>
                    </Paper>

                    {entries.length > 0 && (
                        <Box>
                            <Typography variant="h5" fontWeight={600} mb={2}>Generated timetable</Typography>
                            <TextField
                                select
                                label="Section"
                                value={selectedSectionId}
                                onChange={(event) => setSelectedSectionId(event.target.value)}
                                sx={{ mb: 2, minWidth: 280 }}
                            >
                                {sections.map((section) => (
                                    <MenuItem key={section.id} value={section.id}>
                                        {section.gradeName} / {section.sectionName}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Period</TableCell>
                                            {displaySettings.schoolDays.map((day) => (
                                                <TableCell key={day}>{DAYS.find((item) => item.value === day)?.label || day}</TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {daySlots.map((slot) => (
                                            <Fragment key={slot.periodNumber}>
                                                <TableRow>
                                                    <TableCell>
                                                        <strong>Period {slot.periodNumber}</strong>
                                                        <br />
                                                        {slot.startTime}–{slot.endTime}
                                                    </TableCell>
                                                    {displaySettings.schoolDays.map((day) => {
                                                        const entry = selectedEntries.get(`${day}:${slot.periodNumber}`);
                                                        return (
                                                            <TableCell key={`${day}:${slot.periodNumber}`}>
                                                                {entry ? (
                                                                    <>
                                                                        <strong>{entry.subjectName}</strong>
                                                                        <br />
                                                                        {entry.teacherName}
                                                                    </>
                                                                ) : "-"}
                                                            </TableCell>
                                                        );
                                                    })}
                                                </TableRow>
                                                {slot.periodNumber === Number(settings.lunchAfterPeriod) && (
                                                    <TableRow>
                                                        <TableCell colSpan={displaySettings.schoolDays.length + 1} align="center">
                                                            Lunch break: {displaySettings.lunchDurationMinutes} minutes
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </Fragment>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
}
