import React, { useState } from 'react';
import { Skill } from '../types';
import { api } from '../utils/api';
import { 
  Plus, 
  Trash2, 
  Compass, 
  Sparkles, 
  BookOpen, 
  Briefcase, 
  TrendingUp, 
  CheckCircle,
  X,
  Sliders
} from 'lucide-react';
import { motion } from 'motion/react';

interface SkillsViewProps {
  skills: Skill[];
  triggerRefresh: () => void;
}

export function SkillsView({ skills, triggerRefresh }: SkillsViewProps) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'>('Intermediate');
  const [progress, setProgress] = useState(50);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      await api.post('/skills', {
        name,
        level,
        progress: Number(progress)
      });
      triggerRefresh();
      setShowModal(false);
      setName('');
    } catch (err) {
      console.error('Failed to create custom skill index:', err);
    }
  };

  const handleUpdateProgress = async (skill: Skill, val: number) => {
    // Dynamic level adjustment based on progress percentile automatically for superb UX!
    let nextLevel: Skill['level'] = 'Beginner';
    if (val >= 85) nextLevel = 'Expert';
    else if (val >= 60) nextLevel = 'Advanced';
    else if (val >= 35) nextLevel = 'Intermediate';

    try {
      await api.put(`/skills/${skill.id}`, {
        progress: val,
        level: nextLevel
      });
      triggerRefresh();
    } catch (err) {
      console.error('Failed to update skill vector progress:', err);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    if (!confirm('Are you sure you want to remove this skill from your matrices?')) return;
    try {
      await api.delete(`/skills/${id}`);
      triggerRefresh();
    } catch (err) {
      console.error('Failed to remove skill vector:', err);
    }
  };

  const getLevelColor = (lvl: Skill['level']) => {
    switch (lvl) {
      case 'Expert': return 'bg-purple-50 text-purple-650 border-purple-200/40 dark:bg-purple-950/20 dark:text-purple-400';
      case 'Advanced': return 'bg-indigo-50 text-indigo-650 border-indigo-200/40 dark:bg-indigo-950/20 dark:text-indigo-400';
      case 'Intermediate': return 'bg-teal-50 text-teal-655 border-teal-200/40 dark:bg-teal-950/20 dark:text-teal-400';
      default: return 'bg-gray-100 text-gray-650 border-gray-200 dark:bg-zinc-800 dark:text-zinc-400';
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full font-sans">
      
      {/* Upper header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-150 dark:border-zinc-850 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-901 dark:text-zinc-50">Skill Matrix</h1>
          <p className="text-xs text-gray-550">Track standard tech stacks, lider parameters, leadership competencies, and custom craft matrices.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4.5 py-2.5 bg-gray-950 hover:bg-gray-850 dark:bg-teal-500 dark:hover:bg-teal-655 text-white dark:text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          Track New Competency
        </button>
      </div>

      {/* Grid listing */}
      {skills.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 p-5 rounded-3xl shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-zinc-50 tracking-tight leading-none mb-1">
                      {skill.name}
                    </h3>
                    <span className="text-[10px] text-gray-400 font-mono">
                      Last edited: {new Date(skill.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteSkill(skill.id)}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-gray-50 dark:hover:bg-zinc-850 rounded cursor-pointer shrink-0 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 mt-3">
                  <span className={`text-[10px] px-2.5 py-1 border rounded-lg font-bold uppercase tracking-wider leading-none ${getLevelColor(skill.level)}`}>
                    {skill.level} Level
                  </span>
                  
                  <span className="text-[10px] text-gray-500 font-medium">
                    {skill.progress}% Mastery
                  </span>
                </div>
              </div>

              {/* Live slider progress */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[10px] font-bold text-gray-455">
                  <span className="flex items-center gap-1">
                    <Sliders className="h-3 w-3 text-teal-650" />
                    Interactive Calibrator
                  </span>
                  <span>{skill.progress}%</span>
                </div>
                
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={skill.progress}
                  onChange={(e) => handleUpdateProgress(skill, Number(e.target.value))}
                  className="w-full accent-teal-500 cursor-pointer my-1.5"
                />

                <div className="flex justify-between text-[9px] font-mono text-gray-400 font-semibold select-none leading-none pt-0.5">
                  <span>Beginner</span>
                  <span>Avg</span>
                  <span>Expert</span>
                </div>
              </div>

            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-855 py-16 rounded-3xl text-center flex flex-col justify-center items-center">
          <Compass className="h-10 w-10 text-gray-300 dark:text-zinc-750 stroke-[1.2] mb-3" />
          <h3 className="font-bold text-gray-800 dark:text-zinc-200 text-sm">Skills Matrox empty</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm px-4">Calibrate growth parameters from beginner to expert benchmarks instantly.</p>
        </div>
      )}

      {/* Competency creator modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-55">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-sm w-full p-6 border border-gray-200 dark:border-zinc-800 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4.5 right-4.5 text-gray-400 hover:text-gray-650"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-gray-901 dark:text-zinc-50 mb-3.5 flex items-center gap-1.5 font-sans">
              <Sparkles className="h-4.5 w-4.5 text-teal-500" />
              Calibrate New Competency
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 font-sans">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kotlin, Power BI, Leadership"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-gray-55/65 dark:bg-zinc-950/65 border border-gray-200 dark:border-zinc-850 rounded-xl focus:outline-none dark:text-zinc-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">Baseline Rank</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs bg-gray-55/65 dark:bg-zinc-955/65 border border-gray-200 dark:border-zinc-850 rounded-xl focus:outline-none dark:text-zinc-50 font-medium"
                >
                  <option value="Beginner">Beginner Level (0-35%)</option>
                  <option value="Intermediate">Intermediate Level (35-60%)</option>
                  <option value="Advanced">Advanced Level (60-85%)</option>
                  <option value="Expert">Expert Mastery (85-100%)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">Progress Level ({progress}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="w-full accent-teal-555 cursor-pointer my-1.5"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 text-xs font-medium border-t border-gray-100 dark:border-zinc-850">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2.5 bg-gray-950 dark:bg-teal-500 text-white dark:text-zinc-950 rounded-xl font-bold cursor-pointer"
                >
                  Strap Competency
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
