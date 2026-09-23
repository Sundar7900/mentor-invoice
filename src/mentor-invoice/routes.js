import React from 'react';

/**
 * Feature Route Configuration adhering to HACKATHON_RULES.md (Rule 2 & Rule 3)
 * Exports [{ path, component: React.lazy(...), permission }]
 */
const routes = [
  {
    path: '/mentor-invoice',
    component: React.lazy(() => import('./pages/DashboardPage')),
    permission: 'mentor-invoice.view',
    exact: true,
  },
  {
    path: '/mentor-invoice/sheet/:mentorHash',
    component: React.lazy(() => import('./pages/InvoiceSheetView')),
    permission: 'mentor-invoice.view',
  },
  {
    path: '/mentor-invoice/rates',
    component: React.lazy(() => import('./pages/MentorRatesPage')),
    permission: 'mentor-invoice.edit',
  },
];

export default routes;
