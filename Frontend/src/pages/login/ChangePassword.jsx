import { useState } from "react";
import {
    Alert,
    Box,
    Button,
    Paper,
    TextField,
    Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axios";
import { useAuth } from "../../context/AuthContext";

export default function ChangePassword() {
    const { user, updateUser, updateToken } = useAuth();
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("New password and confirmation do not match.");
            return;
        }

        setSaving(true);
        try {
            const { data } = await axios.post("/auth/change-password", {
                currentPassword,
                newPassword,
            });
            updateToken(data.data.token);
            updateUser({ ...user, mustChangePassword: false });
            navigate(user.role === "ORG_ADMIN" ? "/admin" : "/", { replace: true });
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Could not change password.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box display="flex" justifyContent="center" mt={10} px={2}>
            <Paper component="form" onSubmit={handleSubmit} sx={{ p: 4, width: 440, maxWidth: "100%" }}>
                <Typography variant="h5" mb={1}>Set a new password</Typography>
                <Typography color="text.secondary" mb={2}>
                    For account security, change the temporary password before continuing.
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <TextField
                    fullWidth
                    required
                    type="password"
                    label="Temporary password"
                    margin="normal"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                />
                <TextField
                    fullWidth
                    required
                    type="password"
                    label="New password (at least 10 characters)"
                    margin="normal"
                    inputProps={{ minLength: 10 }}
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                />
                <TextField
                    fullWidth
                    required
                    type="password"
                    label="Confirm new password"
                    margin="normal"
                    inputProps={{ minLength: 10 }}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                />
                <Button fullWidth type="submit" variant="contained" sx={{ mt: 3 }} disabled={saving}>
                    {saving ? "Updating..." : "Change password"}
                </Button>
            </Paper>
        </Box>
    );
}
