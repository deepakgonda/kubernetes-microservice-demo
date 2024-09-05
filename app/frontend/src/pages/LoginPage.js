import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, CircularProgress } from '@mui/material';
import { AuthContext } from '../AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, login, axiosInstance } = useContext(AuthContext);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.post(`${process.env.REACT_APP_USERS_SERVICE_API_URL}/login`, { email, password });
      if (response.data.token) {
        login(response.data.token, response.data.refreshToken); // Use context login function
        navigate('/admin/dashboard');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box mt={5}>
        <Typography variant="h4" align="center">Login</Typography>
        {error && <Typography color="error">{error}</Typography>}
        <TextField
          label="Email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Box mt={2}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleLogin}
            disabled={loading}
            startIcon={loading && <CircularProgress size={24} />}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </Box>
        <Box mt={2} textAlign="center">
          <Typography variant="body2">
            Not yet registered?{' '}
            <Link to="/signup" style={{ textDecoration: 'none', color: '#1976d2' }}>
              Sign Up here
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;
