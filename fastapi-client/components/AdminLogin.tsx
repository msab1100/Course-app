'use client';

import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../src/providers/AuthProvider';

export default function AdminLogin({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { login } = useAuth();
  console.log('AdminLogin render, open:', open);
  // Prefill admin credentials (enforced on the client)
  const [username, setUsername] = useState('Admin');
  const [password, setPassword] = useState('000');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Show a helpful message when modal is opened due to an unauthorized event
  React.useEffect(() => {
    const handler = () => {
      setError('Session expired. Please re-authenticate.');
    };
    try {
      window.addEventListener('admin:unauthorized', handler);
    } catch {}
    return () => {
      try {
        window.removeEventListener('admin:unauthorized', handler);
      } catch {}
    };
  }, []);

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
      onClose();
    } catch (e: unknown) {
      let msg = 'Login failed';
      if (e instanceof Error) msg = e.message;
      else if (e && typeof e === 'object') {
        type AxiosErrorLike = { response?: { data?: { detail?: string } }; message?: string };
        const parsed = e as AxiosErrorLike;
        msg = parsed?.response?.data?.detail || parsed?.message || msg;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Admin Login</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error">{error}</Alert>}
        <Alert severity="info" sx={{ mb: 2 }}>
          Admin credentials: <strong>Admin</strong> / <strong>000</strong>
        </Alert>
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleLogin} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={20} /> : 'Login'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
