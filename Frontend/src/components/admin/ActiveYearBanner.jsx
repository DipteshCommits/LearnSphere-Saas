import { Card, CardContent, Typography, Button, Stack } from "@mui/material";

const ActiveYearBanner = ({ activeYear }) => {
    const hasActiveYear = Boolean(activeYear);

    return (
        <Card
            sx={{
                mb: 3,
                borderLeft: hasActiveYear ? "5px solid #22c55e" : "5px solid #f97316",
                bgcolor: "#ffffff",
            }}
        >
            <CardContent>
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={2}
                >
                    <div>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Academic Year
                        </Typography>

                        {hasActiveYear ? (
                            <Typography color="text.secondary">
                                <strong>{activeYear.yearLabel}</strong> is currently active
                            </Typography>
                        ) : (
                            <Typography color="warning.main">
                                No active academic year set
                            </Typography>
                        )}
                    </div>

                    {!hasActiveYear && (
                        <Button variant="contained" color="warning">
                            Create Academic Year
                        </Button>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
};

export default ActiveYearBanner;
