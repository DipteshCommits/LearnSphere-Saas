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
import { CloudUpload, Delete, Edit } from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";

const MAX_FILE_SIZE = 2 * 1024 * 1024;

const ALLOWED_TYPES = [
    "image/png",
    "image/jpeg",
    "image/svg+xml",
];

export default function BrandingForm() {
    const inputRef = useRef(null);

    const [logo, setLogo] = useState(null);
    const [preview, setPreview] = useState("");
    const [error, setError] = useState("");
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

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

        if (preview) {
            URL.revokeObjectURL(preview);
        }

        setError("");
        setLogo(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleInputChange = (event) => {
        handleFile(event.target.files?.[0]);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();

        setDragActive(false);

        const file = event.dataTransfer.files?.[0];

        handleFile(file);
    };

    const removeLogo = () => {
        if (preview) {
            URL.revokeObjectURL(preview);
        }

        setLogo(null);
        setPreview("");
        setError("");

        if (inputRef.current) {
            inputRef.current.value = "";
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

            <input
                ref={inputRef}
                hidden
                type="file"
                accept=".png,.jpg,.jpeg,.svg"
                onChange={handleInputChange}
            />

            {!logo ? (
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
                    onDragEnter={(e) => {
                        e.preventDefault();
                        setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
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
                                component="span"
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
                                    Current Logo
                                </Typography>

                                <Typography color="text.secondary">
                                    {logo.name}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    mb={3}
                                >
                                    {(logo.size / 1024).toFixed(1)} KB
                                </Typography>

                                <Stack
                                    direction="row"
                                    spacing={2}
                                >
                                    <Button
                                        startIcon={<Edit />}
                                        variant="outlined"
                                        onClick={() =>
                                            inputRef.current?.click()
                                        }
                                    >
                                        Replace
                                    </Button>

                                    <Button
                                        color="error"
                                        startIcon={<Delete />}
                                        onClick={removeLogo}
                                    >
                                        Remove
                                    </Button>
                                </Stack>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            )}

            {error && (
                <Alert
                    severity="error"
                    sx={{ mt: 2 }}
                >
                    {error}
                </Alert>
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
}