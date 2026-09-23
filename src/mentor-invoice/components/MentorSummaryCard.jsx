import React from 'react';
import { Box, Paper, Typography, Grid, Divider, Button, Chip } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import BadgeIcon from '@mui/icons-material/Badge';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { formatCurrency, formatHours } from '../utils/formatters';
import { exportInvoiceToCSV } from '../utils/exportHelpers';

export default function MentorSummaryCard({ invoice, onSave, onStatusChange, isSaving }) {
  if (!invoice) return null;

  const handleExport = () => {
    exportInvoiceToCSV(invoice);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid var(--zen-border)',
        borderRadius: '12px',
        overflow: 'hidden',
        mb: 4,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Top Banner */}
      <Box
        sx={{
          background: 'linear-gradient(90deg, #0d75fc 0%, #1e40af 100%)',
          color: '#ffffff',
          px: 3,
          py: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
            Mentor Attendance Tracker & Payment Invoice
          </Typography>
          {invoice.billingPeriodLabel && (
            <Chip
              size="small"
              label={invoice.billingPeriodLabel}
              sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#ffffff', fontWeight: 600 }}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<FileDownloadIcon />}
            onClick={handleExport}
            sx={{
              backgroundColor: '#ffffff',
              color: '#0d75fc',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { backgroundColor: '#f0f7ff' },
            }}
          >
            Export for Accounts Team
          </Button>

          {onSave && (
            <Button
              variant="contained"
              size="small"
              startIcon={<CheckCircleIcon />}
              onClick={onSave}
              disabled={isSaving}
              sx={{
                backgroundColor: '#10B981',
                color: '#ffffff',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { backgroundColor: '#059669' },
              }}
            >
              {isSaving ? 'Saving...' : 'Finalize Invoice'}
            </Button>
          )}
        </Box>
      </Box>

      {/* Details Grid matching the Google Sheet Block */}
      <Box sx={{ p: 3, backgroundColor: '#ffffff' }}>
        <Grid container spacing={3}>
          {/* Left Column: Mentor & Course Details */}
          <Grid item xs={12} md={4}>
            <Typography variant="caption" sx={{ color: 'var(--zen-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Mentor Information
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--zen-text-main)', mt: 0.5 }}>
              {invoice.mentorName || 'Unassigned Mentor'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--zen-text-secondary)', mt: 0.5, fontSize: '0.85rem' }}>
              <strong>Course:</strong> {invoice.courseName || 'Zen Data Science'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--zen-text-secondary)', mt: 0.5 }}>
              <strong>Pay Rate:</strong> {formatCurrency(invoice.hourlyRate)} / hour
            </Typography>
          </Grid>

          {/* Center Column: Hours & Amounts Calculation */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                backgroundColor: '#f8fafc',
                p: 2,
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'var(--zen-text-muted)' }}>Total Sessions:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{invoice.totalSessions || 0}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'var(--zen-text-muted)' }}>Total Hours:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0d75fc', fontSize: '1.05rem' }}>
                  {formatHours(invoice.totalHours)} hrs
                </Typography>
              </Box>
              <Divider sx={{ my: 0.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--zen-text-main)' }}>Total Payable:</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#059669' }}>
                  {formatCurrency(invoice.totalAmount)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Right Column: Bank Details & PAN */}
          <Grid item xs={12} md={4}>
            <Typography variant="caption" sx={{ color: 'var(--zen-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Payout Account (Accounts Team Reference)
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountBalanceIcon sx={{ fontSize: 18, color: 'var(--zen-text-muted)' }} />
                <Typography variant="body2">
                  <strong>A/C No:</strong> {invoice.bankDetails?.accountNumber || 'Not configured'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ pl: 3.2 }}>
                  <strong>IFSC:</strong> {invoice.bankDetails?.ifsc || 'Not configured'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BadgeIcon sx={{ fontSize: 18, color: 'var(--zen-text-muted)' }} />
                <Typography variant="body2">
                  <strong>PAN No:</strong> {invoice.bankDetails?.panNumber || 'Not configured'}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}
