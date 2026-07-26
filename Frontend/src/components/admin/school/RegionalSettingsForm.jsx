import {
    Box,
    Button,
    Grid,
    MenuItem,
    TextField,
    Typography,
} from "@mui/material";
import { useState } from "react";

const TIMEZONES = [
    "Asia/Kolkata",
    "Asia/Dubai",
    "Asia/Singapore",
    "Europe/London",
    "America/New_York",
    "America/Los_Angeles",
    "Australia/Sydney",
];

const CURRENCIES = [
    {
        code: "INR",
        label: "Indian Rupee (₹)",
    },
    {
        code: "USD",
        label: "US Dollar ($)",
    },
    {
        code: "EUR",
        label: "Euro (€)",
    },
    {
        code: "GBP",
        label: "British Pound (£)",
    },
    {
        code: "AED",
        label: "UAE Dirham (AED)",
    },
];

const DATE_FORMATS = [
    "DD/MM/YYYY",
    "MM/DD/YYYY",
    "YYYY-MM-DD",
    "DD-MMM-YYYY",
];

const LANGUAGES = [
    "English",
    "Hindi",
    "Bengali",
    "Tamil",
    "Telugu",
    "Marathi",
];

const initialState = {
    timezone: "Asia/Kolkata",
    currency: "INR",
    dateFormat: "DD/MM/YYYY",
    language: "English",
};

export default function RegionalSettingsForm() {
    const [formData, setFormData] = useState(initialState);

    const handleChange = ({ target: { name, value } }) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log(formData);
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                p: 4,
                bgcolor: "background.paper",
                borderRadius: 2,
            }}
        >
            <Typography
                variant="h5"
                fontWeight={600}
                mb={3}
            >
                Regional Settings
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <TextField
                        select
                        fullWidth
                        label="Timezone"
                        name="timezone"
                        value={formData.timezone}
                        onChange={handleChange}
                    >
                        {TIMEZONES.map((timezone) => (
                            <MenuItem
                                key={timezone}
                                value={timezone}
                            >
                                {timezone}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        select
                        fullWidth
                        label="Currency"
                        name="currency"
                        value={formData.currency}
                        onChange={handleChange}
                    >
                        {CURRENCIES.map((currency) => (
                            <MenuItem
                                key={currency.code}
                                value={currency.code}
                            >
                                {currency.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        select
                        fullWidth
                        label="Date Format"
                        name="dateFormat"
                        value={formData.dateFormat}
                        onChange={handleChange}
                    >
                        {DATE_FORMATS.map((format) => (
                            <MenuItem
                                key={format}
                                value={format}
                            >
                                {format}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        select
                        fullWidth
                        label="Language"
                        name="language"
                        value={formData.language}
                        onChange={handleChange}
                    >
                        {LANGUAGES.map((language) => (
                            <MenuItem
                                key={language}
                                value={language}
                            >
                                {language}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
            </Grid>

            <Box
                mt={4}
                display="flex"
                justifyContent="flex-end"
            >
                <Button
                    type="submit"
                    variant="contained"
                    size="large"
                >
                    Save & Continue
                </Button>
            </Box>
        </Box>
    );
}