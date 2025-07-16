import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from './Header';

const MainLayout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative transition-colors duration-300 bg-gray-900">
      {/* Dark gradient background with images from public folder */}
      <div className="fixed inset-0 bg-gray-900">
        {/* Top gradient */}
        <div 
          className="absolute top-0 left-0 w-full h-1/2 opacity-60"
          style={{
            backgroundImage: 'url(/gradient-background-top.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'top center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        
        {/* Bottom gradient */}
        <div 
          className="absolute bottom-0 left-0 w-full h-1/2 opacity-40"
          style={{
            backgroundImage: 'url(/gradient-background-bottom.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'bottom center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        
        {/* Additional gradient overlays for depth */}
        <div 
          className="absolute top-0 left-0 w-full h-full opacity-20"
          style={{
            background: 'radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)'
          }}
        />
        
        {/* Dark overlay to ensure readability */}
        <div className="absolute inset-0 bg-gray-900/40" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <Header 
          onMenuToggle={() => {}}
          currentView=""
        />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 