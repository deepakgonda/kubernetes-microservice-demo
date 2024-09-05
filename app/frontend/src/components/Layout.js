import React, { useState, useContext } from 'react';
import { Box, CssBaseline, Toolbar, AppBar, Typography, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import Sidebar from './Sidebar';
import { Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';


const Layout = () => {

    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    const handleLogout = () => {
        // Remove token from localStorage
        logout()
        // Redirect to login page
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap>
                        ToDo App
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton edge="start" color="inherit" onClick={handleLogout}>
                        <LogoutIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, p: 3, marginTop: '64px' }}>
                <Outlet />
            </Box>
        </Box>
    );
};

export default Layout;
