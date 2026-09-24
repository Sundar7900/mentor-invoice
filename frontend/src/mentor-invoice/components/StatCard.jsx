import React from 'react';
import { Box, Typography } from '@mui/material';

export default function StatCard({ title, value, subtitle, icon: Icon, color = '#0d75fc', trend }) {
  return (
    <Box
      className="zen-stat-card"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
        <Typography variant="body2" sx={{ color: 'var(--zen-text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>
          {title}
        </Typography>
        {Icon && (
          <Box
            sx={{
              p: 1,
              borderRadius: '8px',
              backgroundColor: `${color}15`,
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon sx={{ fontSize: 20 }} />
          </Box>
        )}
      </Box>

      <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--zen-text-main)', mb: 0.5 }}>
        {value}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {subtitle && (
          <Typography variant="caption" sx={{ color: 'var(--zen-text-secondary)' }}>
            {subtitle}
          </Typography>
        )}
        {trend && (
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#10B981' }}>
            {trend}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
