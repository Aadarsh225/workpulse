import React, { useState } from 'react';
import { Task } from '../types';
import { api } from '../utils/api';
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Trash2, 
  Edit3, 
  Calendar, 
  Clock, 
  Tag as TagIcon, 
  CheckCircle2, 
  Circle, 
  Play, 
  PlusCircle, 
  X,
  UserCheck2,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'motion/react';

interface TasksViewProps {
  tasks: Task[];
  triggerRefresh: () => void;
}

export function TasksView({ tasks, triggerRefresh }: TasksViewProps) {
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [viewStyle, setViewStyle] = useState<'kanban' | 'list'>('kanban');

  // Task creation modal
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'completed'>('pending');
  const [notes, setNotes] = useState('');
  const [hoursWorked, setHoursWorked] = useState('0');
  const [tagInput, setTagInput] = useState('');
  const [tagsList, setTagsList] = useState<string[]>([]);

  // Unique tags for filter dropdown
  const allTags = Array.from(new Set(tasks.flatMap(t => t.tags || [])));

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDeadline(new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setStatus('pending');
    setNotes('');
    setHoursWorked('0');
    setTagsList([]);
    setTagInput('');
    setShowModal(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setDeadline(task.deadline);
    setStatus(task.status);
    setNotes(task.notes || '');
    setHoursWorked(String(task.hoursWorked || 0));
    setTagsList(task.tags || []);
    setTagInput('');
    setShowModal(true);
  };

  const handleAddTag = () => {
    const clean = tagInput.trim().toLowerCase();
    if (clean && !tagsList.includes(clean)) {
      setTagsList([...tagsList, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTagsList(tagsList.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const payload = {
      title,
      description,
      priority,
      deadline,
      status,
      notes,
      hoursWorked: parseFloat(hoursWorked) || 0,
      tags: tagsList
    };

    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, payload);
      } else {
        await api.post('/tasks', payload);
      }
      triggerRefresh();
      setShowModal(false);
    } catch (err) {
      console.error('Failed to submit task parameter modifications:', err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you absolutely sure you want to remove this task? This action is irreversible.')) {
      return;
    }
    try {
      await api.delete(`/tasks/${id}`);
      triggerRefresh();
    } catch (err) {
      console.error('Failed to remove task resource:', err);
    }
  };

  const handleQuickStatusChange = async (task: Task, nextStatus: 'pending' | 'in_progress' | 'completed') => {
    try {
      await api.put(`/tasks/${task.id}`, { status: nextStatus });
      triggerRefresh();
    } catch (err) {
      console.error('Failed to quick change status:', err);
    }
  };

  // Applied Filtering
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    const matchesTag = selectedTag === 'all' || task.tags.includes(selectedTag);
    return matchesSearch && matchesPriority && matchesTag;
  });

  // Kanban Columns
  const pendingCol = filteredTasks.filter(t => t.status === 'pending');
  const progressCol = filteredTasks.filter(t => t.status === 'in_progress');
  const completedCol = filteredTasks.filter(t => t.status === 'completed');

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full font-sans">
      
      {/* Header Controls Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-150 dark:border-zinc-850 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-50">Tasks Workspace</h1>
          <p className="text-xs text-gray-500">Track and log granular productivity elements inside Kanban and list panels.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="px-4.5 py-2.5 bg-gray-950 hover:bg-gray-850 dark:bg-teal-500 dark:hover:bg-teal-650 text-white dark:text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          Create Task
        </button>
      </div>

      {/* Interactive Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-white dark:bg-zinc-900 p-4 border border-gray-150 dark:border-zinc-850 rounded-2xl shadow-sm">
        
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search task parameters, tags, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 dark:bg-zinc-850 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 dark:text-zinc-100"
          />
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
        </div>

        {/* Filters panel selectors */}
        <div className="flex flex-wrap items-center gap-3.5">
          
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-gray-450 shrink-0" />
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-2.5 py-1.5 bg-gray-50 dark:bg-zinc-850 border border-gray-150 dark:border-zinc-800 rounded-xl text-xs font-medium dark:text-zinc-100 focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="high">High priority</option>
              <option value="medium">Medium priority</option>
              <option value="low">Low priority</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <TagIcon className="h-3.5 w-3.5 text-gray-450 shrink-0" />
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-2.5 py-1.5 bg-gray-50 dark:bg-zinc-850 border border-gray-150 dark:border-zinc-800 rounded-xl text-xs font-medium dark:text-zinc-100 focus:outline-none"
            >
              <option value="all">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>#{tag}</option>
              ))}
            </select>
          </div>

          <div className="bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl flex">
            <button
              onClick={() => setViewStyle('kanban')}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${viewStyle === 'kanban' ? 'bg-white dark:bg-zinc-750 text-gray-900 dark:text-zinc-50 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewStyle('list')}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${viewStyle === 'list' ? 'bg-white dark:bg-zinc-750 text-gray-900 dark:text-zinc-50 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              List View
            </button>
          </div>

        </div>

      </div>

      {/* Dynamic Tasks boards renders */}
      {viewStyle === 'kanban' ? (
        <div className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto md:overflow-x-visible snap-x pb-4">
          
          {/* Column 1: Pending */}
          <div className="bg-gray-100/50 dark:bg-zinc-900/40 border border-gray-150 dark:border-zinc-850/60 p-4.5 rounded-3xl flex flex-col min-h-[50vh] min-w-[280px] xs:min-w-[320px] md:min-w-0 flex-1 snap-center shrink-0">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-gray-855 dark:text-zinc-350 uppercase tracking-wider flex items-center gap-1.5">
                <Circle className="h-3.5 w-3.5 text-gray-400" />
                Pending
              </span>
              <span className="text-[10px] font-bold bg-gray-200 dark:bg-zinc-805 text-gray-655 dark:text-zinc-400 px-2 py-0.5 rounded-full">
                {pendingCol.length}
              </span>
            </div>

            <div className="space-y-4 flex-1">
              {pendingCol.map(task => (
                <TaskCard key={task.id} task={task} onEdit={handleOpenEditModal} onDelete={handleDeleteTask} onStatus={handleQuickStatusChange} />
              ))}
              {pendingCol.length === 0 && <EmptyStateCol label="Pending" />}
            </div>
          </div>

          {/* Column 2: In Progress */}
          <div className="bg-amber-50/10 dark:bg-amber-955/5 border border-amber-100/40 dark:border-amber-955/20 p-4.5 rounded-3xl flex flex-col min-h-[50vh] min-w-[280px] xs:min-w-[320px] md:min-w-0 flex-1 snap-center shrink-0">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-amber-650 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Play className="h-3.5 w-3.5 text-amber-550 fill-amber-550 shrink-0" />
                In Progress
              </span>
              <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-955/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
                {progressCol.length}
              </span>
            </div>

            <div className="space-y-4 flex-1">
              {progressCol.map(task => (
                <TaskCard key={task.id} task={task} onEdit={handleOpenEditModal} onDelete={handleDeleteTask} onStatus={handleQuickStatusChange} />
              ))}
              {progressCol.length === 0 && <EmptyStateCol label="Active" />}
            </div>
          </div>

          {/* Column 3: Completed */}
          <div className="bg-emerald-50/15 dark:bg-emerald-955/5 border border-emerald-100/45 dark:border-emerald-955/20 p-4.5 rounded-3xl flex flex-col min-h-[50vh] min-w-[280px] xs:min-w-[320px] md:min-w-0 flex-1 snap-center shrink-0">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-emerald-650 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-555 shrink-0" />
                Completed
              </span>
              <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-955/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                {completedCol.length}
              </span>
            </div>

            <div className="space-y-4 flex-1">
              {completedCol.map(task => (
                <TaskCard key={task.id} task={task} onEdit={handleOpenEditModal} onDelete={handleDeleteTask} onStatus={handleQuickStatusChange} />
              ))}
              {completedCol.length === 0 && <EmptyStateCol label="Completed" />}
            </div>
          </div>

        </div>
      ) : (
        /* List View rendering */
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-zinc-850/60 border-b border-gray-150 dark:border-zinc-850 font-bold text-gray-650 dark:text-zinc-400">
                  <th className="p-4">Task Name & Details</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Deadline</th>
                  <th className="p-4">Focused Hours</th>
                  <th className="p-4">Workflow Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-850 text-gray-800 dark:text-zinc-200">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map(task => (
                    <tr key={task.id} className="hover:bg-gray-50/75 dark:hover:bg-zinc-850/45 transition-colors">
                      <td className="p-4">
                        <span className="font-semibold text-gray-900 dark:text-zinc-50 block">{task.title}</span>
                        <p className="text-[11px] text-gray-500 mt-0.5 truncate max-w-sm">{task.description}</p>
                        <div className="flex gap-1.5 mt-1.5">
                          {task.tags.map(t => (
                            <span key={t} className="text-[9px] bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-350 px-1.5 py-0.5 rounded-md font-mono">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] inline-block px-2 py-0.5 rounded font-bold uppercase ${
                          task.priority === 'high' 
                            ? 'bg-red-50 text-red-650 dark:bg-red-950/20 dark:text-red-450' 
                            : task.priority === 'medium'
                            ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                            : 'bg-teal-50 text-teal-600 dark:bg-teal-950/20 dark:text-teal-400'
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 dark:text-zinc-400 font-mono">
                        {task.deadline}
                      </td>
                      <td className="p-4 text-gray-600 dark:text-zinc-300 font-mono">
                        {task.hoursWorked || 0} hrs
                      </td>
                      <td className="p-4">
                        <select
                          value={task.status}
                          onChange={(e) => handleQuickStatusChange(task, e.target.value as any)}
                          className="px-2 py-1 bg-gray-50 dark:bg-zinc-850 border border-gray-200 dark:border-zinc-850 rounded-lg text-[11px] font-medium"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => handleOpenEditModal(task)}
                            className="p-1.5 bg-gray-100 dark:bg-zinc-800 hover:bg-teal-500 dark:hover:bg-teal-500 rounded text-gray-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-950 transition-colors cursor-pointer"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1.5 bg-gray-150 dark:bg-zinc-800 hover:bg-red-500 rounded text-red-650 hover:text-white transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">
                      No matching task resources match these queries. Make a new task!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Structured Creator Task Modular Dialogue */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-55 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-6 border border-gray-200 dark:border-zinc-800 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4.5 right-4.5 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-gray-905 dark:text-zinc-50 mb-4">
              {editingTask ? 'Edit Task Details' : 'Create High-Priority Milestone Task'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-750 dark:text-zinc-350 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement bcrypt credential validations"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-gray-55/65 dark:bg-zinc-950/65 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none dark:text-zinc-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-750 dark:text-zinc-350 mb-1">Task Description</label>
                <textarea
                  placeholder="Summarize key requirements and operational steps..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-1.5 text-xs bg-gray-55/65 dark:bg-zinc-950/65 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none dark:text-zinc-50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-750 dark:text-zinc-350 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs bg-gray-55/65 dark:bg-zinc-950/65 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none dark:text-zinc-50"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-750 dark:text-zinc-350 mb-1">Due Deadline</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-gray-55/65 dark:bg-zinc-950/65 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none dark:text-zinc-50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-750 dark:text-zinc-350 mb-1">Focused Hours Worked</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="e.g. 2.5"
                    value={hoursWorked}
                    onChange={(e) => setHoursWorked(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-gray-55/65 dark:bg-zinc-950/65 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none dark:text-zinc-50 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-750 dark:text-zinc-350 mb-1">Workflow Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs bg-gray-55/65 dark:bg-zinc-950/65 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none dark:text-zinc-50"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-750 dark:text-zinc-350 mb-1">Configure Task Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. backend"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1 px-3 py-1.5 text-xs bg-gray-55/65 dark:bg-zinc-950/65 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none dark:text-zinc-50"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3.5 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 hover:dark:bg-zinc-700 text-xs rounded-xl font-bold dark:text-zinc-100 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
                  {tagsList.map((t, idx) => (
                    <span key={t + idx} className="text-[10px] bg-teal-50 dark:bg-teal-950/25 text-teal-650 dark:text-teal-400 pl-2 pr-1 py-0.5 rounded-md font-mono flex items-center gap-1">
                      #{t}
                      <button type="button" onClick={() => handleRemoveTag(idx)} className="text-gray-450 hover:text-red-500 cursor-pointer">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-750 dark:text-zinc-350 mb-1">Internal Reference Notes (Optional)</label>
                <textarea
                  placeholder="Add any extra notes, secrets or code snippets keys..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-1.5 text-xs bg-gray-55/65 dark:bg-zinc-950/65 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none dark:text-zinc-50 resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl text-xs font-medium dark:text-zinc-200 cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gray-950 dark:bg-teal-500 hover:bg-opacity-90 rounded-xl text-xs font-bold text-white dark:text-zinc-950 cursor-pointer"
                >
                  {editingTask ? 'Save Changes' : 'Publish Task'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Kanban Single Card sub-component
function TaskCard({ task, onEdit, onDelete, onStatus }: { 
  key?: string;
  task: Task; 
  onEdit: (task: Task) => void; 
  onDelete: (id: string) => any; 
  onStatus: (task: Task, next: 'pending' | 'in_progress' | 'completed') => any;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 p-4.5 rounded-2xl shadow-xs hover:shadow-md transition-all space-y-3 relative group"
    >
      <div className="flex justify-between items-start gap-2">
        <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wide leading-none ${
          task.priority === 'high' 
            ? 'bg-red-50 text-red-650 dark:bg-red-950/20 dark:text-red-400' 
            : task.priority === 'medium'
            ? 'bg-amber-50 text-amber-600 dark:bg-amber-955/20 dark:text-amber-400'
            : 'bg-teal-50 text-teal-655 dark:bg-teal-955/20 dark:text-teal-400'
        }`}>
          {task.priority} Priority
        </span>
        <div className="opacity-0 group-hover:opacity-100 flex gap-1.5 transition-opacity">
          <button onClick={() => onEdit(task)} className="p-1 text-gray-450 hover:text-teal-500 rounded hover:bg-gray-50 dark:hover:bg-zinc-850 cursor-pointer">
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => onDelete(task.id)} className="p-1 text-gray-450 hover:text-red-500 rounded hover:bg-gray-50 dark:hover:bg-zinc-850 cursor-pointer">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div>
        <h4 className="font-bold text-xs text-gray-901 dark:text-zinc-100 line-clamp-2">
          {task.title}
        </h4>
        {task.description && (
          <p className="text-[11px] text-gray-500 mt-1 line-clamp-3 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Task tags loop */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.map(t => (
            <span key={t} className="text-[9px] bg-gray-55/60 dark:bg-zinc-850/60 text-gray-650 dark:text-zinc-350 px-1.5 py-0.5 rounded-md font-mono">
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Footer statistics metadata */}
      <div className="pt-3 border-t border-gray-100 dark:border-zinc-850 flex justify-between items-center bg-gray-50/20">
        <span className="text-[10px] text-gray-480 dark:text-zinc-400 font-mono flex items-center gap-1 leading-none">
          <Calendar className="h-3 w-3 text-gray-400 shrink-0" />
          {task.deadline}
        </span>
        
        {task.hoursWorked !== undefined && (
          <span className="text-[10px] text-gray-480 dark:text-zinc-400 font-mono flex items-center gap-1 leading-none">
            <Clock className="h-3 w-3 text-gray-400 shrink-0" />
            {task.hoursWorked} hrs
          </span>
        )}
      </div>

      {/* Card manual status push lines */}
      <div className="flex gap-1.5 pt-1.5 select-none">
        {task.status !== 'pending' && (
          <button 
            onClick={() => onStatus(task, 'pending')}
            className="text-[9px] font-bold text-gray-400 hover:text-gray-650 cursor-pointer"
          >
            ← Pending
          </button>
        )}
        {task.status !== 'in_progress' && (
          <button 
            onClick={() => onStatus(task, 'in_progress')}
            className="text-[9px] font-bold text-amber-550 hover:text-amber-655 cursor-pointer"
          >
            {task.status === 'completed' ? '← In Progress' : 'In Progress →'}
          </button>
        )}
        {task.status !== 'completed' && (
          <button 
            onClick={() => onStatus(task, 'completed')}
            className="text-[9px] font-bold text-emerald-555 hover:text-emerald-650 cursor-pointer ml-auto"
          >
            Complete ✓
          </button>
        )}
      </div>

    </motion.div>
  );
}

function EmptyStateCol({ label }: { label: string }) {
  return (
    <div className="py-12 border border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl flex flex-col justify-center items-center text-center">
      <UserCheck2 className="h-6 w-6 text-gray-350 dark:text-zinc-600 mb-2 stroke-[1.5]" />
      <span className="text-[11px] font-bold text-gray-450 uppercase tracking-widest">{label} list Empty</span>
      <p className="text-[10px] text-gray-500 mt-1 max-w-xs px-2">No active items. Status shifts appear instantly.</p>
    </div>
  );
}
