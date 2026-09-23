import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import App from './App';
import './mentor-invoice/styles/mentorInvoice.css';
import { configureApiClient } from './mentor-invoice/apiCalls/mentorInvoiceApi';

// Standard Zen portal Redux slice containing authToken following HACKATHON_RULES.md
const commonDataSlice = {
  name: 'commonData',
  initialState: {
    authToken: 'admin-user-hash-999:zen',
    userRole: 'admin',
    permissions: {
      'mentor-invoice': { read: true, write: true },
    },
  },
  reducers: {},
};

const store = configureStore({
  reducer: {
    reducers: {
      commonData: (state = commonDataSlice.initialState) => state,
    },
  },
});

// Connect API client to Redux store
configureApiClient(store.getState);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
