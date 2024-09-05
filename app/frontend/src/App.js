import React, { Suspense, lazy, useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Layout from './components/Layout';
import { CircularProgress, Box } from '@mui/material';
import { AuthContext, AuthProvider } from './AuthContext';

// Lazy load the administration feature components
const DashboardPage = lazy(() => import('./modules/admin/pages/DashboardPage'));

const App = () => {
  const { isAuthenticated, axiosInstance } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        setLoading(true);
        // You could have any logic here that checks authentication
      } catch (error) {
        console.error('Error during authentication check', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, [axiosInstance]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Router>
      <Suspense
        fallback={
          <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
            <CircularProgress />
          </Box>
        }
      >
        <Routes>
          {/* If not authenticated, show the Login page */}
          {!isAuthenticated && <Route path="/login" element={<LoginPage />} />}
          {!isAuthenticated && <Route path="/signup" element={<SignupPage />} />}

          {/* If authenticated, load the main application */}
          {isAuthenticated && (
            <Route path="/admin" element={<Layout />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="" element={<Navigate replace to="dashboard" />} />
            </Route>
          )}

          {/* Redirect based on authentication */}
          <Route
            path="*"
            element={<Navigate replace to={isAuthenticated ? "/admin/dashboard" : "/login"} />}
          />
        </Routes>
      </Suspense>
    </Router>
  );
};

const WrappedApp = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default WrappedApp;
