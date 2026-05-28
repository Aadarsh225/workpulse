import React, { useState } from 'react';
import { api } from '../utils/api';
import { User } from '../types';
import { Sparkles, Mail, Lock, User as UserIcon, Briefcase, Building, ChevronRight, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthProps {
  onAuthSuccess: (user: User, token: string) => void;
}

type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

export function Auth({ onAuthSuccess }: AuthProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Developer');
  const [company, setCompany] = useState('');
  
  // Reset password states
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Status info
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [devTokenHint, setDevTokenHint] = useState('');

  const clearNotifications = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setDevTokenHint('');
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    clearNotifications();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter your email and password.');
      return;
    }
    setLoading(true);
    clearNotifications();
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;
      localStorage.setItem('workpulse_token', token);
      localStorage.setItem('workpulse_user', JSON.stringify(user));
      onAuthSuccess(user, token);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setErrorMsg('Please complete all required fields.');
      return;
    }
    setLoading(true);
    clearNotifications();
    try {
      const response = await api.post('/auth/register', {
        email,
        password,
        name,
        role,
        company
      });
      const { user, token } = response.data;
      localStorage.setItem('workpulse_token', token);
      localStorage.setItem('workpulse_user', JSON.stringify(user));
      onAuthSuccess(user, token);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please provide your registered email address.');
      return;
    }
    setLoading(true);
    clearNotifications();
    try {
      const response = await api.post('/auth/forgot-password', { email });
      setSuccessMsg(response.data.message || 'Reset token generated successfully.');
      if (response.data.token) {
        setDevTokenHint(response.data.token);
        setResetToken(response.data.token); // Automatically stage for they
      }
      setTimeout(() => {
        setMode('reset');
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Unable to handle password reset request.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !resetToken || !newPassword) {
      setErrorMsg('All fields are required to complete the reset.');
      return;
    }
    setLoading(true);
    clearNotifications();
    try {
      const response = await api.post('/auth/reset-password', {
        email,
        token: resetToken,
        newPassword
      });
      setSuccessMsg(response.data.message || 'Credentials reassigned perfectly!');
      setTimeout(() => {
        setMode('login');
        setPassword('');
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Could not verify token. Try requesting a new one.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gray-50 dark:bg-zinc-950 p-6">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-850 p-8 relative overflow-hidden">
        
        {/* Ambient top light streak for premium SaaS card decoration */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-500 via-indigo-500 to-purple-500" />

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-teal-500 to-indigo-600 rounded-xl text-white shadow-md shadow-teal-500/15 mb-3">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-50 font-sans">
            WorkPulse
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1 font-sans">
            Track Work. Build Skills. Measure Growth.
          </p>
        </div>

        {/* Dynamic Sub-header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-zinc-200">
            {mode === 'login' && 'Sign in to your account'}
            {mode === 'register' && 'Create your WorkPulse workspace'}
            {mode === 'forgot' && 'Reset secure password'}
            {mode === 'reset' && 'Define new password login'}
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            {mode === 'login' && 'Enter your credentials to access your productivity matrices.'}
            {mode === 'register' && 'No seeded setups. Every account receives dedicated personal databases.'}
            {mode === 'forgot' && 'We’ll stage a recovery code for your credentials instantly.'}
            {mode === 'reset' && 'Submit the 6-digit verification token to configure your fallback.'}
          </p>
          {mode === 'login' && (
            <div className="mt-3 p-3 bg-teal-50/55 dark:bg-teal-950/10 rounded-xl border border-teal-100/30 dark:border-teal-900/25 text-xs text-gray-600 dark:text-teal-450 flex items-center justify-between">
              <div>
                <span className="font-semibold block text-teal-850 dark:text-teal-300">Quick Test Drive:</span>
                <span className="font-mono text-[11px]">demo@company.com / password123</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmail('demo@company.com');
                  setPassword('password123');
                }}
                className="px-2 py-1 bg-teal-600 dark:bg-teal-500 hover:bg-teal-750 dark:hover:bg-teal-400 text-white dark:text-zinc-950 text-[10px] rounded font-bold transition-all shadow-sm cursor-pointer shrink-0 ml-3"
              >
                Autofill
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -8 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 rounded-lg text-xs font-medium border border-red-100 dark:border-red-950/40"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -8 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 flex items-start gap-2.5 p-3.5 bg-emerald-50 dark:bg-emerald-950/15 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-medium border border-emerald-100 dark:border-emerald-950/40"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p>{successMsg}</p>
              {devTokenHint && (
                <p className="mt-1 font-mono text-[10px] bg-emerald-100 dark:bg-emerald-950/40 p-1 rounded font-bold">
                  Demo recovery token: <span className="underline select-all">{devTokenHint}</span> (Auto-filled)
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Forms Switcher */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1">Email address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-3 py-2 text-sm bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/55 focus:border-transparent dark:text-zinc-100"
                />
                <Mail className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-gray-400" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-medium text-gray-700 dark:text-zinc-300">Password</label>
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-xs text-teal-600 dark:text-teal-400 hover:underline focus:outline-none"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2 text-sm bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/55 focus:border-transparent dark:text-zinc-100"
                />
                <Lock className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-gray-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg bg-gray-900 hover:bg-gray-800 dark:bg-teal-500 dark:hover:bg-teal-650 text-white font-medium text-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Sign In'}
              <ChevronRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sarah Jenkins"
                  className="w-full pl-10 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/55 focus:border-transparent dark:text-zinc-100"
                />
                <UserIcon className="absolute left-3.5 top-2 h-4.5 w-4.5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1">Email address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah@corp.com"
                  className="w-full pl-10 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/55 focus:border-transparent dark:text-zinc-100"
                />
                <Mail className="absolute left-3.5 top-2 h-4.5 w-4.5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/55 focus:border-transparent dark:text-zinc-100"
                />
                <Lock className="absolute left-3.5 top-2 h-4.5 w-4.5 text-gray-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1">Professional Role</label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-10 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/55 focus:border-transparent dark:text-zinc-100 appearance-none"
                  >
                    <option value="Developer">Developer</option>
                    <option value="Designer">Designer</option>
                    <option value="Manager">Product Manager</option>
                    <option value="Freelancer">Freelancer</option>
                    <option value="Student">Student</option>
                    <option value="Analyst">Analyst</option>
                    <option value="Founder">Executive</option>
                  </select>
                  <Briefcase className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1">Company/Team</label>
                <div className="relative">
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Independent"
                    className="w-full pl-10 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/55 focus:border-transparent dark:text-zinc-100"
                  />
                  <Building className="absolute left-3.5 top-2 h-4.5 w-4.5 text-gray-400" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg bg-teal-650 hover:bg-teal-700 text-white font-medium text-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Register Workspace'}
              <ChevronRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1">Account Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-3 py-2 text-sm bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/55 focus:border-transparent dark:text-zinc-100"
                />
                <Mail className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-gray-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg bg-gray-950 dark:bg-zinc-800 text-white hover:bg-gray-800 dark:hover:bg-zinc-700 font-medium text-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Request Reset Token'}
              <ChevronRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {mode === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1">Verify Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Confirm registered email"
                  className="w-full pl-10 pr-3 py-2 text-sm bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/55 focus:border-transparent dark:text-zinc-100"
                />
                <Mail className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1">6-Digit Reset Token</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Enter 6-digit verification code"
                  className="w-full pl-10 pr-3 py-2 text-sm bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/55 focus:border-transparent dark:text-zinc-100 font-mono tracking-widest text-center"
                />
                <Lock className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1">New Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Define secure password"
                  className="w-full pl-10 pr-3 py-2 text-sm bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/55 focus:border-transparent dark:text-zinc-100"
                />
                <Lock className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-gray-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg bg-teal-650 hover:bg-teal-700 text-white font-medium text-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Apply Credentials Update'}
              <ChevronRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* Auth Toggle Footers */}
        <div className="mt-8 pt-6 border-t border-gray-150 dark:border-zinc-800 text-center text-xs text-gray-500 dark:text-zinc-400">
          {mode === 'login' ? (
            <p>
              New here?{' '}
              <button
                type="button"
                onClick={() => switchMode('register')}
                className="font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
              >
                Create your custom profile
              </button>
            </p>
          ) : (
            <p>
              Remembered credentials?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
              >
                Sign back in
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
