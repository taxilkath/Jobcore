import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import JobsPage from './pages/JobsPage';
import PlatformDirectory from './components/PlatformDirectory';
import PlatformCompanies from './components/PlatformCompanies';
import CompanyJobs from './components/CompanyJobs';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import AuthCallbackPage from './pages/AuthCallbackPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/platforms" element={<PlatformDirectory />} />
          <Route path="/platforms/:platformId" element={<PlatformCompanies />} />
          <Route path="/platforms/:platformId/companies/:companyId" element={<CompanyJobs />} />
          <Route path="/dashboard" element={<Dashboard onNavigateHome={() => {}} />} />
        </Route>
        <Route path="/auth" element={<AuthPage onClose={() => {}} />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;