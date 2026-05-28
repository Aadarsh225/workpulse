import React, { useState } from 'react';
import { Project } from '../types';
import { api } from '../utils/api';
import { 
  Plus, 
  Tag as TagIcon, 
  FolderGit2, 
  Calendar, 
  Paperclip, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  Percent, 
  Clock, 
  Link2, 
  X,
  Sparkles,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { motion } from 'motion/react';

interface ProjectsViewProps {
  projects: Project[];
  triggerRefresh: () => void;
}

export function ProjectsView({ projects, triggerRefresh }: ProjectsViewProps) {
  // Modal toggle state
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'planned' | 'active' | 'completed'>('planned');
  const [files, setFiles] = useState<{ name: string; size: string; uploadedAt: string }[]>([]);
  const [links, setLinks] = useState<{ label: string; url: string }[]>([]);

  // Auxiliary fields
  const [linkLabel, setLinkLabel] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');

  const handleOpenCreateModal = () => {
    setEditingProject(null);
    setName('');
    setDescription('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setDeadline(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setProgress(0);
    setStatus('planned');
    setFiles([]);
    setLinks([]);
    setShowModal(true);
  };

  const handleOpenEditModal = (proj: Project) => {
    setEditingProject(proj);
    setName(proj.name);
    setDescription(proj.description);
    setStartDate(proj.startDate);
    setDeadline(proj.deadline);
    setProgress(proj.progress);
    setStatus(proj.status);
    setFiles(proj.files || []);
    setLinks(proj.links || []);
    setShowModal(true);
  };

  const handleAddLink = () => {
    if (!linkLabel || !linkUrl) return;
    setLinks([...links, { label: linkLabel.trim(), url: linkUrl.trim() }]);
    setLinkLabel('');
    setLinkUrl('');
  };

  const handleRemoveLink = (idx: number) => {
    setLinks(links.filter((_, i) => i !== idx));
  };

  const handleAddFile = () => {
    if (!fileName) return;
    setFiles([...files, { 
      name: fileName.trim(), 
      size: fileSize ? fileSize.trim() : '2.1 MB', 
      uploadedAt: new Date().toLocaleDateString() 
    }]);
    setFileName('');
    setFileSize('');
  };

  const handleRemoveFile = (idx: number) => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const payload = {
      name,
      description,
      startDate,
      deadline,
      progress: Number(progress),
      status,
      files,
      links
    };

    try {
      if (editingProject) {
        await api.put(`/projects/${editingProject.id}`, payload);
      } else {
        await api.post('/projects', payload);
      }
      triggerRefresh();
      setShowModal(false);
    } catch (err) {
      console.error('Failed to submit project updates:', err);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you absolutely certain you want to remove this project? This will erase all project tracking.')) {
      return;
    }
    try {
      await api.delete(`/projects/${id}`);
      triggerRefresh();
    } catch (err) {
      console.error('Failed to remove project resource:', err);
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full font-sans">
      
      {/* Header controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-150 dark:border-zinc-855 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-901 dark:text-zinc-50">Project Tracker</h1>
          <p className="text-xs text-gray-500 font-sans">Manage your multi-user corporate project lifecycles, files attachments, and milestone assets.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="px-4.5 py-2.5 bg-gray-950 hover:bg-gray-850 dark:bg-teal-500 dark:hover:bg-teal-655 text-white dark:text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          Create Project
        </button>
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <motion.div 
              key={proj.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 p-5 rounded-3xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex justify-between items-start gap-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider leading-none ${
                    proj.status === 'completed' 
                      ? 'bg-emerald-50 text-emerald-650 dark:bg-emerald-950/20 dark:text-emerald-400' 
                      : proj.status === 'active'
                      ? 'bg-amber-50 text-amber-600 dark:bg-amber-955/20 dark:text-amber-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}>
                    {proj.status}
                  </span>
                  
                  <div className="inline-flex gap-1">
                    <button onClick={() => handleOpenEditModal(proj)} className="p-1 text-gray-400 hover:text-teal-500 rounded hover:bg-gray-50 dark:hover:bg-zinc-850 cursor-pointer">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDeleteProject(proj.id)} className="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-gray-50 dark:hover:bg-zinc-850 cursor-pointer">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-2.5">
                  <h3 className="font-bold text-sm text-gray-901 dark:text-zinc-55">
                    {proj.name}
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1 lines-clamp-3 leading-relaxed">
                    {proj.description || 'No descriptive parameters registered for this workspace element.'}
                  </p>
                </div>
              </div>

              {/* Progress Slider Display */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 dark:text-zinc-350">
                  <span className="flex items-center gap-1">
                    <Percent className="h-3 w-3 text-teal-650 shrink-0" />
                    Project Scope Done
                  </span>
                  <span>{proj.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-zinc-805 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-teal-500 h-full rounded-full transition-all" 
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>
              </div>

              {/* Deadlines Block */}
              <div className="grid grid-cols-2 gap-2 bg-gray-50/75 dark:bg-zinc-850/30 p-2.5 rounded-xl border border-gray-100 dark:border-zinc-850">
                <div className="min-w-0">
                  <span className="block text-[8px] uppercase tracking-wider font-bold text-gray-405">Staged From</span>
                  <span className="text-[10px] font-mono font-semibold text-gray-650 dark:text-zinc-350 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-gray-400 shrink-0" />
                    {proj.startDate}
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="block text-[8px] uppercase tracking-wider font-bold text-gray-405">Due Target</span>
                  <span className="text-[10px] font-mono font-semibold text-gray-650 dark:text-zinc-355 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-gray-450 shrink-0" />
                    {proj.deadline}
                  </span>
                </div>
              </div>

              {/* Uploads and Attachments listing */}
              {(proj.files?.length > 0 || proj.links?.length > 0) && (
                <div className="space-y-3 pt-2 text-[11px]">
                  
                  {proj.files && proj.files.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="font-bold text-[10px] text-gray-455 uppercase tracking-wide block">Shared Files ({proj.files.length})</span>
                      <div className="space-y-1 max-h-16 overflow-y-auto">
                        {proj.files.map((f, i) => (
                          <div key={i} className="flex justify-between items-center bg-gray-50 dark:bg-zinc-855 px-2 py-1 rounded border border-gray-150/40 dark:border-zinc-850">
                            <span className="text-gray-700 dark:text-zinc-300 font-medium truncate flex items-center gap-1">
                              <Paperclip className="h-3 w-3 text-gray-400" />
                              {f.name}
                            </span>
                            <span className="text-[9px] text-gray-480 dark:text-zinc-450 shrink-0">{f.size}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {proj.links && proj.links.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="font-bold text-[10px] text-gray-455 uppercase tracking-wide block">Action Assets ({proj.links.length})</span>
                      <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
                        {proj.links.map((lnk, i) => (
                          <a 
                            key={i} 
                            href={lnk.url.startsWith('http') ? lnk.url : `https://${lnk.url}`}
                            target="_blank" 
                            referrerPolicy="no-referrer"
                            rel="noreferrer"
                            className="bg-teal-50/60 dark:bg-teal-950/20 text-teal-650 dark:text-teal-400 px-2 py-1 rounded inline-flex items-center gap-1 cursor-pointer font-medium border border-teal-100/40 hover:bg-teal-50 transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {lnk.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 py-16 rounded-3xl text-center flex flex-col justify-center items-center">
          <FolderGit2 className="h-10 w-10 text-gray-300 dark:text-zinc-700 stroke-[1.2] mb-3" />
          <h3 className="font-bold text-gray-800 dark:text-zinc-200 text-sm">No Active Core Projects Registered</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm px-4">Workspace pipelines display automatically inside beautiful responsive cards with secure resources.</p>
        </div>
      )}

      {/* Corporate Project configuration modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-55 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-6 border border-gray-200 dark:border-zinc-800 shadow-2xl relative">
            
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4.5 right-4.5 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-gray-901 dark:text-zinc-50 mb-3.5">
              {editingProject ? 'Configure Project Parameters' : 'Register Corporate Workspace Project'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WorkPulse SaaS release sequence"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-gray-55/65 dark:bg-zinc-950/65 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none dark:text-zinc-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">Core Description</label>
                <textarea
                  placeholder="Summarize constraints, repositories and team guidelines..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-1.5 text-xs bg-gray-55/65 dark:bg-zinc-950/65 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none dark:text-zinc-50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">StartDate</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-gray-55/65 dark:bg-zinc-950/65 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none dark:text-zinc-50 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">Deadline Date</label>
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
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">Completion Progress ({progress}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) => setProgress(Number(e.target.value))}
                    className="w-full accent-teal-500 my-2 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">Operational Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs bg-gray-55/65 dark:bg-zinc-950/65 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none dark:text-zinc-50"
                  >
                    <option value="planned">Planned (Staged)</option>
                    <option value="active">Active (Production)</option>
                    <option value="completed">Completed (Archived)</option>
                  </select>
                </div>
              </div>

              {/* Secure links attaching */}
              <div className="border-t border-gray-100 dark:border-zinc-800 pt-3">
                <span className="text-xs font-bold text-gray-700 dark:text-zinc-350 block mb-1">Action Links ({links.length})</span>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Link Label (e.g. GitHub repo)"
                    value={linkLabel}
                    onChange={(e) => setLinkLabel(e.target.value)}
                    className="flex-1 px-3 py-1 text-[11px] bg-gray-55/60 dark:bg-zinc-950/60 border border-gray-150 dark:border-zinc-800 rounded-lg focus:outline-none dark:text-zinc-50"
                  />
                  <input
                    type="text"
                    placeholder="URL (e.g. github.com/...)"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="flex-1 px-3 py-1 text-[11px] bg-gray-55/60 dark:bg-zinc-950/60 border border-gray-150 dark:border-zinc-800 rounded-lg focus:outline-none dark:text-zinc-50"
                  />
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 hover:dark:bg-zinc-700 text-[10px] rounded-lg font-bold dark:text-zinc-100 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {links.map((lnk, i) => (
                    <span key={i} className="text-[10px] bg-teal-50 dark:bg-teal-950/25 text-teal-655 dark:text-teal-400 px-2 py-0.5 rounded flex items-center gap-1">
                      {lnk.label}
                      <button type="button" onClick={() => handleRemoveLink(i)} className="text-gray-400 hover:text-red-500 cursor-pointer">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Secure files attaching */}
              <div className="border-t border-gray-100 dark:border-zinc-800 pt-3">
                <span className="text-xs font-bold text-gray-700 dark:text-zinc-355 block mb-1">Files & Attachments ({files.length})</span>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="File Name (e.g. schema.sql)"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="flex-1 px-3 py-1 text-[11px] bg-gray-55/60 dark:bg-zinc-950/60 border border-gray-150 dark:border-zinc-800 rounded-lg focus:outline-none dark:text-zinc-50"
                  />
                  <input
                    type="text"
                    placeholder="Size (e.g. 1.2 MB)"
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    className="w-24 px-3 py-1 text-[11px] bg-gray-55/60 dark:bg-zinc-950/60 border border-gray-150 dark:border-zinc-800 rounded-lg focus:outline-none dark:text-zinc-50"
                  />
                  <button
                    type="button"
                    onClick={handleAddFile}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 hover:dark:bg-zinc-700 text-[10px] rounded-lg font-bold dark:text-zinc-100 cursor-pointer"
                  >
                    Add File
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {files.map((f, i) => (
                    <span key={i} className="text-[10px] bg-indigo-50 dark:bg-indigo-950/25 text-indigo-650 dark:text-indigo-400 px-2 py-0.5 rounded flex items-center gap-1">
                      {f.name} ({f.size})
                      <button type="button" onClick={() => handleRemoveFile(i)} className="text-gray-400 hover:text-red-500 cursor-pointer">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2.5 border-t border-gray-100 dark:border-zinc-800">
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
                  {editingProject ? 'Save Specifications' : 'Publish Project'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
