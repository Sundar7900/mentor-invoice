import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

import { fetchMentorProfiles, saveMentorProfile } from '../apiCalls/mentorInvoiceApi';
import { formatCurrency } from '../utils/formatters';

export default function MentorRatesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    mentorHash: '',
    mentorName: '',
    email: '',
    courseName: '',
    hourlyRate: '',
    accountNumber: '',
    ifsc: '',
    bankName: '',
    panNumber: '',
  });

  const loadProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMentorProfiles();
      setProfiles(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load mentor profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleOpenAdd = () => {
    setForm({
      mentorHash: '',
      mentorName: '',
      email: '',
      courseName: '',
      hourlyRate: '',
      accountNumber: '',
      ifsc: '',
      bankName: '',
      panNumber: '',
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (p) => {
    setForm({
      mentorHash: p.mentorHash,
      mentorName: p.mentorName,
      email: p.email,
      courseName: p.courseName || '',
      hourlyRate: p.hourlyRate || '',
      accountNumber: p.bankDetails?.accountNumber || '',
      ifsc: p.bankDetails?.ifsc || '',
      bankName: p.bankDetails?.bankName || '',
      panNumber: p.bankDetails?.panNumber || '',
    });
    setOpenModal(true);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const payload = {
        mentorHash: form.mentorHash || `hash-${Date.now()}`,
        mentorName: form.mentorName,
        email: form.email,
        courseName: form.courseName,
        hourlyRate: parseFloat(form.hourlyRate) || 0,
        currency: 'INR',
        bankDetails: {
          accountNumber: form.accountNumber,
          ifsc: form.ifsc,
          bankName: form.bankName,
          panNumber: form.panNumber,
        },
      };

      await saveMentorProfile(payload);
      setOpenModal(false);
      loadProfiles();
    } catch (err) {
      alert('Failed to save profile: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box className="zen-dashboard-container">
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            variant="text"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/mentor-invoice')}
            sx={{ color: '#0d75fc', fontWeight: 600, textTransform: 'none' }}
          >
            Dashboard
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--zen-text-main)' }}>
            Mentor Hourly Rates & Bank Profiles
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{
            backgroundColor: '#0d75fc',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': { backgroundColor: '#095ec9' },
          }}
        >
          Add Mentor Profile
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Profiles Table */}
      <Paper
        elevation={0}
        sx={{
          border: '1px solid var(--zen-border)',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}
      >
        <Box sx={{ p: 2.5, borderBottom: '1px solid var(--zen-border)' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--zen-text-main)' }}>
            Configured Mentors
          </Typography>
          <Typography variant="caption" sx={{ color: 'var(--zen-text-muted)' }}>
            Stores hourly compensation rates and bank details required for accounts payment processing.
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={36} sx={{ color: '#0d75fc' }} />
          </Box>
        ) : profiles.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ color: 'var(--zen-text-muted)' }}>
              No mentor profiles configured yet. Click "Add Mentor Profile" to get started.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="medium">
              <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Mentor Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Primary Course</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#0d75fc' }}>Hourly Rate</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Bank Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Account Number</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#334155' }}>IFSC Code</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#334155' }}>PAN Number</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#334155' }}>Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {profiles.map((p) => (
                  <TableRow key={p.id || p.mentorHash} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {p.mentorName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'var(--zen-text-muted)' }}>
                        {p.email}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ color: 'var(--zen-text-secondary)', fontSize: '0.85rem' }}>
                      {p.courseName || '-'}
                    </TableCell>

                    <TableCell align="right" sx={{ fontWeight: 700, color: '#0d75fc' }}>
                      {formatCurrency(p.hourlyRate)} / hr
                    </TableCell>

                    <TableCell sx={{ color: 'var(--zen-text-secondary)' }}>
                      {p.bankDetails?.bankName || '-'}
                    </TableCell>

                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      {p.bankDetails?.accountNumber || '-'}
                    </TableCell>

                    <TableCell sx={{ fontFamily: 'monospace' }}>
                      {p.bankDetails?.ifsc || '-'}
                    </TableCell>

                    <TableCell sx={{ fontFamily: 'monospace' }}>
                      {p.bankDetails?.panNumber || '-'}
                    </TableCell>

                    <TableCell align="center">
                      <IconButton size="small" onClick={() => handleOpenEdit(p)} sx={{ color: '#0d75fc' }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Add / Edit Profile Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'var(--zen-text-main)' }}>
          {form.mentorHash ? 'Edit Mentor Billing Profile' : 'Add Mentor Billing Profile'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Mentor Name"
                value={form.mentorName}
                onChange={(e) => setForm({ ...form, mentorName: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Course Name"
                value={form.courseName}
                onChange={(e) => setForm({ ...form, courseName: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Hourly Rate (₹ / hour)"
                type="number"
                value={form.hourlyRate}
                onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--zen-text-muted)', textTransform: 'uppercase' }}>
                Bank Payout Credentials (For Accounts Team)
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Bank Name (e.g. HDFC Bank)"
                value={form.bankName}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Account Number"
                value={form.accountNumber}
                onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="IFSC Code"
                value={form.ifsc}
                onChange={(e) => setForm({ ...form, ifsc: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="PAN Number"
                value={form.panNumber}
                onChange={(e) => setForm({ ...form, panNumber: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)} sx={{ textTransform: 'none', color: 'var(--zen-text-muted)' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting || !form.mentorName || !form.hourlyRate}
            sx={{
              backgroundColor: '#0d75fc',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#095ec9' },
            }}
          >
            {submitting ? 'Saving...' : 'Save Profile'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
