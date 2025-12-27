'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, TextField, Alert, Box, Typography, CircularProgress } from '@mui/material';
import api from '../../../services/api';

export default function UserLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    const msg = searchParams?.get('msg');
    if (msg === 'signup_success') {
      setInfo('Account created! Please log in.');
    }
  }, [searchParams]);

  const handleLogin = async () => {
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (!email || !password) {
        setError('Please provide email and password');
        return;
      }
      const resp = await api.post('/user/login', { email, password });
      const token = resp.data?.access_token || resp.data?.token;
      if (!token) throw new Error('No token returned');
      localStorage.setItem('user_token', token);
      router.push('/dashboard');
    } catch (e: unknown) {
      let msg = 'Login failed';
      if (e instanceof Error) msg = e.message;
      else if (e && typeof e === 'object') {
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
        User Login
      </Typography>

      {info && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {info}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        label="Email"
        type="email"
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

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', mt: 2 }}>
        <Button variant="outlined" onClick={() => router.push('/signup')} disabled={loading}>
          Sign Up
        </Button>
        <Button variant="contained" onClick={handleLogin} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : 'Login'}
        </Button>
      </Box>
    </Box>
  );
}
