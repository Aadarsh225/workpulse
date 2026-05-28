import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { AnalyticsSummary, Task, Project } from '../types';
import { 
  CheckCircle2, 
  Hourglass, 
  Flame, 
  TrendingUp, 
  Briefcase, 
  ChevronRight, 
  CircleDot, 
  ListTodo, 
  GitCommit, 
  ArrowUpRight,
  PlusCircle,
  FileSpreadsheet
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardViewProps {
  userName: string;
  onNavigate: (tab: string) => void;
  triggerRefreshTasks: () => void;
  tasksList: Task[];
  projectsList: Project[];
}

export function DashboardView({ userName, onNavigate, triggerRefreshTasks, tasksList, projectsList }: DashboardViewProps) {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [logs, setLogs] = useState<{ id: string; action: string; details: string; timestamp: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [resAnalytics, resLogs] = await Promise.all([
        api.get('/analytics'),
        api.get('/activity-logs')
      ]);
      setData(resAnalytics.data);
      setLogs(resLogs.data);
    } catch (err) {
      console.error('Failed to fetch dashboard summaries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [tasksList, projectsList]);

  // Quick Inline Toggle for quick pending tasks
  const handleQuickToggleTask = async (task: Task) => {
    try {
      const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
      await api.put(`/tasks/${task.id}`, { status: nextStatus });
      triggerRefreshTasks();
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex-1 flex justify-center items-center min-h-[50vh] dark:text-zinc-300">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <div className="h-8 w-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
          <span className="text-xs font-semibold tracking-wider text-gray-500">Syncing WorkPulse...</span>
        </div>
      </div>
    );
  }

  const s = data?.summary || {
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    totalHours: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalGoals: 0,
    completedGoals: 0,
    streak: 1
  };

  const chartData = data?.charts?.productivityTrend || [];
  const activeUncompletedTasks = tasksList.filter(t => t.status !== 'completed').slice(0, 5);

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full font-sans">
      
      {/* Upper Welcome Header banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-tr from-gray-900 via-zinc-900 to-indigo-950 dark:from-zinc-950 dark:via-zinc-90 w-full p-6 md:p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-teal-500/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl" />
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welcome back, {userName}
          </h2>
          <p className="text-sm text-gray-300 mt-1">
            Ready to drive work and build milestones today? Your Workspace persistence check is healthy.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => onNavigate('tasks')}
            className="px-4 py-2 bg-teal-500 text-zinc-950 font-bold rounded-xl text-xs hover:bg-teal-400 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-teal-500/15"
          >
            <PlusCircle className="h-4 w-4" />
            New Task
          </button>
          <button
            onClick={() => onNavigate('analytics')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Analyze Performance
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 p-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-gray-500 dark:text-zinc-400 leading-none mb-1">Tasks Done</span>
            <span className="text-xl font-bold text-gray-950 dark:text-zinc-50 leading-none">
              {s.completedTasks} <span className="text-xs text-gray-400">/ {s.totalTasks}</span>
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 p-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
          <div className="p-3 bg-teal-50 dark:bg-teal-950/20 text-teal-650 dark:text-teal-400 rounded-xl">
            <Hourglass className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-gray-500 dark:text-zinc-400 leading-none mb-1">Hours Logged</span>
            <span className="text-xl font-bold text-gray-950 dark:text-zinc-50 leading-none">
              {s.totalHours} hrs
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 p-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-xl">
            <Flame className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-gray-500 dark:text-zinc-400 leading-none mb-1">Daily Streak</span>
            <span className="text-xl font-bold text-gray-950 dark:text-zinc-50 leading-none">
              {s.streak} Days
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 p-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 rounded-xl">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-gray-500 dark:text-zinc-400 leading-none mb-1">Active Projects</span>
            <span className="text-xl font-bold text-gray-950 dark:text-zinc-50 leading-none">
              {s.activeProjects} <span className="text-xs text-gray-400">/ {s.totalProjects}</span>
            </span>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 p-4 rounded-2xl flex items-center gap-3.5 shadow-sm col-span-2 lg:col-span-1">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/20 text-purple-650 dark:text-purple-400 rounded-xl">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-gray-500 dark:text-zinc-400 leading-none mb-1">Goals Completed</span>
            <span className="text-xl font-bold text-gray-950 dark:text-zinc-50 leading-none">
              {s.completedGoals} <span className="text-xs text-gray-400">/ {s.totalGoals}</span>
            </span>
          </div>
        </div>

      </div>

      {/* Main Charts area + tasks preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Performance Chart of tasks & hours */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 p-5 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-950 dark:text-zinc-50">Productivity Trend</h3>
              <p className="text-[11px] text-gray-500">Weekly completion spikes and logged focus blocks</p>
            </div>
            <div className="flex gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-gray-650 dark:text-zinc-305">
                <span className="h-2 w-2 rounded-full bg-teal-500" />
                Completed
              </span>
              <span className="flex items-center gap-1.5 text-gray-650 dark:text-zinc-305">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                Hours Work
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" className="hidden dark:block" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
                    labelClassName="text-[11px] font-bold text-gray-500"
                  />
                  <Area type="monotone" dataKey="tasksCompleted" name="Tasks Done" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#colorTasks)" />
                  <Area type="monotone" dataKey="hoursWorked" name="Hours Logged" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorHours)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-455">
                Insufficient analytics records. Complete focus tasks to generate trendlines.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions and Pending Tasks list */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 p-5 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-gray-950 dark:text-zinc-50 flex items-center gap-1.5">
                <ListTodo className="h-4.5 w-4.5 text-teal-500" />
                Action Items
              </h3>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-[11px] font-semibold text-teal-650 hover:underline flex items-center"
              >
                All tasks <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            
            <p className="text-[11px] text-gray-500 mb-4 font-sans">Toggle completion directly to log productivity bursts.</p>
            
            <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
              {activeUncompletedTasks.length > 0 ? (
                activeUncompletedTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-850 rounded-xl hover:shadow-sm"
                  >
                    <input
                      type="checkbox"
                      checked={task.status === 'completed'}
                      onChange={() => handleQuickToggleTask(task)}
                      className="h-4 w-4 rounded text-teal-600 focus:ring-teal-500 border-gray-300 dark:border-zinc-800 focus:outline-none shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold text-gray-800 dark:text-zinc-200 truncate pr-1">
                        {task.title}
                      </span>
                      <div className="flex gap-1.5 items-center mt-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase leading-none ${
                          task.priority === 'high' 
                            ? 'bg-red-50 text-red-650 dark:bg-red-950/20 dark:text-red-400' 
                            : task.priority === 'medium'
                            ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                            : 'bg-teal-50 text-teal-600 dark:bg-teal-950/20 dark:text-teal-400'
                        }`}>
                          {task.priority}
                        </span>
                        {task.deadline && (
                          <span className="text-[9px] text-gray-500 dark:text-zinc-400 font-mono">
                            Due: {task.deadline}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-gray-400 dark:text-zinc-500">
                  No active tasks. Tap &quot;New Task&quot; above to populate your workspace.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-zinc-850/60 mt-4">
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span className="flex items-center gap-1 leading-none font-medium">
                <CircleDot className="h-3.5 w-3.5 text-teal-650 shrink-0" />
                Remaining: {s.pendingTasks + s.inProgressTasks}
              </span>
              <span className="font-semibold">{s.totalTasks > 0 ? Math.round((s.completedTasks / s.totalTasks) * 100) : 0}% Done</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-teal-500 h-full rounded-full transition-all" 
                style={{ width: `${s.totalTasks > 0 ? (s.completedTasks / s.totalTasks) * 100 : 0}%` }}
              />
            </div>
          </div>

        </div>

      </div>

      {/* Activity Logs row */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 p-5 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-950 dark:text-zinc-50 flex items-center gap-1.5">
              <GitCommit className="h-4.5 w-4.5 text-teal-555" />
              Dynamic Activity Streams
            </h3>
            <p className="text-[11px] text-gray-550">Interactive secure history logs of your Workspace modifications</p>
          </div>
          <button
            onClick={() => onNavigate('analytics')}
            className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Insights matrix <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5 max-h-48 overflow-y-auto pr-1">
          {logs.length > 0 ? (
            logs.slice(0, 9).map((log) => (
              <div 
                key={log.id} 
                className="p-3 bg-gray-55/40 dark:bg-zinc-850/40 rounded-xl hover:bg-gray-100/60 dark:hover:bg-zinc-850/60 transition-colors border border-gray-100 dark:border-zinc-800"
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs font-bold text-gray-800 dark:text-zinc-200">
                    {log.action}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400 tracking-tight shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] text-gray-550 dark:text-zinc-400 mt-1">
                  {log.details}
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-xs text-gray-400">
              No recent changes logged. Start managing work to establish triggers.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
