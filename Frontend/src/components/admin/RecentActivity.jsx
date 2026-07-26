import { Card, CardContent, Typography, Stack } from "@mui/material";

export default function RecentActivity({ activity }) {
    if (!activity) return null;

    return (
        <Card sx={{ mt: 3 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Recent Activity
                </Typography>

                <Stack spacing={1}>
                    <Typography>
                        👨‍🎓 Students added (last 30 days): <b>{activity.studentsAdded}</b>
                    </Typography>
                    <Typography>
                        📘 Enrollments this year: <b>{activity.enrollmentsThisYear}</b>
                    </Typography>
                </Stack>
            </CardContent>
        </Card>
    );
}
