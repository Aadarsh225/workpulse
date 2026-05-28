import React from 'react';
import { User } from '../types';
import { 
  Sparkles, 
  LayoutDashboard, 
  CheckSquare, 
  FolderGit2, 
  Target, 
  BookOpen, 
  Compass, 
  BarChart3, 
  Settings, 
  LogOut, 
  Sun, 
  Moon 
} from 'lucide-react';

interface SidebarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onLogout: () => void;
}

export function Sidebar({ user, activeTab, setActiveTab, darkMode, setDarkMode, onLogout }: SidebarProps) {
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'notes', label: 'Notes', icon: BookOpen },
    { id: 'skills', label: 'Skills', icon: Compass },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-20 lg:w-64 bg-white dark:bg-zinc-900 border-r border-gray-150 dark:border-zinc-850 flex flex-col justify-between shrink-0 h-screen sticky top-0 font-sans z-30 transition-all duration-200 hidden md:flex">
      
      {/* Upper Navigation and Brand */}
      <div className="flex flex-col overflow-y-auto">
        
        {/* Brand Banner */}
        <div className="p-4 lg:p-6 border-b border-gray-150 dark:border-zinc-850 flex items-center justify-center lg:justify-start gap-3">
          <div className="h-9 w-9 bg-gradient-to-tr from-teal-500 to-indigo-650 rounded-xl flex items-center justify-center text-white shadow-md shadow-teal-500/10 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="hidden lg:block">
            <span className="font-bold text-lg text-gray-900 dark:text-zinc-50 tracking-tight leading-none block">
              WorkPulse
            </span>
            <span className="text-[10px] text-gray-550 dark:text-zinc-400 font-medium tracking-wide">
              SaaS Productivity Desk
            </span>
          </div>
        </div>

        {/* User Workspace Profile Card */}
        <div className="p-4 lg:p-5 border-b border-gray-100 dark:border-zinc-850/60 bg-gray-50/50 dark:bg-zinc-850/10 flex justify-center lg:justify-start">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-650 flex items-center justify-center text-white font-bold text-sm select-none border-2 border-white dark:border-zinc-900 shadow-sm shadow-zinc-500/10 shrink-0">
              {user.avatar || 'WP'}
            </div>
            <div className="min-w-0 hidden lg:block">
              <h4 className="font-semibold text-xs text-gray-800 dark:text-zinc-250 truncate">
                {user.name}
              </h4>
              <p className="text-[10px] text-gray-555 dark:text-zinc-400 capitalize truncate font-medium">
                {user.role} {user.company ? `@ ${user.company}` : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Vertical Menu Buttons */}
        <nav className="p-2 lg:p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={item.label}
                className={`w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-gray-950 dark:bg-teal-500 text-white dark:text-zinc-950 font-semibold shadow-md dark:shadow-teal-500/10' 
                    : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100/80 dark:hover:bg-zinc-850/60 hover:text-gray-900 dark:hover:text-zinc-100'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-white dark:text-zinc-950' : 'text-gray-400 dark:text-zinc-400'}`} />
                <span className="hidden lg:block truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Controls */}
      <div className="p-2 lg:p-4 border-t border-gray-100 dark:border-zinc-850 mt-auto bg-gray-50/20 dark:bg-zinc-900/45">
        
        {/* Theme Settings Line */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-2.5 p-2 lg:px-3 lg:py-2 mb-2 bg-gray-100/60 dark:bg-zinc-850 rounded-xl">
          <span className="text-[11px] font-medium text-gray-600 dark:text-zinc-400 flex items-center gap-1.5 hidden lg:flex">
            {darkMode ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
            Mode
          </span>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="h-7 w-12 bg-gray-200 dark:bg-zinc-800 rounded-full p-1 relative transition-colors cursor-pointer focus:outline-none shrink-0"
          >
            <div className={`h-5 w-5 bg-white dark:bg-zinc-100 rounded-full shadow-sm absolute top-1 transition-transform ${darkMode ? 'left-6' : 'left-1'}`} />
          </button>
        </div>

        {/* Logout Trigger */}
        <button
          onClick={onLogout}
          title="Exit Workspace"
          className="w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-2 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-955/10 font-bold text-xs transition-colors cursor-pointer"
        >
          <LogOut className="h-4.5 w-4.5 shrink-0" />
          <span className="hidden lg:block truncate text-ellipsis">Exit Workspace</span>
        </button>
      </div>

    </aside>
  );
}
