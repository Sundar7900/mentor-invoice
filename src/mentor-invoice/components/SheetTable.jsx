import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  Typography,
} from '@mui/material';
import { formatHours } from '../utils/formatters';

export default function SheetTable({ items = [], totalHours = 0, totalSessions = 0 }) {
  if (!items || items.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px solid var(--zen-border)', borderRadius: '12px' }}>
        <Typography variant="body1" sx={{ color: 'var(--zen-text-muted)' }}>
          No session attendance records found for this period.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: '1px solid var(--zen-border)',
        borderRadius: '12px',
        maxHeight: '600px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      }}
    >
      <Table stickyHeader size="small" aria-label="mentor attendance sheet">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, backgroundColor: '#f1f5f9', color: '#1e293b' }}>
              Date (MM/DD/YY)
            </TableCell>
            <TableCell sx={{ fontWeight: 700, backgroundColor: '#f1f5f9', color: '#1e293b' }}>
              Course Name
            </TableCell>
            <TableCell sx={{ fontWeight: 700, backgroundColor: '#f1f5f9', color: '#1e293b' }}>
              Batch Code
            </TableCell>
            <TableCell sx={{ fontWeight: 700, backgroundColor: '#f1f5f9', color: '#1e293b' }}>
              Interview / Type
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, backgroundColor: '#f1f5f9', color: '#0d75fc' }}>
              Hours
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 700, backgroundColor: '#f1f5f9', color: '#1e293b' }}>
              Host
            </TableCell>
            <TableCell sx={{ fontWeight: 700, backgroundColor: '#f1f5f9', color: '#1e293b' }}>
              Comments (Combined Batches)
            </TableCell>
            <TableCell sx={{ fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569' }}>
              Scheduled Date
            </TableCell>
            <TableCell sx={{ fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569' }}>
              Scheduled Start
            </TableCell>
            <TableCell sx={{ fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569' }}>
              Scheduled End
            </TableCell>
            <TableCell sx={{ fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569' }}>
              Actual Joined
            </TableCell>
            <TableCell sx={{ fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569' }}>
              Actual Left
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {items.map((row, index) => {
            const combinedBatches = row.comments ? row.comments.split(',').map((c) => c.trim()) : [];

            return (
              <TableRow
                key={row.sessionId || index}
                hover
                sx={{
                  '&:nth-of-type(even)': { backgroundColor: '#f8fafc' },
                  '&:last-child td, &:last-child th': { border: 0 },
                }}
              >
                <TableCell sx={{ fontWeight: 600, color: 'var(--zen-text-main)' }}>
                  {row.date}
                </TableCell>
                <TableCell sx={{ color: 'var(--zen-text-secondary)', fontSize: '0.85rem' }}>
                  {row.courseName}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e40af' }}>
                    {row.batchCode}
                  </Typography>
                </TableCell>
                <TableCell sx={{ color: 'var(--zen-text-secondary)' }}>
                  {row.interview || 'Live Class'}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#0d75fc', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                  {formatHours(row.hours)}
                </TableCell>
                <TableCell align="center">
                  <Chip
                    size="small"
                    label={row.hostStatus || 'Done'}
                    sx={{
                      backgroundColor: row.hostStatus === 'Absent' ? '#fee2e2' : '#d1fae5',
                      color: row.hostStatus === 'Absent' ? '#991b1b' : '#065f46',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      height: '22px',
                    }}
                  />
                </TableCell>
                <TableCell>
                  {combinedBatches.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {combinedBatches.map((b, i) => (
                        <Chip
                          key={i}
                          label={b}
                          size="small"
                          sx={{
                            backgroundColor: '#e0f2fe',
                            color: '#0369a1',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            height: '20px',
                          }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="caption" sx={{ color: 'var(--zen-text-muted)' }}>-</Typography>
                  )}
                </TableCell>
                <TableCell sx={{ color: 'var(--zen-text-secondary)', fontSize: '0.8rem' }}>
                  {row.scheduledDate || '-'}
                </TableCell>
                <TableCell sx={{ color: 'var(--zen-text-secondary)', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {row.scheduledStartTime || '-'}
                </TableCell>
                <TableCell sx={{ color: 'var(--zen-text-secondary)', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {row.scheduledEndTime || '-'}
                </TableCell>
                <TableCell sx={{ color: '#059669', fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8rem' }}>
                  {row.actualJoinedTime || '-'}
                </TableCell>
                <TableCell sx={{ color: '#059669', fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8rem' }}>
                  {row.actualLeftTime || '-'}
                </TableCell>
              </TableRow>
            );
          })}

          {/* Footer Row matching Google Sheet Totals */}
          <TableRow sx={{ backgroundColor: '#f1f5f9', borderTop: '2px solid #cbd5e1' }}>
            <TableCell colSpan={3} sx={{ fontWeight: 800, color: 'var(--zen-text-main)' }}>
              TOTAL SUMMARY ({totalSessions} SESSIONS)
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: 'var(--zen-text-secondary)' }}>
              Total Hours:
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 800, color: '#0d75fc', fontFamily: 'monospace', fontSize: '1.05rem' }}>
              {formatHours(totalHours)}
            </TableCell>
            <TableCell colSpan={7} sx={{ color: 'var(--zen-text-muted)', fontSize: '0.8rem' }}>
              Calculated using peer duration rounded to 1 decimal place.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
