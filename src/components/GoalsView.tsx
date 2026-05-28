import React, { useState } from 'react';
import { Goal } from '../types';
import { api } from '../utils/api';
import { 
  Plus, 
  Target, 
  Trash2, 
  Calendar, 
  CheckCircle2, 
  X,
  TrendingUp,
  Circle,
  Trophy,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';

interface GoalsViewProps {
  goals: Goal[];
  triggerRefresh: () => void;
}

export function GoalsView({ goals, triggerRefresh }: GoalsViewProps) {
  const [showModal, setShowModal] = useState(false);
  
  // Create / Update Fields
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [targetDate, setTargetDate] = useState('');

  // Sieve categorizations
  const dailyGoals = goals.filter(g => g.type === 'daily');
  const weeklyGoals = goals.filter(g => g.type === 'weekly');
  const monthlyGoals = goals.filter(g => g.type === 'monthly');

  const getCompletionStats = (gList: Goal[]) => {
    if (gList.length === 0) return 0;
    const completedCount = gList.filter(g => g.completed).length;
    return Math.round((completedCount / gList.length) * 100);
  };

  const handleOpenModal = () => {
    setTitle('');
    setType('weekly');
    setTargetDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    try {
      await api.post('/goals', {
        title,
        type,
        targetDate,
        progress: 0,
        completed: false
      });
      triggerRefresh();
      setShowModal(false);
    } catch (err) {
      console.error('Failed to create workspace goal:', err);
    }
  };

  const handleToggleGoal = async (goal: Goal) => {
    try {
      await api.put(`/goals/${goal.id}`, {
        completed: !goal.completed,
        progress: !goal.completed ? 10 : 0
      });
      triggerRefresh();
    } catch (err) {
      console.error('Failed to update goal parameters:', err);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    try {
      await api.delete(`/goals/${id}`);
      triggerRefresh();
    } catch (err) {
      console.error('Failed to delete goal resource:', err);
    }
  };

  // Rendering a gorgeous animated visual Circular Progress Ring
  const CircularProgress = ({ percentage, strokeWidth = 8, radius = 50, colorClass = 'stroke-teal-500' }: { percentage: number; strokeWidth?: number; radius?: number; colorClass?: string }) => {
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <svg width={(radius + strokeWidth) * 2} height={(radius + strokeWidth) * 2} className="relative select-none">
        {/* Background Track */}
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          className="stroke-gray-100 dark:stroke-zinc-800 fill-transparent"
          strokeWidth={strokeWidth}
        />
        {/* Main progress path */}
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          className={`fill-transparent progress-ring-circle ${colorClass}`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
        {/* Centered label text */}
        <text
          x="50%"
          y="50%"
          dy=".3em"
          textAnchor="middle"
          className="font-bold text-lg fill-gray-900 dark:fill-zinc-50 font-sans"
        >
          {percentage}%
        </text>
      </svg>
    );
  };

  const overallCompletion = getCompletionStats(goals);

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full font-sans">
      
      {/* Upper header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-150 dark:border-zinc-850 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-50">Goals Tracker</h1>
          <p className="text-xs text-gray-500">Define, measure and accomplish strategic Daily, Weekly and Monthly targets.</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="px-4.5 py-2.5 bg-gray-950 hover:bg-gray-850 dark:bg-teal-500 dark:hover:bg-teal-655 text-white dark:text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          Create Goal
        </button>
      </div>

      {/* Aggregate metrics box */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
        
        {/* Progress Ring Card */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 p-6 rounded-3xl shadow-xs flex flex-col md:flex-row items-center gap-6 lg:col-span-2">
          <div className="shrink-0 relative">
            <CircularProgress percentage={overallCompletion} strokeWidth={10} radius={60} colorClass="stroke-teal-500" />
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-lg text-[10px] font-bold uppercase tracking-wider">
              <Trophy className="h-3.5 w-3.5" />
              SaaS Growth Index
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-zinc-50 leading-tight">Combined Milestones Completed</h3>
            <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
              You have resolved <span className="font-bold text-gray-800 dark:text-zinc-200">{goals.filter(g => g.completed).length} goals</span> out of <span className="font-medium text-gray-750">{goals.length} target vectors</span> defined in this active workspace.
            </p>
          </div>
        </div>

        {/* Small Widgets column */}
        <div className="grid grid-cols-3 lg:grid-cols-1 gap-4 lg:col-span-2">
          
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 px-4 py-3 rounded-2xl shadow-xs flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-teal-500 shrink-0" />
            <div>
              <span className="block text-[10px] text-gray-500 font-bold uppercase leading-none mb-1">Daily Completion</span>
              <span className="text-sm font-bold text-gray-900 dark:text-zinc-100">{getCompletionStats(dailyGoals)}%</span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 px-4 py-3 rounded-2xl shadow-xs flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-indigo-550 shrink-0" />
            <div>
              <span className="block text-[10px] text-gray-500 font-bold uppercase leading-none mb-1">Weekly Completion</span>
              <span className="text-sm font-bold text-gray-900 dark:text-zinc-100">{getCompletionStats(weeklyGoals)}%</span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 px-4 py-3 rounded-2xl shadow-xs flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-purple-500 shrink-0" />
            <div>
              <span className="block text-[10px] text-gray-500 font-bold uppercase leading-none mb-1">Monthly Completion</span>
              <span className="text-sm font-bold text-gray-900 dark:text-zinc-100">{getCompletionStats(monthlyGoals)}%</span>
            </div>
          </div>

        </div>

      </div>

      {/* Columns per goal type */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Column 1: Daily */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 p-5 rounded-3xl shadow-sm flex flex-col min-h-[40vh]">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-zinc-850">
            <h3 className="font-bold text-xs uppercase text-gray-700 dark:text-zinc-300 tracking-wider flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-teal-500" />
              Daily Focus list
            </h3>
            <span className="text-[10px] font-bold text-gray-400">{dailyGoals.length} tracked</span>
          </div>
          <div className="space-y-3 flex-1">
            {dailyGoals.map(g => (
              <GoalRow key={g.id} goal={g} onToggle={handleToggleGoal} onDelete={handleDeleteGoal} />
            ))}
            {dailyGoals.length === 0 && <EmptyGoals label="Daily" />}
          </div>
        </div>

        {/* Column 2: Weekly */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 p-5 rounded-3xl shadow-sm flex flex-col min-h-[40vh]">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-zinc-850">
            <h3 className="font-bold text-xs uppercase text-gray-705 dark:text-zinc-300 tracking-wider flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              Weekly Objectives
            </h3>
            <span className="text-[10px] font-bold text-gray-400">{weeklyGoals.length} tracked</span>
          </div>
          <div className="space-y-3 flex-1">
            {weeklyGoals.map(g => (
              <GoalRow key={g.id} goal={g} onToggle={handleToggleGoal} onDelete={handleDeleteGoal} />
            ))}
            {weeklyGoals.length === 0 && <EmptyGoals label="Weekly" />}
          </div>
        </div>

        {/* Column 3: Monthly */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 p-5 rounded-3xl shadow-sm flex flex-col min-h-[40vh]">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-zinc-850">
            <h3 className="font-bold text-xs uppercase text-gray-705 dark:text-zinc-300 tracking-wider flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-purple-500" />
              Monthly Milestones
            </h3>
            <span className="text-[10px] font-bold text-gray-400">{monthlyGoals.length} tracked</span>
          </div>
          <div className="space-y-3 flex-1">
            {monthlyGoals.map(g => (
              <GoalRow key={g.id} goal={g} onToggle={handleToggleGoal} onDelete={handleDeleteGoal} />
            ))}
            {monthlyGoals.length === 0 && <EmptyGoals label="Monthly" />}
          </div>
        </div>

      </div>

      {/* Goal creation modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-55">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-sm w-full p-6 border border-gray-200 dark:border-zinc-800 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4.5 right-4.5 text-gray-400 hover:text-gray-650"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-gray-901 dark:text-zinc-50 mb-3.5 flex items-center gap-1.5">
              <Target className="h-4.5 w-4.5 text-teal-500" />
              Establish Target Goal
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">What is your objective?</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete 3 API integrations"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-gray-55/65 dark:bg-zinc-950/65 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none dark:text-zinc-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">Goal Cycle</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs bg-gray-55/65 dark:bg-zinc-950/65 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none dark:text-zinc-50"
                >
                  <option value="daily">Daily Target</option>
                  <option value="weekly">Weekly Objective</option>
                  <option value="monthly">Monthly Milestone</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">Completion Target Date</label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-gray-55/65 dark:bg-zinc-950/65 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none dark:text-zinc-50 font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2.5 bg-gray-950 dark:bg-teal-500 text-white dark:text-zinc-950 rounded-xl font-bold cursor-pointer"
                >
                  Publish Goal
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Single Goal Row subcomponent
function GoalRow({ goal, onToggle, onDelete }: { key?: string; goal: Goal; onToggle: (g: Goal) => any; onDelete: (id: string) => any }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-3 border rounded-2xl flex items-center justify-between gap-3 transition-all ${
        goal.completed 
          ? 'bg-gray-50/55 dark:bg-zinc-900/40 border-gray-150 dark:border-zinc-850 opacity-80' 
          : 'bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800 shadow-xs'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          onClick={() => onToggle(goal)}
          className="text-gray-400 hover:text-teal-500 transition-colors shrink-0 focus:outline-none cursor-pointer"
        >
          {goal.completed ? (
            <CheckCircle2 className="h-5 w-5 text-teal-500 text-teal-555 fill-teal-500/10" />
          ) : (
            <Circle className="h-5 w-5 text-gray-400 hover:text-teal-500" />
          )}
        </button>
        <div className="min-w-0">
          <span className={`block text-xs font-semibold leading-relaxed truncate pr-1 ${goal.completed ? 'line-through text-gray-450 dark:text-zinc-500' : 'text-gray-850 dark:text-zinc-200'}`}>
            {goal.title}
          </span>
          <span className="text-[9px] text-gray-400 font-mono flex items-center gap-1 mt-0.5">
            <Calendar className="h-3 w-3 inline" />
            Until: {goal.targetDate}
          </span>
        </div>
      </div>

      <button
        onClick={() => onDelete(goal.id)}
        className="text-gray-400 hover:text-red-500 shrink-0 p-1 rounded hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

    </motion.div>
  );
}

function EmptyGoals({ label }: { label: string }) {
  return (
    <div className="py-12 border border-dashed border-gray-150 dark:border-zinc-800 rounded-2xl flex flex-col justify-center items-center text-center">
      <Activity className="h-5 w-5 text-gray-300 dark:text-zinc-650 stroke-[1.5] mb-2" />
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No {label} Targets</span>
      <p className="text-[9px] text-gray-550 mt-1 max-w-xs px-2">Set custom indicators to structure your productivity metrics.</p>
    </div>
  );
}
