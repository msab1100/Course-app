"use client";

import { useState } from "react";
import axios from "axios";
import { TextField, Button, Box, Typography, Alert, CircularProgress } from "@mui/material";
import api from "../services/api";

interface CourseFormProps {
  onAdded: () => void;
}

export default function CourseForm({ onAdded }: CourseFormProps) {
  const [course, setCourse] = useState({
    course_name: "",
    description: "",
    duration_weeks: "",
    fees: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCourse({ ...course, [e.target.name]: e.target.value });
  };

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const duration = Number.isFinite(Number(course.duration_weeks)) ? parseInt(course.duration_weeks, 10) : NaN;
      const fees = Number.isFinite(Number(course.fees)) ? parseFloat(course.fees) : NaN;
      const payload: { course_name: string; description: string | null; duration_weeks: number; fees: number } = {
        course_name: course.course_name.trim(),
        description: course.description?.trim() || null,
        duration_weeks: duration,
        fees,
      };

      if (!payload.course_name || isNaN(payload.duration_weeks) || isNaN(payload.fees)) {
        setError('Please provide a valid course name, duration (weeks) and fees');
        return;
      }

      await api.post('/courses', payload);

      setCourse({ course_name: '', description: '', duration_weeks: '', fees: '' });
      onAdded();
    } catch (err: unknown) {
      console.error('Failed to save course', err);
      if (axios.isAxiosError(err) && err.response) {
        const resp = err.response;
        let detail: unknown;
        if (resp.data && typeof resp.data === 'object' && resp.data !== null && 'detail' in resp.data) {
          detail = (resp.data as { detail?: unknown }).detail;
        } else {
          detail = resp.data ?? resp.statusText;
        }
        const detailStr = typeof detail === 'string' ? detail : String(detail);
        setError(`Failed to save course: ${detailStr} (status ${resp.status})`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, mb: 4, boxShadow: 3 }}>
      <Typography variant="h6">Add Course</Typography>

      <TextField name="course_name" label="Course Name" fullWidth margin="normal"
        value={course.course_name} onChange={handleChange} />

      <TextField name="description" label="Description" fullWidth margin="normal"
        value={course.description} onChange={handleChange} />

      <TextField name="duration_weeks" label="Duration (Weeks)" type="number"
        fullWidth margin="normal" value={course.duration_weeks} onChange={handleChange} />

      <TextField name="fees" label="Fees" type="number"
        fullWidth margin="normal" value={course.fees} onChange={handleChange} />

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          Save
        </Button>
        {loading && <CircularProgress size={20} />}
      </Box>
    </Box>
  );
}
