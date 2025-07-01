import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthPageProps {
  onClose?: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onClose }) => {
  const { signUp, signIn, signInWithGoogle, user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Redirect if user is already logged in
  useEffect(() => {
    if (user && onClose) {
      onClose();
    }
  }, [user, onClose]);

  // Animated gradient background
  useEffect(() => {
    const animateGradient = () => {
      const element = document.getElementById('auth-gradient');
      if (element) {
        element.style.background = `
          linear-gradient(
            ${45 + Math.sin(Date.now() * 0.001) * 15}deg,
            rgba(6, 182, 212, 0.8) 0%,
            rgba(59, 130, 246, 0.8) 25%,
            rgba(147, 51, 234, 0.8) 50%,
            rgba(236, 72, 153, 0.8) 75%,
            rgba(6, 182, 212, 0.8) 100%
          )
        `;
      }
    };

    const interval = setInterval(animateGradient, 100);
    return () => clearInterval(interval);
  }, []);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Signup specific validations
    if (!isLogin) {
      if (!formData.fullName) {
        newErrors.fullName = 'Full name is required';
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');
    
    try {
      if (isLogin) {
        // Sign in
        const { data, error } = await signIn(formData.email, formData.password);
        
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setErrors({ general: 'Invalid email or password. Please try again.' });
          } else if (error.message.includes('Email not confirmed')) {
            setErrors({ general: 'Please check your email and click the confirmation link before signing in.' });
          } else {
            setErrors({ general: error.message });
          }
        } else if (data.user) {
          setSuccessMessage('Successfully signed in! Redirecting...');
          setTimeout(() => {
            if (onClose) onClose();
          }, 1500);
        }
      } else {
        // Sign up
        const { data, error } = await signUp(formData.email, formData.password, formData.fullName);
        
        if (error) {
          if (error.message.includes('User already registered')) {
            setErrors({ general: 'An account with this email already exists. Please sign in instead.' });
          } else {
            setErrors({ general: error.message });
          }
        } else if (data.user) {
          setSuccessMessage('Account created successfully! Please check your email to confirm your account.');
          // Clear form
          setFormData({ fullName: '', email: '', password: '', confirmPassword: '' });
        }
      }
    } catch (error: any) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const { error } = await signInWithGoogle();
      
      if (error) {
        setErrors({ general: 'Failed to sign in with Google. Please try again.' });
      }
    } catch (error: any) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
      console.error('Google auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear general error when user starts typing
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({ fullName: '', email: '', password: '', confirmPassword: '' });
    setErrors({});
    setSuccessMessage('');
  };

  const isFormValid = () => {
    if (isLogin) {
      return formData.email && formData.password && formData.password.length >= 6;
    } else {
      return formData.fullName && formData.email && formData.password && 
             formData.confirmPassword && formData.password === formData.confirmPassword &&
             formData.password.length >= 6;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Brand Showcase */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Animated Gradient Background */}
        <div 
          id="auth-gradient"
          className="absolute inset-0 opacity-90"
          style={{
            background: `linear-gradient(45deg, 
              rgba(6, 182, 212, 0.8) 0%, 
              rgba(59, 130, 246, 0.8) 25%, 
              rgba(147, 51, 234, 0.8) 50%, 
              rgba(236, 72, 153, 0.8) 75%, 
              rgba(6, 182, 212, 0.8) 100%)`
          }}
        />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-bounce-soft"></div>
        <div className="absolute bottom-32 right-16 w-24 h-24 bg-white/10 rounded-full blur-xl animate-bounce-soft" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white/10 rounded-full blur-xl animate-bounce-soft" style={{ animationDelay: '2s' }}></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          {/* Logo */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl shadow-lg">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">U</span>
                </div>
              </div>
              <h1 className="ml-4 text-3xl font-bold">UnifyJobs</h1>
            </div>
          </div>

          {/* Main Headline */}
          <div className="mb-8">
            <h2 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Your Unified
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80">
                Future Awaits
              </span>
            </h2>
            
            <p className="text-xl text-white/90 leading-relaxed mb-8 max-w-md">
              Join millions of professionals who've found their dream careers through our unified platform.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-400 mr-4 flex-shrink-0" />
              <span className="text-lg text-white/90">Access 100,000+ premium job opportunities</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-400 mr-4 flex-shrink-0" />
              <span className="text-lg text-white/90">Save favorites and track applications</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-400 mr-4 flex-shrink-0" />
              <span className="text-lg text-white/90">AI-powered resume builder included</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-400 mr-4 flex-shrink-0" />
              <span className="text-lg text-white/90">Real-time job alerts & notifications</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Action Hub */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-3 rounded-2xl shadow-lg">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">U</span>
                </div>
              </div>
              <h1 className="ml-3 text-2xl font-bold gradient-text">UnifyJobs</h1>
            </div>
          </div>

          {/* Form Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {isLogin ? 'Welcome Back' : 'Create Your Account'}
            </h2>
            <p className="text-gray-600 dark:text-slate-400">
              {isLogin 
                ? 'Sign in to access your personalized job dashboard' 
                : 'Join thousands of professionals finding their dream jobs'
              }
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                <p className="text-green-700 dark:text-green-400 text-sm font-medium">{successMessage}</p>
              </div>
            </div>
          )}

          {/* General Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
                <p className="text-red-700 dark:text-red-400 text-sm font-medium">{errors.general}</p>
              </div>
            </div>
          )}

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-6 py-4 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-300 font-semibold text-lg mb-6 group hover:shadow-lg dark:hover:shadow-cyan-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-400 font-medium">OR</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name (Signup only) */}
            {!isLogin && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 h-5 w-5" />
                  <input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className={`w-full pl-12 pr-4 py-4 border rounded-xl text-gray-900 dark:text-white bg-white dark:bg-slate-800 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:focus:ring-cyan-400/20 ${
                      errors.fullName 
                        ? 'border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400' 
                        : 'border-gray-300 dark:border-slate-600 focus:border-cyan-500 dark:focus:border-cyan-400'
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.fullName}</p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 h-5 w-5" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-12 pr-4 py-4 border rounded-xl text-gray-900 dark:text-white bg-white dark:bg-slate-800 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:focus:ring-cyan-400/20 ${
                    errors.email 
                      ? 'border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400' 
                      : 'border-gray-300 dark:border-slate-600 focus:border-cyan-500 dark:focus:border-cyan-400'
                  }`}
                  placeholder="Enter your email address"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 h-5 w-5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full pl-12 pr-12 py-4 border rounded-xl text-gray-900 dark:text-white bg-white dark:bg-slate-800 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:focus:ring-cyan-400/20 ${
                    errors.password 
                      ? 'border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400' 
                      : 'border-gray-300 dark:border-slate-600 focus:border-cyan-500 dark:focus:border-cyan-400'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password (Signup only) */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 h-5 w-5" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full pl-12 pr-12 py-4 border rounded-xl text-gray-900 dark:text-white bg-white dark:bg-slate-800 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:focus:ring-cyan-400/20 ${
                      errors.confirmPassword 
                        ? 'border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400' 
                        : 'border-gray-300 dark:border-slate-600 focus:border-cyan-500 dark:focus:border-cyan-400'
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Forgot Password (Login only) */}
            {isLogin && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid() || isLoading}
              className={`w-full flex items-center justify-center px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform ${
                isFormValid() && !isLoading
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-500 dark:to-blue-600 hover:from-cyan-600 hover:to-blue-700 dark:hover:from-cyan-600 dark:hover:to-blue-700 text-white shadow-lg hover:shadow-xl dark:shadow-cyan-500/25 dark:hover:shadow-cyan-500/40 hover:scale-105'
                  : 'bg-gray-300 dark:bg-slate-700 text-gray-500 dark:text-slate-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </div>
              ) : (
                <div className="flex items-center">
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </button>
          </form>

          {/* Toggle Auth Mode */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-slate-400">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={toggleAuthMode}
                className="font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>

          {/* Terms & Privacy (Signup only) */}
          {!isLogin && (
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 dark:text-slate-500 leading-relaxed">
                By creating an account, you agree to our{' '}
                <a href="#" className="text-cyan-600 dark:text-cyan-400 hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-cyan-600 dark:text-cyan-400 hover:underline">Privacy Policy</a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;