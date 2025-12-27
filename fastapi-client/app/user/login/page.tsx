'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, TextField, Alert, Box, Typography, CircularProgress } from '@mui/material';
import { loginUser, loginWithProvider } from '../../../services/auth';
import { GoogleIcon, MicrosoftIcon } from '../../../components/SocialIcons';

export default function UserLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!username || !password) {
        setError('Please provide username and password');
        return;
      }
      const token = await loginUser(username, password);
      if (!token) throw new Error('No token returned');
      try {
        localStorage.setItem('user_token', token);
      } catch {
        // ignore
      }
      router.push('/');
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

      {/* Social login buttons for users */}
      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <Button
          variant="outlined"
          onClick={() => loginWithProvider('google')}
          disabled={loading}
          startIcon={<GoogleIcon />}
        >
          Login with Google
        </Button>
        <Button
          variant="outlined"
          onClick={() => loginWithProvider('microsoft')}
          disabled={loading}
          startIcon={<MicrosoftIcon />}
        >
          Login with Microsoft
        </Button>
      </Box>

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
