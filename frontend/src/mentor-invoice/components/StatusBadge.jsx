import React from 'react';
import { Chip } from '@mui/material';

const statusConfig = {
  draft: { label: 'Draft', color: '#64748B', bg: '#F1F5F9' },
  submitted: { label: 'Pending Review', color: '#D97706', bg: '#FEF3C7' },
  approved: { label: 'Approved', color: '#059669', bg: '#D1FAE5' },
  paid: { label: 'Paid', color: '#2563EB', bg: '#DBEAFE' },
};

export default function StatusBadge({ status = 'draft' }) {
  const cfg = statusConfig[status?.toLowerCase()] || statusConfig.draft;

  return (
    <Chip
      size="small"
      label={cfg.label}
      sx={{
        fontWeight: 600,
        fontSize: '0.75rem',
        color: cfg.color,
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.color}33`,
        borderRadius: '6px',
        px: 0.5,
      }}
    />
  );
}
