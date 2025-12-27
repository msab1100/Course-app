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
  Button,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import api from '../services/api';

export interface Course {
  course_id: number;
  course_name: string;
  description?: string;
  duration_weeks: number;
  fees: number;
  created_at: string;
}

interface CourseTableProps {
  refresh: boolean;
}


import { useMemo } from 'react';

function ClientDate({ value }: { value?: string }) {
  const formatted = useMemo(() => {
    if (!value) return '';

    const date = new Date(value);
    if (isNaN(date.getTime())) return '';

    return date.toLocaleString();
  }, [value]);

  return <>{formatted}</>;
}

export default function CourseTable({ refresh }: CourseTableProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchCourses = async (): Promise<void> => {
    setError(null);
    try {
      setLoading(true);
      const response = await api.get<Course[]>('/courses');
      setCourses(response.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        // Avoid noisy stack traces for expected auth expiration; prompt re-auth and show a clear message
        console.warn('Unauthorized (401) while fetching courses — prompting admin login');
        try {
          window.dispatchEvent(new CustomEvent('admin:unauthorized', { detail: { status: 401 } }));
        } catch {}
        setError('Unauthorized — please sign in as admin.');
      } else {
        console.error('Failed to fetch courses:', err);
        if (axios.isAxiosError(err) && err.response) {
          const resp = err.response;
          let detail: unknown;
          if (resp.data && typeof resp.data === 'object' && resp.data !== null && 'detail' in resp.data) {
            detail = (resp.data as { detail?: unknown }).detail;
          } else {
            detail = resp.data;
          }
          const detailStr = typeof detail === 'string' ? detail : String(detail);
          setError(`${detailStr} (status ${resp.status})`);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(String(err));
        }
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCourses();
  }, [refresh]);


  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Course Name</TableCell>
            <TableCell>Duration (Weeks)</TableCell>
            <TableCell>Fees</TableCell>
            <TableCell>Created At</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} align="center">Loading...</TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <Alert severity="error">{error}</Alert>
                <Button sx={{ mt: 1 }} onClick={() => router.push('/admin/login')}>Admin Login</Button>
              </TableCell>
            </TableRow>
          ) : (
            courses.map((course) => (
              <TableRow key={course.course_id}>
                <TableCell>{course.course_id}</TableCell>
                <TableCell>{course.course_name}</TableCell>
                <TableCell>{course.duration_weeks}</TableCell>
                <TableCell>{course.fees}</TableCell>
                <TableCell>
                  <ClientDate value={course.created_at} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
