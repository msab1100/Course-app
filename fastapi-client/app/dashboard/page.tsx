'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Button,
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

export default function UserDashboard() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<number>>(new Set());
  const [userEmail, setUserEmail] = useState<string>('');
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

  const fetchProfile = async (): Promise<void> => {
    try {
      const resp = await api.get<{email: string}>('/user/me');
      setUserEmail(resp.data.email);
    } catch {
      // ignore
    }
  };

  const fetchEnrollments = async (): Promise<void> => {
    try {
      const resp = await api.get<Array<{course_id: number}>>('/user/enrollments');
      const ids = new Set(resp.data.map(e => e.course_id));
      setEnrolledCourseIds(ids);
    } catch {
      // ignore
    }
  };

  const handleEnroll = async (courseId: number): Promise<void> => {
    try {
      await api.post('/user/enroll', { course_id: courseId });
      setEnrolledCourseIds(prev => new Set(prev).add(courseId));
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError(String(e));
      }
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchProfile();
    fetchEnrollments();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user_token');
    window.location.href = '/auth/login';
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4, px: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h4" component="h1">
            User Dashboard
          </Typography>
          {userEmail && (
            <Typography variant="body2" color="text.secondary">
              Logged in as: {userEmail}
            </Typography>
          )}
        </Box>
        <Button variant="outlined" onClick={handleLogout}>
          Logout
        </Button>
      </Box>

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
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Alert severity="error">{error}</Alert>
                </TableCell>
              </TableRow>
            ) : courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No courses available.
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => {
                const isEnrolled = enrolledCourseIds.has(course.course_id);
                return (
                  <TableRow key={course.course_id}>
                    <TableCell>{course.course_id}</TableCell>
                    <TableCell>{course.course_name}</TableCell>
                    <TableCell>{course.description || '-'}</TableCell>
                    <TableCell>{course.duration_weeks}</TableCell>
                    <TableCell>${course.fees}</TableCell>
                    <TableCell>
                      <ClientDate value={course.created_at} />
                    </TableCell>
                    <TableCell>
                      {isEnrolled ? (
                        <Typography variant="body2" color="success.main">
                          Enrolled
                        </Typography>
                      ) : (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleEnroll(course.course_id)}
                          disabled={loading}
                        >
                          Pay/Enroll
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
