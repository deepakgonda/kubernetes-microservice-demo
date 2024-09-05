import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, CircularProgress } from '@mui/material';
import { AuthContext } from '../AuthContext';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { axiosInstance } = useContext(AuthContext);

  const handleSignup = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.post(`${process.env.REACT_APP_USERS_SERVICE_API_URL}/signup`, { email, password });
      if (response.data) {
        // Redirect to login page after successful signup
        navigate('/login');
      } else {
        setError('Signup failed');
      }
    } catch (err) {
      setError('Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box mt={5}>
        <Typography variant="h4" align="center">Sign Up</Typography>
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
            onClick={handleSignup}
            disabled={loading}
            startIcon={loading && <CircularProgress size={24} />}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </Button>
        </Box>
        <Box mt={2} textAlign="center">
          <Typography variant="body2">
            Already Registered?{' '}
            <Link to="/login" style={{ textDecoration: 'none', color: '#1976d2' }}>
              Click here to Login
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default SignupPage;
