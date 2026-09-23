import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import MentorSummaryCard from '../components/MentorSummaryCard';
import SheetTable from '../components/SheetTable';
import { fetchInvoicePreview, generateInvoice } from '../apiCalls/mentorInvoiceApi';

export default function InvoiceSheetView() {
  const { mentorHash } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Default billing cycle matching the sheet
  const start = 1786876800; // Aug 16, 2026
  const end = 1789555200;   // Sep 15, 2026

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchInvoicePreview(mentorHash, start, end);
        setInvoice(data);
      } catch (err) {
        setError(err.message || 'Failed to calculate mentor invoice');
      } finally {
        setLoading(false);
      }
    };

    if (mentorHash) {
      loadInvoice();
    }
  }, [mentorHash]);

  const handleFinalize = async () => {
    try {
      setSaving(true);
      await generateInvoice({
        mentorHash,
        billingStart: start,
        billingEnd: end,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      alert('Failed to save invoice: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box className="zen-dashboard-container">
      {/* Navigation & Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/mentor-invoice')}
          sx={{ color: '#0d75fc', fontWeight: 600, textTransform: 'none' }}
        >
          Back to All Mentors
        </Button>

        <Typography variant="body2" sx={{ color: 'var(--zen-text-muted)' }}>
          Detailed Attendance & Invoice Verification
        </Typography>
      </Box>

      {savedSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Invoice finalized and saved successfully!
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ p: 8, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={40} sx={{ color: '#0d75fc' }} />
        </Box>
      ) : invoice ? (
        <>
          {/* Top Mentor & Bank Summary Card */}
          <MentorSummaryCard
            invoice={invoice}
            onSave={handleFinalize}
            isSaving={saving}
          />

          {/* Table Breakdown */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--zen-text-main)' }}>
                Session Attendance & Duration Breakdown
              </Typography>
              <Typography variant="caption" sx={{ color: 'var(--zen-text-muted)' }}>
                {invoice.totalSessions} sessions conducted | Combined batches grouped automatically
              </Typography>
            </Box>

            <SheetTable
              items={invoice.items}
              totalHours={invoice.totalHours}
              totalSessions={invoice.totalSessions}
            />
          </Box>
        </>
      ) : (
        <Alert severity="info">No invoice data available for this mentor.</Alert>
      )}
    </Box>
  );
}
