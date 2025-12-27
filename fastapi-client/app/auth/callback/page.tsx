'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Typography, Alert, Button, CircularProgress } from '@mui/material';

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'done' | 'error'>('processing');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token') || searchParams.get('access_token');
    const type = (searchParams.get('type') || searchParams.get('for') || 'user').toLowerCase();
    const redirect = searchParams.get('redirect') || '/';

    if (!token) {
      // avoid sync setState inside effect to satisfy lint/patterns
      setTimeout(() => {
        setStatus('error');
        setMessage('No token found in callback URL');
      }, 0);
      return;
    }

    try {
      if (type === 'admin' || type === 'administrator') {
        localStorage.setItem('admin_token', token);
      } else {
        localStorage.setItem('user_token', token);
      }
      // avoid synchronous setState in effect
      setTimeout(() => {
        setStatus('done');
        setMessage('Login successful, redirecting...');
        setTimeout(() => router.push(redirect), 800);
      }, 0);
    } catch {
      setTimeout(() => {
        setStatus('error');
        setMessage('Failed to store token in localStorage');
      }, 0);
    }
  }, [searchParams, router]);

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto', mt: 8, px: 2, textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>
        Processing sign-in...
      </Typography>

      {status === 'processing' && <CircularProgress />}

      {message && (
        <Alert severity={status === 'error' ? 'error' : 'success'} sx={{ mt: 2 }}>
          {message}
        </Alert>
      )}

      {status === 'error' && (
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={() => router.push('/user/login')}>
            Go to User Login
          </Button>
          <Button variant="outlined" sx={{ ml: 1 }} onClick={() => router.push('/login')}>
            Go to Admin Login
          </Button>
        </Box>
      )}
    </Box>
  );
}
