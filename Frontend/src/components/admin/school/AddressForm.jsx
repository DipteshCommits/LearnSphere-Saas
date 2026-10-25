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

export default function AddressForm() {
    const [formData, setFormData] = useState({
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await axios.get("/org-admin/school/address-information");
                console.log("Fetched data:", data.data);
                setFormData(data.data);
                console.log("Form data set:", formData);
            } catch (error) {
                console.error("Error fetching address information:", error);
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
            addressLine1: formData.addressLine1.trim(),
            addressLine2: formData.addressLine2.trim(),
            city: formData.city.trim(),
            state: formData.state.trim(),
            country: formData.country.trim(),
            postalCode: formData.postalCode.trim(),
        }

        axios.patch("/org-admin/school/address-information", payload)
            .then((response) => {
                console.log("Address information updated:", response.data);
            })
            .catch((error) => {
                console.error("Error updating address information:", error);
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
                Address
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        label="Address Line 1"
                        name="addressLine1"
                        value={formData.addressLine1}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Address Line 2"
                        name="addressLine2"
                        value={formData.addressLine2}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="City"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="State"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Postal Code"
                        name="postalCode"
                        value={formData.postalCode}
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