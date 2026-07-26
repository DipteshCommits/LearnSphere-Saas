import { Card, CardContent, Typography, Grid, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function QuickActions() {
    const navigate = useNavigate();

    return (
        <Card sx={{ mt: 3 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Quick Actions
                </Typography>

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={() => navigate("/admin/grades")}
                        >
                            ➕ Add Grade
                        </Button>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={() => navigate("/admin/sections")}
                        >
                            ➕ Add Section
                        </Button>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={() => navigate("/admin/students")}
                        >
                            👨‍🎓 Add Student
                        </Button>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => navigate("/admin/enrollments")}
                        >
                            📘 Enroll Student
                        </Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}
