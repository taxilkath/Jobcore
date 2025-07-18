import { LayoutDashboard, LogOut, Menu, Moon, Sun, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AnimatedBorder from '../ui/AnimatedBorder';

interface HeaderProps {
  onMenuToggle?: () => void;
  currentView?: string;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, currentView }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (mobileMenuOpen && !target.closest('.mobile-menu-container')) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [mobileMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg z-40 border-b border-gray-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo and Menu */}
        <div className="mobile-menu-container flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-800 dark:text-white">
            <svg className="h-8 w-8 text-accent" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5z" />
            </svg>
            <span>JobCore</span>
          </Link>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-1">
          <NavLink to="/jobs" className={({isActive}) => `px-4 py-2 rounded-xl text-sm font-semibold transition-all ${isActive ? 'text-accent bg-accent/5' : 'text-gray-600 dark:text-gray-300 hover:text-accent hover:bg-accent/5'}`}>
            Find Jobs
          </NavLink>
          <NavLink to="/platforms" className={({isActive}) => `px-4 py-2 rounded-xl text-sm font-semibold transition-all ${isActive ? 'text-accent bg-accent/5' : 'text-gray-600 dark:text-gray-300 hover:text-accent hover:bg-accent/5'}`}>
             Platforms
          </NavLink>
          {user && (
            <NavLink to="/dashboard" className={({isActive}) => `px-4 py-2 rounded-xl text-sm font-semibold transition-all ${isActive ? 'text-accent bg-accent/5' : 'text-gray-600 dark:text-gray-300 hover:text-accent hover:bg-accent/5'}`}>
              Dashboard
            </NavLink>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative">
              <AnimatedBorder>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)} 
                  className="flex items-center gap-2 p-1 pr-3 rounded-full bg-gray-100/50 dark:bg-slate-800/50 "
                >
                  <img src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=random`} alt="User" className="w-8 h-8 rounded-full" />
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 hidden md:block">{user.user_metadata?.full_name || user.email}</span>
                </button>
              </AnimatedBorder>
              {dropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg py-2 border border-gray-200 dark:border-slate-700 animate-fade-in-up"
                >
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-slate-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.user_metadata?.full_name}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{user.email}</p>
                  </div>
                  <div className="mt-2">
                    <Link
                      to="/dashboard"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth" className="btn-secondary px-4 py-2 rounded-lg text-sm">
              Sign In
            </Link>
          )}

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            {isDark ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-slate-600" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Mobile Menu Panel */}
          <div className="mobile-menu-container fixed top-16 left-0 right-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 z-50 md:hidden shadow-lg animate-slide-in">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <nav className="space-y-2">
                <NavLink 
                  to="/jobs" 
                  className={({isActive}) => `block px-4 py-3 rounded-xl text-base font-semibold transition-all ${isActive ? 'text-accent bg-accent/5' : 'text-gray-600 dark:text-gray-300 hover:text-accent hover:bg-accent/5'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Find Jobs
                </NavLink>
                <NavLink 
                  to="/platforms" 
                  className={({isActive}) => `block px-4 py-3 rounded-xl text-base font-semibold transition-all ${isActive ? 'text-accent bg-accent/5' : 'text-gray-600 dark:text-gray-300 hover:text-accent hover:bg-accent/5'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse Platforms
                </NavLink>
                {user && (
                  <NavLink 
                    to="/dashboard" 
                    className={({isActive}) => `block px-4 py-3 rounded-xl text-base font-semibold transition-all ${isActive ? 'text-accent bg-accent/5' : 'text-gray-600 dark:text-gray-300 hover:text-accent hover:bg-accent/5'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </NavLink>
                )}
                
                {/* Mobile Auth Section */}
                {!user && (
                  <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                    <Link 
                      to="/auth" 
                      className="block w-full btn-secondary px-4 py-3 rounded-xl text-base font-semibold text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;