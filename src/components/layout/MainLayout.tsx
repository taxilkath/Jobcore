import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from './Header';

const MainLayout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <Header 
        onMenuToggle={() => {}} // This might be handled differently or removed
        onNavigateToPlatforms={() => navigate('/platforms')}
        onNavigateHome={() => navigate('/')}
        onNavigateToAuth={() => navigate('/auth')}
        onNavigateToDashboard={() => navigate('/dashboard')}
        currentView="" // This will be replaced by active route highlighting
      />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout; 