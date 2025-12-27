'use client';

import React, { useState } from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Alert,
} from '@mui/material';
import api from '../services/api';

interface CourseFormData {
  course_name: string;
  description: string;
  duration_weeks: number;
  fees: number;
  instructor: string;
  category: string;
  level: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editing?: CourseFormData & { course_id: number };
}

export default function CourseFormDialog({ open, onClose, onSuccess, editing }: Props) {
  const [form, setForm] = useState<CourseFormData>(
    editing
      ? {
          course_name: editing.course_name,
          description: editing.description,
          duration_weeks: editing.duration_weeks,
          fees: editing.fees,
          instructor: editing.instructor || '',
          category: editing.category || '',
          level: editing.level || '',
        }
      : {
          course_name: '',
          description: '',
          duration_weeks: 1,
          fees: 0,
          instructor: '',
          category: '',
          level: '',
        }
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof CourseFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = ['course_name', 'description', 'instructor', 'category', 'level'].includes(field)
      ? e.target.value
      : Number(e.target.value);
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      if (editing) {
        await api.put(`/admin/courses/${editing.course_id}`, form);
      } else {
        await api.post('/admin/courses', form);
      }
      onSuccess();
      onClose();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editing ? 'Edit Course' : 'Add Course'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Course Name"
            value={form.course_name}
            onChange={handleChange('course_name')}
            fullWidth
          />
          <TextField
            label="Description"
            value={form.description}
            onChange={handleChange('description')}
            fullWidth
            multiline
            rows={3}
          />
          <TextField
            label="Duration (Weeks)"
            type="number"
            value={form.duration_weeks}
            onChange={handleChange('duration_weeks')}
            fullWidth
          />
          <TextField
            label="Fees"
            type="number"
            value={form.fees}
            onChange={handleChange('fees')}
            fullWidth
          />
          <TextField
            label="Instructor"
            value={form.instructor}
            onChange={handleChange('instructor')}
            fullWidth
          />
          <TextField
            label="Category"
            value={form.category}
            onChange={handleChange('category')}
            fullWidth
          />
          <TextField
            label="Level"
            value={form.level}
            onChange={handleChange('level')}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {editing ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
