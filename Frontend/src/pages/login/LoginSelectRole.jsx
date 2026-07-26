import { Box, Card, CardActionArea, CardContent, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

const roles = [
  { label: 'Student', value: 'STUDENT' },
  { label: 'Teacher', value: 'TEACHER' },
  { label: 'Administrator', value: 'ORG_ADMIN' }
];

export default function LoginSelectRole() {
  const { type } = useParams();
  const navigate = useNavigate();

  return (
    <Box display="flex" gap={3} justifyContent="center" mt={10}>
      {roles.map(role => (
        <Card key={role.value} sx={{ width: 250 }}>
          <CardActionArea
            onClick={() => navigate(`/login/${type}/${role.value.toLowerCase()}`)}
          >
            <CardContent>
              <Typography variant="h6" align="center">
                {role.label}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </Box>
  );
}
