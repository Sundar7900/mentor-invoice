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
  Chip,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import EventNoteIcon from '@mui/icons-material/EventNote';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useNavigate } from 'react-router-dom';

import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { fetchSummary, fetchMentors, fetchInvoicePreview } from '../apiCalls/mentorInvoiceApi';
import { formatCurrency, formatHours } from '../utils/formatters';
import { exportInvoiceToCSV } from '../utils/exportHelpers';

const BILLING_CYCLES = [
  { label: 'All Cycles (All Mentors)', start: 0, end: 0 },
  { label: 'April 2026 (01-Apr to 30-Apr-2026)', start: 1775001600, end: 1777593600 },
  { label: 'Aug - Sep 2026 (16-Aug to 15-Sep-2026)', start: 1786876800, end: 1789555200 },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCycleIdx, setSelectedCycleIdx] = useState(0);

  const dateRange = BILLING_CYCLES[selectedCycleIdx];

  const loadData = async (targetRange = dateRange) => {
    try {
      setLoading(true);
      setError(null);
      const [sumData, mentorsData] = await Promise.all([
        fetchSummary(),
        fetchMentors(targetRange.start, targetRange.end),
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
    loadData(BILLING_CYCLES[0]);
  }, []);

  const handleCycleChange = (e) => {
    const newIdx = e.target.value;
    setSelectedCycleIdx(newIdx);
    loadData(BILLING_CYCLES[newIdx]);
  };

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

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 260 }}>
            <Select
              value={selectedCycleIdx}
              onChange={handleCycleChange}
              displayEmpty
              renderValue={(val) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#0d75fc', fontWeight: 700 }}>
                  <CalendarMonthIcon sx={{ fontSize: '1.1rem' }} />
                  <span>{BILLING_CYCLES[val].label}</span>
                </Box>
              )}
              sx={{
                backgroundColor: '#e8f2fe',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                color: '#0d75fc',
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: '#bfdbfe',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#0d75fc',
                },
              }}
            >
              {BILLING_CYCLES.map((c, idx) => (
                <MenuItem key={idx} value={idx} sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {c.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            size="medium"
            startIcon={<RefreshIcon />}
            onClick={() => loadData(BILLING_CYCLES[selectedCycleIdx])}
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

      {/* KPI Cards Section with CSS Grid (eliminates MUI Grid negative margin overlap) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 3,
          mb: 4.5,
          width: '100%',
        }}
      >
        <StatCard
          title="Total Payout Amount"
          value={formatCurrency(summary?.totalInvoicedAmount || 0)}
          subtitle="Calculated for billing period"
          icon={CurrencyRupeeIcon}
          color="#059669"
        />
        <StatCard
          title="Total Hours Billed"
          value={`${formatHours(summary?.totalHoursBilled || 0)} hrs`}
          subtitle="Across all combined classes"
          icon={AccessTimeIcon}
          color="#0d75fc"
        />
        <StatCard
          title="Total Sessions"
          value={summary?.totalSessionsCount || 0}
          subtitle="Conducted live classes"
          icon={EventNoteIcon}
          color="#8B5CF6"
        />
        <StatCard
          title="Active Mentors"
          value={summary?.activeMentorsCount || 0}
          subtitle="Assigned to batches"
          icon={PeopleIcon}
          color="#F59E0B"
        />
      </Box>

      {/* Main Mentor Hub Section */}
      <Paper
        elevation={0}
        sx={{
          border: '1px solid var(--zen-border)',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          mt: 0,
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
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--zen-text-main)' }}>
                        {m.courseName || 'Zen Data Science'}
                      </Typography>
                      {m.sessionsTaken && m.sessionsTaken.length > 0 && (
                        <Box sx={{ mt: 0.5 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'inline-block',
                              color: '#0d75fc',
                              fontWeight: 600,
                              bgcolor: '#e8f2fe',
                              px: 0.75,
                              py: 0.2,
                              borderRadius: '4px',
                              fontSize: '0.73rem',
                            }}
                          >
                            {m.sessionsTaken[0]}
                            {m.sessionsTaken.length > 1 && ` (+${m.sessionsTaken.length - 1} more)`}
                          </Typography>
                        </Box>
                      )}
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
                            onClick={() => navigate(`/mentor-invoice/sheet/${encodeURIComponent(m.mentorHash)}?start=${dateRange.start}&end=${dateRange.end}`)}
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
