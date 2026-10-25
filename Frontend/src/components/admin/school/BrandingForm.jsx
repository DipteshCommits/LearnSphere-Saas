import {
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    Stack,
    Typography,
    Alert,
} from "@mui/material";
import {
    CloudUpload,
    Delete,
    Edit,
} from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import axios from "../../../utils/axios";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
    "image/png",
    "image/jpeg",
    "image/svg+xml",
];

const BrandingForm = () => {
    const inputRef = useRef(null);
    const previewUrlRef = useRef(null);

    const [logo, setLogo] = useState(null);
    const [existingLogo, setExistingLogo] = useState(null);
    const [preview, setPreview] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const [saving, setSaving] = useState(false);
    const [removing, setRemoving] = useState(false);

    useEffect(() => {
        const loadLogo = async () => {
            try {
                const { data } = await axios.get(
                    "/org-admin/school/logo"
                );

                if (data.data?.logoUrl) {
                    setExistingLogo(data.data);
                    setPreview(data.data.logoUrl);
                }
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Failed to load school logo."
                );
            }
        };

        loadLogo();
    }, []);

    useEffect(() => {
        return () => {
            if (previewUrlRef.current) {
                URL.revokeObjectURL(previewUrlRef.current);
            }
        };
    }, []);

    const validateFile = (file) => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            return "Only PNG, JPG and SVG files are allowed.";
        }

        if (file.size > MAX_FILE_SIZE) {
            return "Maximum file size is 2 MB.";
        }

        return "";
    };

    const handleFile = (file) => {
        if (!file) return;

        const validationError = validateFile(file);

        if (validationError) {
            setError(validationError);
            return;
        }

        if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
        }

        const objectUrl = URL.createObjectURL(file);

        previewUrlRef.current = objectUrl;

        setLogo(file);
        setPreview(objectUrl);
        setError("");
        setSuccess("");
    };

    const handleInputChange = (event) => {
        handleFile(event.target.files?.[0]);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();

        setDragActive(false);

        handleFile(
            event.dataTransfer.files?.[0]
        );
    };

    const handleCancel = () => {
        if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
            previewUrlRef.current = null;
        }

        setLogo(null);
        setError("");
        setSuccess("");

        if (existingLogo?.logoUrl) {
            setPreview(existingLogo.logoUrl);
        } else {
            setPreview("");
        }

        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const handleSave = async () => {
        if (!logo) return;

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const formData = new FormData();
            formData.append("logo", logo);

            const { data } = await axios.post(
                "/org-admin/school/logo",
                formData
            );

            setExistingLogo(data.data);
            setPreview(data.data.logoUrl);
            setLogo(null);

            if (previewUrlRef.current) {
                URL.revokeObjectURL(previewUrlRef.current);
                previewUrlRef.current = null;
            }

            setSuccess(
                "School logo saved successfully."
            );

            if (inputRef.current) {
                inputRef.current.value = "";
            }
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to upload school logo."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleRemove = async () => {
        try {
            setRemoving(true);
            setError("");
            setSuccess("");

            await axios.delete(
                "/org-admin/school/logo"
            );

            setExistingLogo(null);
            setLogo(null);
            setPreview("");

            if (previewUrlRef.current) {
                URL.revokeObjectURL(previewUrlRef.current);
                previewUrlRef.current = null;
            }

            if (inputRef.current) {
                inputRef.current.value = "";
            }

            setSuccess(
                "School logo removed successfully."
            );
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to remove school logo."
            );
        } finally {
            setRemoving(false);
        }
    };

    return (
        <Box
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
                Branding
            </Typography>

            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                >
                    {error}
                </Alert>
            )}

            {success && (
                <Alert
                    severity="success"
                    sx={{ mb: 2 }}
                >
                    {success}
                </Alert>
            )}

            <input
                ref={inputRef}
                hidden
                type="file"
                accept=".png,.jpg,.jpeg,.svg"
                onChange={handleInputChange}
            />

            {!preview ? (
                <Card
                    variant="outlined"
                    sx={{
                        borderStyle: "dashed",
                        borderWidth: 2,
                        borderColor: dragActive
                            ? "primary.main"
                            : "divider",
                        transition: "0.2s",
                        cursor: "pointer",
                    }}
                    onDragEnter={(event) => {
                        event.preventDefault();
                        setDragActive(true);
                    }}
                    onDragLeave={(event) => {
                        event.preventDefault();
                        setDragActive(false);
                    }}
                    onDragOver={(event) => {
                        event.preventDefault();
                        setDragActive(true);
                    }}
                    onDrop={handleDrop}
                    onClick={() =>
                        inputRef.current?.click()
                    }
                >
                    <CardContent>
                        <Stack
                            spacing={2}
                            alignItems="center"
                            py={4}
                        >
                            <CloudUpload
                                color="primary"
                                sx={{ fontSize: 50 }}
                            />

                            <Typography variant="h6">
                                Upload School Logo
                            </Typography>

                            <Typography
                                color="text.secondary"
                                align="center"
                            >
                                Drag & Drop or Click to Upload
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                PNG • JPG • SVG • Max 2 MB
                            </Typography>

                            <Button
                                variant="contained"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    inputRef.current?.click();
                                }}
                            >
                                Upload Logo
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            ) : (
                <Card variant="outlined">
                    <CardContent>
                        <Stack
                            direction={{
                                xs: "column",
                                sm: "row",
                            }}
                            spacing={3}
                            alignItems="center"
                        >
                            <Box
                                component="img"
                                src={preview}
                                alt="School Logo"
                                sx={{
                                    width: 140,
                                    height: 140,
                                    objectFit: "contain",
                                    border: "1px solid",
                                    borderColor: "divider",
                                    borderRadius: 2,
                                    p: 1,
                                }}
                            />

                            <Box flex={1}>
                                <Typography
                                    variant="h6"
                                    gutterBottom
                                >
                                    {logo
                                        ? "New Logo"
                                        : "Current Logo"}
                                </Typography>

                                <Typography color="text.secondary">
                                    {logo
                                        ? logo.name
                                        : existingLogo?.logoFileName ||
                                        "School Logo"}
                                </Typography>

                                {logo && (
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        mb={3}
                                    >
                                        {(logo.size / 1024).toFixed(1)} KB
                                    </Typography>
                                )}

                                {!logo && (
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        mb={3}
                                    >
                                        Saved logo
                                    </Typography>
                                )}

                                <Stack
                                    direction="row"
                                    spacing={2}
                                    flexWrap="wrap"
                                    useFlexGap
                                >
                                    <Button
                                        startIcon={<Edit />}
                                        variant="outlined"
                                        disabled={
                                            saving ||
                                            removing
                                        }
                                        onClick={() =>
                                            inputRef.current?.click()
                                        }
                                    >
                                        Replace
                                    </Button>

                                    {logo && (
                                        <>
                                            <Button
                                                variant="contained"
                                                disabled={
                                                    saving ||
                                                    removing
                                                }
                                                onClick={
                                                    handleSave
                                                }
                                            >
                                                {saving
                                                    ? "Saving..."
                                                    : "Save Changes"}
                                            </Button>

                                            <Button
                                                variant="text"
                                                disabled={
                                                    saving ||
                                                    removing
                                                }
                                                onClick={
                                                    handleCancel
                                                }
                                            >
                                                Cancel
                                            </Button>
                                        </>
                                    )}

                                    {!logo &&
                                        existingLogo && (
                                            <Button
                                                color="error"
                                                startIcon={
                                                    <Delete />
                                                }
                                                disabled={
                                                    saving ||
                                                    removing
                                                }
                                                onClick={
                                                    handleRemove
                                                }
                                            >
                                                {removing
                                                    ? "Removing..."
                                                    : "Remove"}
                                            </Button>
                                        )}
                                </Stack>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            )}

            <Divider sx={{ my: 5 }} />

            <Typography
                variant="h6"
                gutterBottom
            >
                School Banner
            </Typography>

            <Typography color="text.secondary">
                Coming Soon
            </Typography>
        </Box>
    );
};

export default BrandingForm;