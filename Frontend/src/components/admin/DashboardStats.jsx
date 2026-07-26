import { Grid, Card, CardContent, Typography } from "@mui/material";

const StatCard = ({ label, value }) => {
  return (
    <Card sx={{ bgcolor: "#ffffff" }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

const DashboardStats = ({stats}) => {
  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard label="Students" value={stats.students} />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatCard label="Teachers" value={stats.teachers} />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatCard label="Grades" value={stats.grades} />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatCard label="Sections" value={stats.sections} />
      </Grid>
    </Grid>
  );
};

export default DashboardStats;
