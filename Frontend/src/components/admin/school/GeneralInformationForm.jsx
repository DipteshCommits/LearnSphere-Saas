import {
    Box,
    Grid,
    TextField,
    MenuItem,
    Typography,
    Button,
} from "@mui/material";
import { useMemo, useState } from "react";

const schoolTypes = [
    "Government",
    "Private",
    "Public",
    "International",
    "CBSE",
    "ICSE",
    "State Board",
    "IB",
    "Other",
];

const currentYear = new Date().getFullYear();

const initialState = {
    schoolName: "",
    schoolCode: "",
    schoolType: "",
    otherSchoolType: "",
    establishedYear: "",
    registrationNumber: "",
    website: "",
};

export default function GeneralInformationForm() {
    const [formData, setFormData] = useState(initialState);

    const handleChange = ({ target: { name, value } }) => {
        setFormData((prev) => {
            const updated = {
                ...prev,
                [name]: value,
            };

            // Reset custom type if user changes away from Other
            if (name === "schoolType" && value !== "Other") {
                updated.otherSchoolType = "";
            }

            return updated;
        });
    };

    const isOtherSelected = useMemo(
        () => formData.schoolType === "Other",
        [formData.schoolType]
    );

    const handleSubmit = (e) => {
        e.preventDefault();

        const payload = {
            ...formData,
            schoolName: formData.schoolName.trim(),
            schoolCode: formData.schoolCode.trim(),
            registrationNumber: formData.registrationNumber.trim(),
            website: formData.website.trim(),
            schoolType:
                formData.schoolType === "Other"
                    ? formData.otherSchoolType.trim()
                    : formData.schoolType,
        };

        console.log(payload);
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
                p: 4,
                bgcolor: "background.paper",
                borderRadius: 2,
            }}
        >
            <Typography variant="h5" fontWeight={600} mb={3}>
                General Information
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        required
                        label="School Name"
                        name="schoolName"
                        value={formData.schoolName}
                        onChange={handleChange}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        required
                        label="School Code"
                        name="schoolCode"
                        value={formData.schoolCode}
                        onChange={handleChange}
                    />
                </Grid>

                {/* Dropdown */}
                <TextField
                    select
                    fullWidth
                    required
                    label="School Type"
                    name="schoolType"
                    value={formData.schoolType}
                    onChange={handleChange}
                >
                    <MenuItem value="" disabled>
                        Select...
                    </MenuItem>

                    {schoolTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                            {type}
                        </MenuItem>
                    ))}
                </TextField>

                {/* Conditional Input */}
                {isOtherSelected && (
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            required
                            label="Specify School Type"
                            name="otherSchoolType"
                            value={formData.otherSchoolType}
                            onChange={handleChange}
                            helperText="Enter the school category"
                        />
                    </Grid>
                )}

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        type="number"
                        label="Established Year"
                        name="establishedYear"
                        value={formData.establishedYear}
                        onChange={handleChange}
                        inputProps={{
                            min: 1800,
                            max: currentYear,
                        }}
                        helperText={`Between 1800 - ${currentYear}`}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Registration Number"
                        name="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={handleChange}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        type="url"
                        label="Website"
                        name="website"
                        placeholder="https://example.com"
                        value={formData.website}
                        onChange={handleChange}
                    />
                </Grid>
            </Grid>

            <Box
                mt={4}
                display="flex"
                justifyContent="flex-end"
            >
                <Button
                    variant="contained"
                    type="submit"
                    size="large"
                >
                    Save & Continue
                </Button>
            </Box>
        </Box>
    );
}