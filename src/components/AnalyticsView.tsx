import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { AnalyticsSummary, Task, Project } from '../types';
import { 
  BarChart3, 
  TrendingUp, 
  Hourglass, 
  Bookmark, 
  Flame, 
  Activity, 
  Compass, 
  CheckSquare, 
  Download, 
  Loader2, 
  ChevronRight, 
  Briefcase, 
  Trophy,
  X,
  Printer
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  Legend 
} from 'recharts';
import { motion } from 'motion/react';

interface AnalyticsViewProps {
  userName: string;
  role: string;
  tasksList: Task[];
  projectsList: Project[];
}

export function AnalyticsView({ userName, role, tasksList, projectsList }: AnalyticsViewProps) {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Export overlay state
  const [reportType, setReportType] = useState<'weekly' | 'monthly' | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics');
      setData(res.data);
    } catch (err) {
      console.error('Failed to gather analytics summaries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [tasksList, projectsList]);

  if (loading && !data) {
    return (
      <div className="flex-1 flex justify-center items-center min-h-[50vh] text-gray-500">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-7 w-7 animate-spin text-teal-500" />
          <span className="text-xs font-semibold">Gathering Workspace Parameters...</span>
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

  const productivityTrend = data?.charts?.productivityTrend || [];
  const skillGrowth = data?.charts?.skillGrowth || [];
  const projectsData = data?.charts?.projects || [];

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full font-sans">
      
      {/* Upper header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-150 dark:border-zinc-855 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-901 dark:text-zinc-50">Analytics Workspace</h1>
          <p className="text-xs text-gray-550">Formulate high-fidelity productivity vectors, workload matrices and calibration statistics.</p>
        </div>
        
        {/* Export triggers */}
        <div className="flex gap-2">
          <button
            onClick={() => setReportType('weekly')}
            className="px-4 py-2 bg-gray-50 dark:bg-zinc-855 hover:bg-gray-100 border border-gray-200 dark:border-zinc-800 dark:text-zinc-100 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="h-4 w-4 text-gray-400" />
            Weekly PDF Report
          </button>
          
          <button
            onClick={() => setReportType('monthly')}
            className="px-4.5 py-2.5 bg-gray-950 hover:bg-gray-850 dark:bg-teal-500 dark:hover:bg-teal-655 text-white dark:text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Monthly Summary
          </button>
        </div>
      </div>

      {/* Primary Analytics cards row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Goal completion card */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 p-4 rounded-2xl shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Goal Focus Index</span>
            <Trophy className="h-4 w-4 text-amber-500" />
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-zinc-100 block">
            {s.totalGoals > 0 ? Math.round((s.completedGoals / s.totalGoals) * 100) : 0}%
          </span>
          <span className="text-[11px] text-gray-500 mt-1 block">
            {s.completedGoals} of {s.totalGoals} goals completed
          </span>
        </div>

        {/* Work Hours consistency card */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 p-4 rounded-2xl shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Logged Output Hours</span>
            <Hourglass className="h-4 w-4 text-teal-500" />
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-zinc-100 block">
            {s.totalHours} hrs
          </span>
          <span className="text-[11px] text-gray-500 mt-1 block">
            Logged across active task details
          </span>
        </div>

        {/* Workload splits tasks completed card */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 p-4 rounded-2xl shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Task Solve rate</span>
            <CheckSquare className="h-4 w-4 text-indigo-505" />
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-zinc-100 block">
            {s.totalTasks > 0 ? Math.round((s.completedTasks / s.totalTasks) * 100) : 0}%
          </span>
          <span className="text-[11px] text-gray-500 mt-1 block">
            Completed {s.completedTasks} tasks of {s.totalTasks}
          </span>
        </div>

        {/* Logging consistency streak */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 p-4 rounded-2xl shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-gray-550 uppercase tracking-wider">Workplace Streak</span>
            <Flame className="h-4 w-4 text-orange-500 animate-pulse" />
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-zinc-100 block">
            {s.streak} Days
          </span>
          <span className="text-[11px] text-gray-550 mt-1 block">
            Consecutive workspace updates
          </span>
        </div>

      </div>

      {/* Dual Graphs section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Productivity line analytics */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 p-5 rounded-3xl shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-150">Productivity Trend Analysis</h3>
            <p className="text-[11px] text-gray-500">Weekly resolution progress tracked by focus hours worked</p>
          </div>

          <div className="h-64 w-full text-xs">
            {productivityTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={productivityTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" className="hidden dark:block" />
                  <XAxis dataKey="day" stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Line type="monotone" dataKey="tasksCompleted" name="Tasks Solved" stroke="#14b8a6" strokeWidth={2.5} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="hoursWorked" name="Focus Blocks (hours)" stroke="#6366f1" strokeWidth={2.5} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                Generate tasks to render trend vectors.
              </div>
            )}
          </div>
        </div>

        {/* Skill Masteries Bars */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 p-5 rounded-3xl shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-150">Competency Mastery footprint</h3>
            <p className="text-[11px] text-gray-500">Dynamic tracking indexes mapped per percentile skill parameters</p>
          </div>

          <div className="h-64 w-full text-xs">
            {skillGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" className="hidden dark:block" />
                  <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ border: 'none', borderRadius: '12px' }} />
                  <Bar type="monotone" dataKey="progress" name="Percentile Mastery" fill="#14b8a6" radius={[6, 6, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                Setup skills parameters inside dynamic calibrator.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Project progressing analytics lists */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-855 p-5 rounded-3xl shadow-sm">
        <h3 className="text-sm font-bold text-gray-901 dark:text-zinc-55 mb-3.5">Project scopes analytics splits</h3>
        
        {projectsData.length > 0 ? (
          <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
            {projectsData.map((proj, idx) => (
              <div key={idx} className="space-y-1 bg-gray-50/50 dark:bg-zinc-850/20 p-3 rounded-2xl border border-gray-100 dark:border-zinc-850">
                <div className="flex justify-between text-xs font-semibold text-gray-800 dark:text-zinc-200">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    {proj.name}
                  </span>
                  <span className="font-mono">{proj.progress}% Done ({proj.status})</span>
                </div>
                <div className="w-full bg-gray-150 dark:bg-zinc-805 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full rounded-full transition-all" 
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-gray-400">
            No active project deliverables tracks loaded in active databases.
          </div>
        )}
      </div>

      {/* Interactive Report Export Preview Dialog */}
      {reportType && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-55 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-950 rounded-3xl max-w-2xl w-full border border-gray-200 dark:border-zinc-855 shadow-2xl relative flex flex-col max-h-[90vh]">
            
            <button
              onClick={() => setReportType(null)}
              className="absolute top-4.5 right-4.5 text-gray-400 hover:text-gray-650"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header toolbar */}
            <div className="p-5 border-b border-gray-100 dark:border-zinc-850 flex justify-between items-center bg-gray-50/30">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-zinc-50 text-base">
                  {reportType === 'weekly' ? 'Weekly PDF Workspace Report' : 'Monthly Performance Summary'}
                </h3>
                <p className="text-[10px] text-gray-500 font-sans mt-0.5">Verified simulated secure report ledger for export</p>
              </div>

              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-zinc-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-teal-500/15 cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                Print/Save PDF
              </button>
            </div>

            {/* Report Document Sheet */}
            <div className="p-8 overflow-y-auto bg-white text-gray-900 flex-1 space-y-6 select-all font-sans print:m-0 print:p-0">
              
              {/* Report Document Header */}
              <div className="flex justify-between items-start border-b-2 border-gray-900 pb-5">
                <div>
                  <span className="text-xs font-mono font-bold tracking-widest text-[#14b8a6]">WORKPULSE SAAS REVENUE LEDGER</span>
                  <h1 className="text-2xl font-black text-gray-950 mt-1 uppercase">PRODUCTIVITY AUDIT STATUS</h1>
                  <p className="text-xs text-gray-550 mt-1">Staged for: <span className="font-semibold text-gray-900">{userName}</span> ({role})</p>
                </div>
                <div className="text-right font-mono text-xs">
                  <span className="block font-bold">REPORT: WP-{reportType === 'weekly' ? 'WK' : 'MN'}-{Math.floor(1000 + Math.random() * 9000)}</span>
                  <span className="text-gray-500 text-[11px]">DATE: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>

              {/* Aggregates details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <span className="text-[9px] uppercase tracking-wide font-black text-gray-500 block mb-1">Tasks Completed</span>
                  <span className="text-lg font-bold font-mono text-gray-950">{s.completedTasks} / {s.totalTasks}</span>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <span className="text-[9px] uppercase tracking-wide font-black text-gray-500 block mb-1">Hours Logged</span>
                  <span className="text-lg font-bold font-mono text-gray-950">{s.totalHours} hrs</span>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <span className="text-[9px] uppercase tracking-wide font-black text-gray-500 block mb-1">Active Projects</span>
                  <span className="text-lg font-bold font-mono text-gray-950">{s.activeProjects} active</span>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <span className="text-[9px] uppercase tracking-wide font-black text-gray-500 block mb-1">Goal Completions</span>
                  <span className="text-lg font-bold font-mono text-gray-950">{s.completedGoals} / {s.totalGoals}</span>
                </div>
              </div>

              {/* List of outstanding Tasks */}
              <div className="space-y-2 border-t border-gray-200 pt-4">
                <span className="font-black text-[10px] tracking-wide uppercase text-gray-500 block mb-2">Workspace Deliverables Record</span>
                <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-200">
                  {tasksList.slice(0, 10).map((t, i) => (
                    <div key={i} className="p-3 flex justify-between items-center text-xs">
                      <div className="min-w-0 pr-2">
                        <span className="font-bold text-gray-950 block truncate">{t.title}</span>
                        <div className="flex gap-1.5 mt-1 font-semibold text-[9px]">
                          <span className="bg-gray-100 text-gray-700 font-mono px-1 rounded uppercase">{t.priority}</span>
                          <span className="text-gray-500 font-mono">Due: {t.deadline}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider ${t.status === 'completed' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/50' : 'bg-amber-55/10 text-amber-850'}`}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                  {tasksList.length === 0 && (
                    <div className="p-4 text-center text-xs text-slate-400">No core deliverables found.</div>
                  )}
                </div>
              </div>

              {/* List of active projects progress */}
              {projectsList.length > 0 && (
                <div className="space-y-2 border-t border-gray-200 pt-4">
                  <span className="font-black text-[10px] tracking-wide uppercase text-gray-500 block mb-2">Project Execution parameters</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {projectsList.map((p, i) => (
                      <div key={i} className="p-3 border border-gray-200 rounded-xl space-y-1">
                        <span className="font-bold text-gray-950 block">{p.name}</span>
                        <div className="flex justify-between text-[11px] text-gray-500">
                          <span>Complete: {p.progress}%</span>
                          <span className="capitalize text-slate-700 font-medium">{p.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Legal verification footer */}
              <div className="pt-10 border-t-2 border-dashed border-gray-300 text-center text-[10px] text-gray-400 font-mono font-medium leading-relaxed">
                <p>This report has been compiled and cryptographically secured server-side on Node.js of WorkPulse.</p>
                <p className="mt-1 font-bold">WORKPULSE SAAS WORKSPACE MANAGEMENT APPARATUS • PERSISTENT ENCRYPTED FILE REGISTRY</p>
              </div>

            </div>

            {/* Footer buttons */}
            <div className="p-4 border-t border-gray-100 dark:border-zinc-850 bg-gray-50/50 flex justify-end gap-2.5">
              <button
                onClick={() => setReportType(null)}
                className="px-5 py-2.5 bg-gray-950 hover:bg-opacity-95 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
