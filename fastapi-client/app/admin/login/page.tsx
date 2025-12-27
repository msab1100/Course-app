'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, TextField, Alert, Box, Typography, CircularProgress } from '@mui/material';
import { useAuth } from '../../../src/providers/AuthProvider';

export default function AdminLoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  // Prefill admin defaults
  const [username, setUsername] = useState('Admin');
  const [password, setPassword] = useState('000');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const u = username.trim();
      const p = password.trim();
      if (!u || !p) {
        setError('Please provide username and password');
        return;
      }
      await login(u, p);
      router.push('/');
    } catch (e: unknown) {
      let msg = 'Login failed';
      if (e instanceof Error) msg = e.message;
      else if (e && typeof e === 'object') {
        // Try to read axios style error
        const parsed = e as { response?: { data?: { detail?: string } }; message?: string };
        msg = parsed?.response?.data?.detail || parsed?.message || msg;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto', mt: 8, px: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Login
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        Admin credentials: <strong>Admin</strong> / <strong>000</strong>
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        label="Username"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
        <Button variant="outlined" onClick={() => router.push('/') } disabled={loading}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleLogin} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : 'Login'}
        </Button>
      </Box>
    </Box>
  );
}
