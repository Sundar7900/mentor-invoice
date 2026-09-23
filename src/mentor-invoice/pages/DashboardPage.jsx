import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import EventNoteIcon from '@mui/icons-material/EventNote';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate } from 'react-router-dom';

import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { fetchSummary, fetchMentors, fetchInvoicePreview } from '../apiCalls/mentorInvoiceApi';
import { formatCurrency, formatHours } from '../utils/formatters';
import { exportInvoiceToCSV } from '../utils/exportHelpers';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Default billing cycle matching sheet (Aug 16 - Sep 15, 2026)
  const [dateRange, setDateRange] = useState({
    start: 1786876800, // Aug 16, 2026
    end: 1789555200,   // Sep 15, 2026
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sumData, mentorsData] = await Promise.all([
        fetchSummary(),
        fetchMentors(dateRange.start, dateRange.end),
      ]);
      setSummary(sumData);
      setMentors(mentorsData || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExportMentor = async (mentor) => {
    try {
      const inv = await fetchInvoicePreview(mentor.mentorHash, dateRange.start, dateRange.end);
      exportInvoiceToCSV(inv);
    } catch (err) {
      alert('Failed to export invoice: ' + err.message);
    }
  };

  const filteredMentors = mentors.filter((m) =>
    m.mentorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.courseName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box className="zen-dashboard-container">
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--zen-text-main)', letterSpacing: -0.3 }}>
            Mentor Invoice Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--zen-text-secondary)', mt: 0.8 }}>
            Automated session attendance tracking, billing calculations, and accounts payout verification.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Chip
            label="Billing Cycle: 16-Aug-2026 to 15-Sep-2026"
            sx={{
              backgroundColor: '#e8f2fe',
              color: '#0d75fc',
              fontWeight: 700,
              fontSize: '0.85rem',
              py: 2,
              px: 1,
              borderRadius: '8px',
            }}
          />
          <Button
            variant="outlined"
            size="medium"
            startIcon={<RefreshIcon />}
            onClick={loadData}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderColor: 'var(--zen-border)',
              color: 'var(--zen-text-main)',
              borderRadius: '8px',
              px: 2,
              '&:hover': {
                borderColor: '#0d75fc',
                backgroundColor: '#f8fafc',
              },
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3.5, borderRadius: '8px' }}>
          {error}
        </Alert>
      )}

      {/* KPI Cards Section with explicit container to prevent MUI Grid margin collapse */}
      <Box sx={{ mb: 4.5 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Payout Amount"
              value={formatCurrency(summary?.totalInvoicedAmount || 0)}
              subtitle="Calculated for billing period"
              icon={CurrencyRupeeIcon}
              color="#059669"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Hours Billed"
              value={`${formatHours(summary?.totalHoursBilled || 0)} hrs`}
              subtitle="Across all combined classes"
              icon={AccessTimeIcon}
              color="#0d75fc"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Sessions"
              value={summary?.totalSessionsCount || 0}
              subtitle="Conducted live classes"
              icon={EventNoteIcon}
              color="#8B5CF6"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Mentors"
              value={summary?.activeMentorsCount || 0}
              subtitle="Assigned to batches"
              icon={PeopleIcon}
              color="#F59E0B"
            />
          </Grid>
        </Grid>
      </Box>

      {/* Main Mentor Hub Section */}
      <Paper
        elevation={0}
        sx={{
          border: '1px solid var(--zen-border)',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        }}
      >
        <Box
          sx={{
            p: 2.5,
            borderBottom: '1px solid var(--zen-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--zen-text-main)' }}>
              All Mentors Overview
            </Typography>
            <Typography variant="caption" sx={{ color: 'var(--zen-text-muted)' }}>
              All mentor sheets unified in one central console. Click View Sheet to inspect line items.
            </Typography>
          </Box>

          <TextField
            size="small"
            placeholder="Search by mentor or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 280, backgroundColor: '#ffffff' }}
          />
        </Box>

        {loading ? (
          <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={36} sx={{ color: '#0d75fc' }} />
          </Box>
        ) : filteredMentors.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ color: 'var(--zen-text-muted)' }}>
              No mentors match your search criteria.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="medium">
              <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Mentor Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Assigned Course</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#334155' }}>Hourly Rate</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#334155' }}>Sessions</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#0d75fc' }}>Total Hours</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#059669' }}>Payable Amount</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#334155' }}>Bank Setup</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#334155' }}>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredMentors.map((m) => (
                  <TableRow key={m.mentorHash} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--zen-text-main)' }}>
                        {m.mentorName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'var(--zen-text-muted)' }}>
                        {m.email}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ color: 'var(--zen-text-secondary)', fontSize: '0.85rem' }}>
                      {m.courseName || 'Zen Data Science'}
                    </TableCell>

                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {m.hourlyRate > 0 ? `${formatCurrency(m.hourlyRate)}/hr` : (
                        <Typography variant="caption" sx={{ color: '#EF4444', fontWeight: 600 }}>
                          Rate Not Set
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell align="center">
                      <Chip size="small" label={`${m.sessionCount} sessions`} sx={{ fontWeight: 600 }} />
                    </TableCell>

                    <TableCell align="right" sx={{ fontWeight: 700, color: '#0d75fc', fontFamily: 'monospace' }}>
                      {formatHours(m.calculatedHours)} hrs
                    </TableCell>

                    <TableCell align="right" sx={{ fontWeight: 800, color: '#059669', fontSize: '0.95rem' }}>
                      {formatCurrency(m.totalAmount)}
                    </TableCell>

                    <TableCell align="center">
                      {m.hasBankDetails ? (
                        <Chip
                          size="small"
                          label="Configured"
                          sx={{ backgroundColor: '#d1fae5', color: '#065f46', fontWeight: 600, fontSize: '0.75rem' }}
                        />
                      ) : (
                        <Chip
                          size="small"
                          label="Missing"
                          sx={{ backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: 600, fontSize: '0.75rem' }}
                        />
                      )}
                    </TableCell>

                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                        <Tooltip title="View Google Sheet Breakdown">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/mentor-invoice/sheet/${encodeURIComponent(m.mentorHash)}`)}
                            sx={{ color: '#0d75fc' }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Export for Accounts Team (CSV)">
                          <IconButton
                            size="small"
                            onClick={() => handleExportMentor(m)}
                            sx={{ color: '#059669' }}
                          >
                            <FileDownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Edit Rate & Bank Profile">
                          <IconButton
                            size="small"
                            onClick={() => navigate('/mentor-invoice/rates')}
                            sx={{ color: '#64748B' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}
