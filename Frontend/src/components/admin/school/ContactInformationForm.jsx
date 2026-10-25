import {
    Box,
    Grid,
    TextField,
    MenuItem,
    Typography,
    Button,
} from "@mui/material";
import axios from "../../../utils/axios";
import { useEffect, useState } from "react";

export default function ContactInformationForm() {
    const [formData, setFormData] = useState({
        email: "",
        phone: "",
        altPhone: "",
        supportEmail: "",
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await axios.get("/org-admin/school/contact-information");

                console.log("Fetched data:", data.data);
                setFormData(data.data);
                console.log("Form data set:", formData);
            } catch (error) {
                console.error("Error fetching contact information:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleChange = ({ target: { name, value } }) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }


    const handleSubmit = (e) => {
        e.preventDefault();

        const payload = {
            ...formData,
            email: formData.email.trim(),
            phoneNumber: formData.phone.trim(),
            alternatePhoneNumber: formData.altPhone.trim(),
            supportEmail: formData.supportEmail.trim(),
        }

        axios.patch("/org-admin/school/contact-information", payload)
            .then((response) => {
                console.log("Contact information updated:", response.data);
            })
            .catch((error) => {
                console.error("Error updating contact information:", error);
            });
    }

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
                Contact Information
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Phone Number"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Alternative Phone Number"
                        name="altPhone"
                        type="tel"
                        value={formData.altPhone}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Support Email"
                        name="supportEmail"
                        type="email"
                        value={formData.supportEmail}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Button variant="contained" color="primary" onClick={handleSubmit}>
                        Submit
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
}