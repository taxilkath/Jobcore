import React from 'react';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import HomePage from './features/home/pages/HomePage';
import JobsPage from './features/jobs/pages/JobsPage';
import PlatformDirectory from './features/company/components/PlatformDirectory';
import PlatformCompanies from './features/home/components/PlatformCompanies';
import CompanyJobs from './features/jobs/components/CompanyJobs';
import AuthPage from './features/auth/components/AuthPage';
import Dashboard from './features/dashboard/components/Dashboard';
import AuthCallbackPage from './features/auth/pages/AuthCallbackPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/platforms" element={<PlatformDirectory />} />
          <Route path="/platforms/:platformId" element={<PlatformCompanies />} />
          <Route path="/platforms/:platformId/:companyId" element={<CompanyJobs />} />
          <Route path="/dashboard" element={<Dashboard onNavigateHome={() => {}} />} />
        </Route>
        <Route path="/auth" element={<AuthPage onClose={() => {}} />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
      </Routes>
      <Toaster richColors position="bottom-right" />
    </AuthProvider>
  );
}

export default App;