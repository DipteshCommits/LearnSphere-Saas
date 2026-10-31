import {
  Box,
  Button,
  TextField,
  Typography,
  Paper
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';

export default function LoginForm() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const { role } = useParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const user = await login(email, password);

      // Safety check
      if (user.role !== role.toUpperCase()) {
        logout();
        setError('Role mismatch');
        return;
      }

      if (user.mustChangePassword) {
        navigate('/change-password');
      } else if (user.role === 'ORG_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }

    } catch {
      setError('Invalid credentials');
    }
  };

  return (
    <Box display="flex" justifyContent="center" mt={10}>
      <Paper sx={{ p: 4, width: 400 }}>
        <Typography variant="h5" mb={2}>
          Login
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <TextField
            fullWidth
            type="password"
            label="Password"
            margin="normal"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          {error && (
            <Typography color="error" mt={1}>
              {error}
            </Typography>
          )}

          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            type="submit"
          >
            Login
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
