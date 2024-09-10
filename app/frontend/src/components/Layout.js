import React, { useState, useContext } from 'react';
import { Box, CssBaseline, Toolbar, AppBar, Typography, IconButton, Drawer, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import Sidebar from './Sidebar';
import { Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { useTheme } from '@mui/material/styles';

const Layout = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false); // State for sidebar toggle
  const theme = useTheme();
  const isTabletOrBelow = useMediaQuery(theme.breakpoints.down('md')); // Media query for responsiveness

  const handleLogout = () => {
    // Remove token from localStorage
    logout();
    // Redirect to login page
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }} onClick={toggleSidebar}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            ToDo App
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton edge="end" color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Sidebar for desktop */}
      {!isTabletOrBelow && (
        <Sidebar />
      )}

      {/* Drawer for tablet and below */}
      {isTabletOrBelow && (
        <Drawer
          variant="temporary"
          open={sidebarOpen}
          onClose={toggleSidebar}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          <Sidebar />
        </Drawer>
      )}

      <Box component="main" sx={{ flexGrow: 1, p: 3, marginTop: '64px' }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
