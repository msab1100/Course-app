'use client';

import { useEffect, useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import api from '../../services/api';

export interface Course {
  course_id: number;
  course_name: string;
  description?: string;
  duration_weeks: number;
  fees: number;
  created_at: string;
}

function ClientDate({ value }: { value?: string }) {
  const formatted = new Date(value || '').toLocaleString();
  return <>{formatted}</>;
}

export default function PublicCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async (): Promise<void> => {
    setError(null);
    try {
      setLoading(true);
      const response = await api.get<Course[]>('/courses');
      setCourses(response.data);
    } catch (err: unknown) {
      console.error('Failed to fetch courses:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4, px: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Courses
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Course Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Duration (Weeks)</TableCell>
              <TableCell>Fees</TableCell>
              <TableCell>Created At</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Alert severity="error">{error}</Alert>
                </TableCell>
              </TableRow>
            ) : courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No courses available.
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => (
                <TableRow key={course.course_id}>
                  <TableCell>{course.course_id}</TableCell>
                  <TableCell>{course.course_name}</TableCell>
                  <TableCell>{course.description || '-'}</TableCell>
                  <TableCell>{course.duration_weeks}</TableCell>
                  <TableCell>${course.fees}</TableCell>
                  <TableCell>
                    <ClientDate value={course.created_at} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
