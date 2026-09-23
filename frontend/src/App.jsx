import React, { Suspense } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Chip,
  Avatar,
  CircularProgress,
  Container,
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

import routes from './mentor-invoice/routes';
import navItems from './mentor-invoice/navItems';

export default function App() {
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Zen Portal Navigation Header */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          color: '#1F252D',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: '64px', display: 'flex', justifyContent: 'space-between' }}>
            {/* Logo and Brand */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    backgroundColor: '#0d75fc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                  }}
                >
                  Z
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1F252D', letterSpacing: -0.5 }}>
                  Zen <span style={{ color: '#0d75fc' }}>Portal</span>
                </Typography>
              </Box>

              <Chip
                label="TENANT: ZEN"
                size="small"
                sx={{
                  backgroundColor: '#e8f2fe',
                  color: '#0d75fc',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  letterSpacing: 0.5,
                }}
              />

              {/* Navigation Items exported from feature navItems.js */}
              <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                {navItems.map((item) => {
                  const isActive = location.pathname === item.route;
                  return (
                    <Button
                      key={item.key}
                      component={Link}
                      to={item.route}
                      startIcon={item.image === 'receipt_long' ? <ReceiptLongIcon /> : <AccountBalanceIcon />}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        color: isActive ? '#0d75fc' : '#495565',
                        backgroundColor: isActive ? '#e8f2fe' : 'transparent',
                        borderRadius: '8px',
                        px: 2,
                        '&:hover': {
                          backgroundColor: isActive ? '#e8f2fe' : '#f1f5f9',
                        },
                      }}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </Box>
            </Box>

            {/* User Profile */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1F252D', lineHeight: 1.2 }}>
                  Operations Admin
                </Typography>
                <Typography variant="caption" sx={{ color: '#5E7087' }}>
                  Billing & Attendance Coordinator
                </Typography>
              </Box>
              <Avatar sx={{ width: 36, height: 36, backgroundColor: '#0d75fc', fontWeight: 700, fontSize: '0.9rem' }}>
                OA
              </Avatar>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, py: 3 }}>
        <Suspense
          fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
              <CircularProgress size={40} sx={{ color: '#0d75fc' }} />
            </Box>
          }
        >
          <Routes>
            <Route path="/" element={<Navigate to="/mentor-invoice" replace />} />
            {routes.map((r) => {
              const Component = r.component;
              return <Route key={r.path} path={r.path} element={<Component />} />;
            })}
          </Routes>
        </Suspense>
      </Box>
    </Box>
  );
}
