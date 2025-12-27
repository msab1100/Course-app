'use client';

import { useState } from 'react';
import { Container, Typography, Alert, Box, Button } from '@mui/material';
import CourseForm from '../components/CourseForm';
import CourseTable from '../components/CourseTable';
import { useAuth } from '../src/providers/AuthProvider';

export default function HomePage() {
  const [refresh, setRefresh] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Available Courses
      </Typography>

      <CourseTable refresh={refresh} />

      {isAuthenticated ? (
        <>
          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Admin — Add New Course
          </Typography>
          <CourseForm onAdded={() => setRefresh(!refresh)} />
        </>
      ) : (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Admins can sign in to add new courses.
          </Alert>
          <Button variant="contained" href="/login">Admin Login</Button>
        </Box>
      )}
    </Container>
  );
}
