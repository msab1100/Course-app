'use client';

import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import { useAuth } from '../src/providers/AuthProvider';
import AdminLogin from './AdminLogin';

export default function AdminBar() {
  const { isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);

  // 🔐 Open admin login modal on 401 from API
  useEffect(() => {
    const onUnauthorized = () => setOpen(true);

    window.addEventListener('admin:unauthorized', onUnauthorized);
    return () => {
      window.removeEventListener('admin:unauthorized', onUnauthorized);
    };
  }, []);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Course App
          </Typography>

          {isAuthenticated ? (
            <>
              <Button color="inherit" href="/admin/dashboard">
                Admin Dashboard
              </Button>
              <Button color="inherit" href="/courses">
                Courses
              </Button>
              <Button color="inherit" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" href="/courses">
                Courses
              </Button>
              <Button color="inherit" href="/auth/login">
                User Login
              </Button>
              <Button color="inherit" href="/auth/signup">
                Sign Up
              </Button>
              <Button color="inherit" onClick={() => { console.log('Admin Login button clicked'); setOpen(true); }}>
                Admin Login
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <AdminLogin open={open} onClose={() => setOpen(false)} />
    </Box>
  );
}
