import { useState, useEffect } from 'react';
import { User, Task, Project, Goal, Skill, Note } from './types';
import { api } from './utils/api';
import { Auth } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { TasksView } from './components/TasksView';
import { ProjectsView } from './components/ProjectsView';
import { GoalsView } from './components/GoalsView';
import { NotesView } from './components/NotesView';
import { SkillsView } from './components/SkillsView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { 
  Sparkles, 
  Menu, 
  Bell, 
  Search, 
  User as UserIcon, 
  Moon, 
  Sun, 
  BookMarked,
  Info,
  X,
  LayoutDashboard, 
  CheckSquare, 
  FolderGit2, 
  Target, 
  BookOpen, 
  Compass, 
  BarChart3, 
  Settings, 
  LogOut
} from 'lucide-react';

export default function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('workpulse_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('workpulse_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Dynamic persistent theme toggle
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('workpulse_theme');
    if (saved) return saved === 'dark';
    return true; // Default to immersive dark mode for sleek modern SaaS look
  });

  // Global state arrays for unified caching and reactivity, initialized synchronously from localStorage fallbacks
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('workpulse_tasks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('workpulse_projects');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    try {
      const saved = localStorage.getItem('workpulse_goals');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [skills, setSkills] = useState<Skill[]>(() => {
    try {
      const saved = localStorage.getItem('workpulse_skills');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem('workpulse_notes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [loadingWorkspace, setLoadingWorkspace] = useState(false);

  // Synchronize state back to localStorage whenever altered
  useEffect(() => {
    localStorage.setItem('workpulse_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('workpulse_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('workpulse_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('workpulse_skills', JSON.stringify(skills));
  }, [skills]);

  useEffect(() => {
    localStorage.setItem('workpulse_notes', JSON.stringify(notes));
  }, [notes]);

  // Set dark theme class list node
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('workpulse_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('workpulse_theme', 'light');
    }
  }, [darkMode]);

  // Unified workspace synchronized fetch trigger
  const fetchWorkspaceData = async () => {
    if (!token) return;
    try {
      setLoadingWorkspace(true);
      const [tskRes, prjRes, golRes, sklRes, nteRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/projects'),
        api.get('/goals'),
        api.get('/skills'),
        api.get('/notes')
      ]);
      setTasks(tskRes.data);
      setProjects(prjRes.data);
      setGoals(golRes.data);
      setSkills(sklRes.data);
      setNotes(nteRes.data);
    } catch (err) {
      console.error('Unified workspace data synchronization failed:', err);
    } finally {
      setLoadingWorkspace(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchWorkspaceData();
    }
  }, [token]);

  const handleAuthSuccess = (authenticatedUser: User, receivedToken: string) => {
    localStorage.setItem('workpulse_token', receivedToken);
    localStorage.setItem('workpulse_user', JSON.stringify(authenticatedUser));
    setUser(authenticatedUser);
    setToken(receivedToken);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('workpulse_token');
    localStorage.removeItem('workpulse_user');
    localStorage.removeItem('workpulse_tasks');
    localStorage.removeItem('workpulse_projects');
    localStorage.removeItem('workpulse_goals');
    localStorage.removeItem('workpulse_skills');
    localStorage.removeItem('workpulse_notes');
    setToken(null);
    setUser(null);
    setTasks([]);
    setProjects([]);
    setGoals([]);
    setSkills([]);
    setNotes([]);
  };

  const handleProfileUpdated = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('workpulse_user', JSON.stringify(updatedUser));
  };

  // If unauthorized, render Auth card
  if (!token || !user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen w-full flex bg-gray-50 dark:bg-zinc-950 dark:text-zinc-150 transition-colors duration-200">
      
      {/* Left Sidebar Frame */}
      <Sidebar 
        user={user} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        onLogout={handleLogout} 
      />

      {/* Mobile Drawer Slide-open Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop blur overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
            onClick={() => setIsSidebarOpen(false)}
          />
          
          {/* Sliding sidebar body */}
          <div className="relative w-64 max-w-xs bg-white dark:bg-zinc-900 border-r border-gray-150 dark:border-zinc-850 flex flex-col justify-between h-full z-10 animate-in slide-in-from-left duration-200">
            <div className="flex flex-col overflow-y-auto">
              {/* Brand Header */}
              <div className="p-6 border-b border-gray-150 dark:border-zinc-850 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-gradient-to-tr from-teal-500 to-indigo-650 rounded-xl flex items-center justify-center text-white shadow-md shadow-teal-500/10 shrink-0">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-bold text-base text-gray-900 dark:text-zinc-50 tracking-tight leading-none block">
                      WorkPulse
                    </span>
                    <span className="text-[10px] text-gray-550 dark:text-zinc-400 font-medium tracking-wide">
                      SaaS Productivity Desk
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 text-gray-405 hover:text-gray-600 dark:hover:text-zinc-200 rounded-lg bg-gray-50 dark:bg-zinc-850"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* User Workspace Profile Card */}
              <div className="p-5 border-b border-gray-100 dark:border-zinc-850/60 bg-gray-50/50 dark:bg-zinc-850/10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-650 flex items-center justify-center text-white font-bold text-sm select-none border-2 border-white dark:border-zinc-900 shadow-sm shadow-zinc-500/10 shrink-0">
                    {user.avatar || 'WP'}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-xs text-gray-800 dark:text-zinc-250 truncate">
                      {user.name}
                    </h4>
                    <p className="text-[10px] text-gray-555 dark:text-zinc-400 capitalize truncate font-medium">
                      {user.role} {user.company ? `@ ${user.company}` : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation list */}
              <nav className="p-4 space-y-1">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
                  { id: 'projects', label: 'Projects', icon: FolderGit2 },
                  { id: 'goals', label: 'Goals', icon: Target },
                  { id: 'notes', label: 'Notes', icon: BookOpen },
                  { id: 'skills', label: 'Skills', icon: Compass },
                  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                  { id: 'settings', label: 'Settings', icon: Settings },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-gray-950 dark:bg-teal-500 text-white dark:text-zinc-950 font-semibold shadow-md' 
                          : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100/80 dark:hover:bg-zinc-850/60 hover:text-gray-900 dark:hover:text-zinc-100'
                      }`}
                    >
                      <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-white dark:text-zinc-955' : 'text-gray-400 dark:text-zinc-450'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Bottom controllers */}
            <div className="p-4 border-t border-gray-100 dark:border-zinc-850 mt-auto bg-gray-50/20 dark:bg-zinc-900/45">
              <div className="flex items-center justify-between px-3 py-2 mb-2 bg-gray-100/60 dark:bg-zinc-850 rounded-xl">
                <span className="text-[11px] font-medium text-gray-650 dark:text-zinc-400 flex items-center gap-1.5">
                  {darkMode ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
                  Mode
                </span>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="h-7 w-12 bg-gray-200 dark:bg-zinc-800 rounded-full p-1 relative transition-colors cursor-pointer focus:outline-none"
                >
                  <div className={`h-5 w-5 bg-white dark:bg-zinc-100 rounded-full shadow-sm absolute top-1 transition-transform ${darkMode ? 'left-6' : 'left-1'}`} />
                </button>
              </div>

              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-955/10 font-bold text-xs transition-colors cursor-pointer"
              >
                <LogOut className="h-4.5 w-4.5 shrink-0" />
                <span>Exit Workspace</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main workspace container */}
      <div className="flex-1 flex flex-col min-h-screen max-w-full overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-gray-150 dark:border-zinc-850 bg-white dark:bg-zinc-900 flex items-center justify-between px-4 md:px-6 shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            {/* Hamburger toggle for mobile devices */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 -ml-1 text-gray-550 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-850 transition-colors md:hidden cursor-pointer"
              aria-label="Open sidebar"
              title="Open Navigation"
            >
              <Menu className="h-5 w-5" />
            </button>

            <h1 className="text-xs md:text-sm font-bold text-gray-800 dark:text-zinc-200 tracking-tight flex items-center gap-1.5 uppercase font-mono max-w-[150px] xs:max-w-xs sm:max-w-none truncate">
              <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse shrink-0" />
              Workspace Matrix: {activeTab}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Sync spinner */}
            {loadingWorkspace && (
              <span className="text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400 animate-pulse">
                Synchronizing data...
              </span>
            )}

            {/* Top Notifications Indicator */}
            <div className="relative">
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition-colors cursor-pointer rounded-lg bg-gray-50 dark:bg-zinc-850">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-teal-500 rounded-full" />
              </button>
            </div>

            {/* Quick user avatar */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-700 dark:text-zinc-300 hidden md:block select-none">{user.name}</span>
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-650 flex items-center justify-center text-white text-xs font-bold shadow-sm select-none">
                {user.avatar || 'WP'}
              </div>
            </div>

          </div>
        </header>

        {/* Dynamic Inner Tab Frame */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'dashboard' && (
            <DashboardView 
              userName={user.name} 
              onNavigate={setActiveTab} 
              triggerRefreshTasks={fetchWorkspaceData}
              tasksList={tasks}
              projectsList={projects}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksView 
              tasks={tasks} 
              triggerRefresh={fetchWorkspaceData} 
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsView 
              projects={projects} 
              triggerRefresh={fetchWorkspaceData} 
            />
          )}

          {activeTab === 'goals' && (
            <GoalsView 
              goals={goals} 
              triggerRefresh={fetchWorkspaceData} 
            />
          )}

          {activeTab === 'notes' && (
            <NotesView 
              notes={notes} 
              triggerRefresh={fetchWorkspaceData} 
            />
          )}

          {activeTab === 'skills' && (
            <SkillsView 
              skills={skills} 
              triggerRefresh={fetchWorkspaceData} 
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView 
              userName={user.name} 
              role={user.role || 'Professional'} 
              tasksList={tasks}
              projectsList={projects}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView 
              user={user} 
              onUpdateUser={handleProfileUpdated} 
              onDeleteAccount={handleLogout} 
            />
          )}
        </main>

      </div>

    </div>
  );
}
