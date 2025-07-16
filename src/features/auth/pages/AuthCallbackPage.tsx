import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

const AuthCallbackPage: React.FC = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen transition-colors duration-300">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Authenticating...
        </h1>
        <p className="text-gray-600 dark:text-slate-400">
          Please wait while we log you in.
        </p>
      </div>
    </div>
  );
};

export default AuthCallbackPage; 