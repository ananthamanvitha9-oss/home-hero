import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import { GlobalStyles } from './styles/GlobalStyles';
import { ToastProvider } from './components/Toast';
import { ResponsiveHeader } from './components/ResponsiveHeader';
import { BookingForm } from './pages/BookingForm';
import { TechnicianDashboard } from './pages/TechnicianDashboard';
import { AdminAnalytics } from './pages/AdminAnalytics';

const App = () => (
  <ThemeProvider theme={theme}>
    <GlobalStyles />
    <ToastProvider>
      <Router>
        <ResponsiveHeader />
        <Routes>
          <Route path="/" element={<Navigate to="/booking" replace />} />
          <Route path="/booking" element={<BookingForm />} />
          <Route path="/technician" element={<TechnicianDashboard />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
        </Routes>
      </Router>
    </ToastProvider>
  </ThemeProvider>
);

export default App;
