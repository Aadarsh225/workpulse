import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../utils/api';
import { 
  User as UserIcon, 
  Lock, 
  ShieldAlert, 
  Bell, 
  HelpCircle, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';

interface SettingsViewProps {
  user: User;
  onUpdateUser: (newUser: User) => void;
  onDeleteAccount: () => void;
}

export function SettingsView({ user, onUpdateUser, onDeleteAccount }: SettingsViewProps) {
  // Profile update states
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role || 'Developer');
  const [company, setCompany] = useState(user.company || '');
  const [bio, setBio] = useState(user.bio || '');
  const [avatar, setAvatar] = useState(user.avatar || 'WP');

  // Password update states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Preference toggles
  const [notifyTasks, setNotifyTasks] = useState(true);
  const [notifyAnalytics, setNotifyAnalytics] = useState(true);

  // Status banners
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPwd, setLoadingPwd] = useState(false);

  // Account eradication safeguard
  const [safetyCheck, setSafetyCheck] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setProfileError('Full Name is required.');
      return;
    }
    setLoadingProfile(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      // Automatic avatar generation from initials
      const computedAvatar = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
      const response = await api.put('/auth/profile', {
        name,
        role,
        company,
        bio,
        avatar: computedAvatar
      });
      onUpdateUser(response.data.user);
      setAvatar(computedAvatar);
      setProfileSuccess(response.data.message || 'Profile parameters updated successfully!');
    } catch (err: any) {
      setProfileError(err.response?.data?.error || 'Failed to modify profile details.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setPwdError('Please complete all credential fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('Confirmed password matching failed.');
      return;
    }
    setLoadingPwd(true);
    setPwdError('');
    setPwdSuccess('');

    try {
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      setPwdSuccess(response.data.message || 'Credentials updated successfully. Security updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwdError(err.response?.data?.error || 'Authentication check failed. Invalid current password.');
    } finally {
      setLoadingPwd(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (safetyCheck !== 'DELETE') {
      alert('Please type the confirmation flag DELETE in the box to dispose of your data.');
      return;
    }
    if (!confirm('This will wipe all records permanently. This action is terminal. Continue?')) {
      return;
    }
    try {
      await api.delete('/auth/delete-account');
      onDeleteAccount();
    } catch (err) {
      console.error('Failed to eliminate workspace credentials:', err);
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-4xl mx-auto w-full font-sans">
      
      {/* Upper header */}
      <div className="border-b border-gray-150 dark:border-zinc-850 pb-5">
        <h1 className="text-2xl font-bold text-gray-901 dark:text-zinc-50">Settings Panel</h1>
        <p className="text-xs text-gray-550">Adjust personal professional metrics, change password, or configure system togglers.</p>
      </div>

      <div className="space-y-6">
        
        {/* Profile Card component */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850/80 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <UserIcon className="h-4.5 w-4.5 text-teal-500" />
            <h2 className="text-sm font-bold text-gray-900 dark:text-zinc-50">Workplace Metadata & Bio</h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {profileSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/15 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}
            
            {profileError && (
              <div className="p-3 bg-red-50 dark:bg-red-955/15 text-red-655 dark:text-red-400 rounded-lg text-xs font-semibold flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-5 items-start md:items-center">
              <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-650 flex items-center justify-center text-white text-lg font-black shrink-0 relative outline outline-offset-2 outline-gray-100 dark:outline-zinc-850">
                {avatar}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-gray-900 dark:text-zinc-100 block">Workspace Avatar Initials</span>
                <span className="text-[11px] text-gray-455 block mt-0.5">Determined automatically based on your current Full Name.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-750 dark:text-zinc-350 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-gray-55/65 dark:bg-zinc-950/65 border border-gray-150 dark:border-zinc-800 rounded-xl focus:outline-none dark:text-zinc-50 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-701 dark:text-zinc-350 mb-1">Professional Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Developer"
                  className="w-full px-3 py-1.5 text-xs bg-gray-55/65 dark:bg-zinc-950/65 border border-gray-150 dark:border-zinc-800 rounded-xl focus:outline-none dark:text-zinc-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-701 dark:text-zinc-350 mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Independent"
                  className="w-full px-3 py-1.5 text-xs bg-gray-55/65 dark:bg-zinc-950/65 border border-gray-150 dark:border-zinc-800 rounded-xl focus:outline-none dark:text-zinc-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-701 dark:text-zinc-350 mb-1">Biography Statement</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write a brief description of key responsibilities, workflows or competencies details..."
                rows={2}
                className="w-full px-3 py-1.5 text-xs bg-gray-55/65 dark:bg-zinc-950/65 border border-gray-150 dark:border-zinc-800 rounded-xl focus:outline-none dark:text-zinc-50 resize-none font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={loadingProfile}
              className="px-4.5 py-2.5 bg-gray-950 hover:bg-gray-850 dark:bg-teal-500 dark:hover:bg-teal-655 text-white dark:text-zinc-950 font-bold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {loadingProfile ? <RefreshCw className="h-4 w-4 animate-spin text-teal-400" /> : 'Save Profile details'}
            </button>
          </form>
        </div>

        {/* Credentials Security Panel */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850/80 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-4.5 w-4.5 text-teal-500" />
            <h2 className="text-sm font-bold text-gray-901 dark:text-zinc-50">Change Account Password</h2>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {pwdSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/15 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>{pwdSuccess}</span>
              </div>
            )}

            {pwdError && (
              <div className="p-3 bg-red-50 dark:bg-red-955/15 text-red-655 dark:text-red-400 rounded-lg text-xs font-semibold flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4" />
                <span>{pwdError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-701 dark:text-zinc-350 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-gray-55/65 dark:bg-zinc-950/65 border border-gray-150 dark:border-zinc-805 rounded-xl focus:outline-none dark:text-zinc-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-701 dark:text-zinc-350 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-gray-55/65 dark:bg-zinc-950/65 border border-gray-150 dark:border-zinc-805 rounded-xl focus:outline-none dark:text-zinc-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-701 dark:text-zinc-350 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-gray-55/65 dark:bg-zinc-950/65 border border-gray-150 dark:border-zinc-805 rounded-xl focus:outline-none dark:text-zinc-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingPwd}
              className="px-4.5 py-2.5 bg-gray-950 hover:bg-gray-850 dark:bg-teal-500 dark:hover:bg-teal-655 text-white dark:text-zinc-950 font-bold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {loadingPwd ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Apply Security Password'}
            </button>
          </form>
        </div>

        {/* Notifications and default choices */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 p-5 rounded-3xl shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4.5 w-4.5 text-teal-505" />
            <h2 className="text-sm font-bold text-gray-901 dark:text-zinc-50">Preferences & Diagnostics</h2>
          </div>

          <p className="text-xs text-gray-550 leading-relaxed max-w-2xl font-sans">
            Configure system status feedback rules or diagnostics. The secure backend maintains persistent records.
          </p>

          <div className="space-y-3 pt-1 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-gray-50/60 dark:bg-zinc-850/30 border border-gray-100 dark:border-zinc-850 rounded-xl">
              <div>
                <span className="font-semibold text-gray-800 dark:text-zinc-200 block">Workspace Notifications</span>
                <p className="text-[10px] text-gray-500 mt-0.5">Toggle live alerts upon resolving specific milestones or tasks.</p>
              </div>
              <button
                onClick={() => setNotifyTasks(!notifyTasks)}
                className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${notifyTasks ? 'bg-teal-500 text-zinc-950' : 'bg-gray-250 dark:bg-zinc-802 text-gray-555'}`}
              >
                {notifyTasks ? 'Enabled' : 'Muted'}
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-gray-50/60 dark:bg-zinc-850/30 border border-gray-100 dark:border-zinc-850 rounded-xl">
              <div>
                <span className="font-semibold text-gray-850 dark:text-zinc-200 block">Automated Performance Summaries</span>
                <p className="text-[10px] text-gray-500 mt-0.5">Allow automatic pre-calculating of charts indices server-side.</p>
              </div>
              <button
                onClick={() => setNotifyAnalytics(!notifyAnalytics)}
                className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${notifyAnalytics ? 'bg-teal-500 text-zinc-950' : 'bg-gray-250 dark:bg-zinc-800 text-gray-550'}`}
              >
                {notifyAnalytics ? 'Enabled' : 'Muted'}
              </button>
            </div>
          </div>
        </div>

        {/* Accountability Danger safeguard Zone */}
        <div className="bg-red-50/10 dark:bg-red-955/5 border border-red-100 dark:border-red-955/20 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center gap-2 text-red-655 dark:text-red-400 mb-2">
            <ShieldAlert className="h-4.5 w-4.5" />
            <span className="text-sm font-bold text-gray-900 dark:text-zinc-150">Workspace Safeguards: Danger Zone</span>
          </div>

          <p className="text-xs text-gray-500 max-w-xl mb-4 leading-relaxed font-sans">
            Deleting your WorkPulse workspace is terminal. All project details, tracked skills matrices, code snippets, notes documents and tasks will be erased permanently from our databases immediately.
          </p>

          <div className="space-y-3 max-w-md">
            <div>
              <label className="block text-xs font-bold text-gray-655 dark:text-zinc-350 mb-1.5">To confirm deletion, type the word <span className="font-black text-red-600 dark:text-red-400 underline select-all font-mono">DELETE</span> in the box below:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type DELETE"
                  value={safetyCheck}
                  onChange={(e) => setSafetyCheck(e.target.value)}
                  className="px-3.5 py-2 text-xs bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none dark:text-zinc-50 font-mono"
                />
                <button
                  onClick={handleDeleteWorkspace}
                  disabled={safetyCheck !== 'DELETE'}
                  className="px-4.5 py-2 bg-red-600 hover:bg-red-700 hover:dark:bg-red-650 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-colors shrink-0 cursor-pointer disabled:cursor-not-allowed"
                >
                  Dispose Workspace Account
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
