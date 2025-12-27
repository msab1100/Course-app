'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, TextField, Alert, Box, Typography, CircularProgress } from '@mui/material';
import api from '../../../services/api';

export default function UserSignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!name || !phone || !email || !password) {
        setError('Please fill all fields');
        return;
      }
      await api.post('/user/signup', { name, phone, email, password });
      router.push('/auth/login?msg=signup_success');
    } catch (e: unknown) {
      let msg = 'Signup failed';
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
        Sign Up
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        label="Full Name"
        fullWidth
        margin="normal"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <TextField
        label="Phone Number"
        fullWidth
        margin="normal"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
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

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
        <Button variant="outlined" onClick={() => router.push('/auth/login')} disabled={loading}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSignup} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : 'Sign Up'}
        </Button>
      </Box>
    </Box>
  );
}
