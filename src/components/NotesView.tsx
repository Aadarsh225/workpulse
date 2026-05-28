import React, { useState } from 'react';
import { Note } from '../types';
import { api } from '../utils/api';
import { 
  Plus, 
  Search, 
  Trash2, 
  BookOpen, 
  X, 
  Tag as TagIcon, 
  Code, 
  Copy, 
  Check, 
  FileText, 
  Bug, 
  Lightbulb,
  Edit2
} from 'lucide-react';
import { motion } from 'motion/react';

interface NotesViewProps {
  notes: Note[];
  triggerRefresh: () => void;
}

export function NotesView({ notes, triggerRefresh }: NotesViewProps) {
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');

  // Modal controls
  const [showModal, setShowModal] = useState(false);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [learnings, setLearnings] = useState('');
  const [documentation, setDocumentation] = useState('');
  const [bugsFixed, setBugsFixed] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // Code snippet fields
  const [codeSnippets, setCodeSnippets] = useState<{ language: string; code: string; label?: string }[]>([]);
  const [codeLang, setCodeLang] = useState('typescript');
  const [codeContent, setCodeContent] = useState('');
  const [codeLabel, setCodeLabel] = useState('');

  // Copy status
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const allTags = Array.from(new Set(notes.flatMap(n => n.tags || [])));

  const handleOpenCreateModal = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setLearnings('');
    setDocumentation('');
    setBugsFixed('');
    setTags([]);
    setTagInput('');
    setCodeSnippets([]);
    setCodeLang('typescript');
    setCodeContent('');
    setCodeLabel('');
    setShowModal(true);
  };

  const handleOpenEditModal = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setLearnings(note.learnings || '');
    setDocumentation(note.documentation || '');
    setBugsFixed(note.bugsFixed || '');
    setTags(note.tags || []);
    setTagInput('');
    setCodeSnippets(note.codeSnippets || []);
    setShowModal(true);
    // Suppress viewing overlay during edits
    setViewingNote(null);
  };

  const handleAddCodeSnippet = () => {
    if (!codeContent) return;
    setCodeSnippets([...codeSnippets, { 
      language: codeLang, 
      code: codeContent, 
      label: codeLabel.trim() || 'Snippet' 
    }]);
    setCodeContent('');
    setCodeLabel('');
  };

  const handleRemoveSnippet = (idx: number) => {
    setCodeSnippets(codeSnippets.filter((_, i) => i !== idx));
  };

  const handleAddTag = () => {
    const clean = tagInput.trim().toLowerCase();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (idx: number) => {
    setTags(tags.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    const payload = {
      title,
      content,
      learnings,
      documentation,
      bugsFixed,
      tags,
      codeSnippets
    };

    try {
      if (editingNote) {
        await api.put(`/notes/${editingNote.id}`, payload);
      } else {
        await api.post('/notes', payload);
      }
      triggerRefresh();
      setShowModal(false);
    } catch (err) {
      console.error('Failed to submit note parameters:', err);
    }
  };

  const handleDeleteNote = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Are you absolutely certain you want to purge this document from Notes Vault?')) return;
    try {
      await api.delete(`/notes/${id}`);
      triggerRefresh();
      setViewingNote(null);
    } catch (err) {
      console.error('Failed to remove note document:', err);
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtration logic
  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          n.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === 'all' || n.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full font-sans">
      
      {/* Upper header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-150 dark:border-zinc-850 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-901 dark:text-zinc-50">Notes Vault</h1>
          <p className="text-xs text-gray-550">Securely store code snippets, technical documentation, architectural quick ideas and logs.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="px-4.5 py-2.5 bg-gray-950 hover:bg-gray-850 dark:bg-teal-500 dark:hover:bg-teal-655 text-white dark:text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          Capture Note
        </button>
      </div>

      {/* Filter and query tags */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white dark:bg-zinc-900 p-4 border border-gray-150 dark:border-zinc-850 rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search documents titles, text bodies, code guidelines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 dark:bg-zinc-850 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 dark:text-zinc-100 font-sans"
          />
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
        </div>

        <div className="flex items-center gap-2">
          <TagIcon className="h-4 w-4 text-gray-400 shrink-0" />
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 dark:bg-zinc-850 border border-gray-150 dark:border-zinc-800 rounded-xl text-xs font-semibold dark:text-zinc-100 focus:outline-none cursor-pointer"
          >
            <option value="all">All Note Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>#{tag}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Primary Vault Display grid */}
      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setViewingNote(note)}
              className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 p-5 rounded-3xl cursor-pointer hover:shadow-md transition-all flex flex-col justify-between space-y-4 group min-h-[12rem]"
            >
              <div className="space-y-2.5">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex gap-1.5 items-center">
                    {note.codeSnippets && note.codeSnippets.length > 0 ? (
                      <div className="p-1 px-1.5 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded text-[9px] font-bold flex items-center gap-1 uppercase">
                        <Code className="h-3 w-3" />
                        Snippets
                      </div>
                    ) : note.bugsFixed ? (
                      <div className="p-1 px-1.5 bg-red-50 dark:bg-red-955/20 text-red-655 dark:text-red-400 rounded text-[9px] font-bold flex items-center gap-1 uppercase">
                        <Bug className="h-3 w-3" />
                        Bugfix
                      </div>
                    ) : (
                      <div className="p-1 px-1.5 bg-teal-50 dark:bg-teal-950/20 text-teal-655 dark:text-teal-400 rounded text-[9px] font-bold flex items-center gap-1 uppercase">
                        <FileText className="h-3 w-3" />
                        Idea
                      </div>
                    )}
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleOpenEditModal(note); }}
                      className="p-1 text-gray-400 hover:text-teal-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded cursor-pointer"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteNote(note.id, e)}
                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-gray-901 dark:text-zinc-55 line-clamp-1">
                    {note.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1 lines-clamp-3 leading-relaxed">
                    {note.content}
                  </p>
                </div>
              </div>

              {/* Tags listed footer */}
              <div className="pt-3 border-t border-gray-100 dark:border-zinc-850 flex flex-wrap items-center justify-between gap-1.5">
                <div className="flex flex-wrap gap-1">
                  {note.tags.map(t => (
                    <span key={t} className="text-[9px] bg-gray-55/65 dark:bg-zinc-850/60 text-gray-650 dark:text-zinc-350 px-1.5 py-0.5 rounded-md font-mono">
                      #{t}
                    </span>
                  ))}
                </div>
                <span className="text-[9px] text-gray-400 font-mono">
                  {new Date(note.updatedAt || note.createdAt).toLocaleDateString()}
                </span>
              </div>

            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 py-16 rounded-3xl text-center flex flex-col justify-center items-center">
          <BookOpen className="h-10 w-10 text-gray-300 dark:text-zinc-750 stroke-[1.2] mb-3" />
          <h3 className="font-bold text-gray-800 dark:text-zinc-200 text-sm">Notes Vault Empty</h3>
          <p className="text-xs text-gray-550 mt-1 max-w-sm px-4">Retain complex code blocks and fix records cleanly. Tap Capture Note to fill details.</p>
        </div>
      )}

      {/* Note Detailed viewer modal */}
      {viewingNote && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-55 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-2xl w-full p-6.5 border border-gray-200 dark:border-zinc-855 shadow-2xl relative space-y-5">
            
            <button
              onClick={() => setViewingNote(null)}
              className="absolute top-4.5 right-4.5 text-gray-400 hover:text-gray-650"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <div className="flex gap-2 items-center text-[10px] font-mono font-bold text-teal-655 dark:text-teal-400">
                <span>Vault Element</span>
                <span>•</span>
                <span>Updated: {new Date(viewingNote.updatedAt).toLocaleDateString()}</span>
              </div>
              <h2 className="text-lg font-bold text-gray-901 dark:text-zinc-50 mt-1 leading-tight">{viewingNote.title}</h2>
            </div>

            <div className="space-y-4 text-xs font-sans text-gray-800 dark:text-zinc-200 leading-relaxed max-h-96 overflow-y-auto pr-1">
              
              {/* Note Content */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-450 block mb-1">Body Text</span>
                <p className="p-3 bg-gray-50 dark:bg-zinc-855 rounded-xl border border-gray-150/40 dark:border-zinc-855 whitespace-pre-wrap leading-relaxed">{viewingNote.content}</p>
              </div>

              {/* Learnings */}
              {viewingNote.learnings && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-450 block mb-1 flex items-center gap-1">
                    <Lightbulb className="h-3.5 w-3.5" /> Key Learning Takeaway
                  </span>
                  <p className="p-3 bg-emerald-50/15 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-355 border border-emerald-100/40 dark:border-emerald-950/20 rounded-xl whitespace-pre-wrap">{viewingNote.learnings}</p>
                </div>
              )}

              {/* Documentation parameters */}
              {viewingNote.documentation && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-455 block mb-1">Architecture Docs</span>
                  <p className="p-3 bg-gray-50 dark:bg-zinc-850/30 rounded-xl border border-gray-150/40 dark:border-zinc-850 font-mono text-[10.5px] whitespace-pre-wrap leading-tight">{viewingNote.documentation}</p>
                </div>
              )}

              {/* Resolved bugs parameters */}
              {viewingNote.bugsFixed && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-450 block mb-1 flex items-center gap-1 text-red-655 dark:text-red-400">
                    <Bug className="h-3.5 w-3.5" /> Bugfix resolution record
                  </span>
                  <p className="p-3 bg-red-50/15 dark:bg-red-955/10 text-red-655 dark:text-red-400 border border-red-100/40 dark:border-red-955/20 rounded-xl whitespace-pre-wrap">{viewingNote.bugsFixed}</p>
                </div>
              )}

              {/* Code Snippets loop */}
              {viewingNote.codeSnippets && viewingNote.codeSnippets.length > 0 && (
                <div className="space-y-3.5 border-t border-gray-100 dark:border-zinc-850 pt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-450 block">Code Blocks ({viewingNote.codeSnippets.length})</span>
                  
                  {viewingNote.codeSnippets.map((snippet, idx) => {
                    const snipId = `snippet_${viewingNote.id}_${idx}`;
                    return (
                      <div key={idx} className="bg-gray-950 rounded-xl border border-zinc-900 overflow-hidden">
                        <div className="bg-zinc-900 px-4 py-2 flex justify-between items-center text-[10px] font-mono text-zinc-400 border-b border-zinc-950">
                          <span className="font-bold text-zinc-300">{snippet.label || 'Snippet'} ({snippet.language})</span>
                          <button
                            onClick={() => handleCopyCode(snippet.code, snipId)}
                            className="hover:text-white flex items-center gap-1 select-none cursor-pointer font-sans"
                          >
                            {copiedId === snipId ? <Check className="h-3.5 w-3.5 text-teal-400" /> : <Copy className="h-3.5 w-3.5" />}
                            {copiedId === snipId ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <pre className="p-4 overflow-x-auto text-zinc-100 font-mono text-[11px] leading-relaxed select-all">
                          <code>{snippet.code}</code>
                        </pre>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-zinc-850 flex justify-end gap-2.5">
              <button
                onClick={(e) => { e.stopPropagation(); handleOpenEditModal(viewingNote); }}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl text-xs font-semibold dark:text-zinc-100 flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit Document
              </button>
              <button
                onClick={() => setViewingNote(null)}
                className="px-5 py-2 px-4.5 bg-gray-950 dark:bg-zinc-800 hover:opacity-90 rounded-xl text-xs font-bold text-white cursor-pointer"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Structured creator / editor Note document drawer */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-55 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-xl w-full p-6 border border-gray-200 dark:border-zinc-805 shadow-2xl relative">
            
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4.5 right-4.5 text-gray-400 hover:text-gray-650"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-gray-901 dark:text-zinc-55 mb-3.5">
              {editingNote ? 'Modify Note Document' : 'Capture New notes Vault Parameter'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. JWT Token Refresh Mechanism schema"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-gray-55/65 dark:bg-zinc-950/65 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none dark:text-zinc-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">Content description</label>
                <textarea
                  required
                  placeholder="Record key ideas or core observations here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-1.5 text-xs bg-gray-55/65 dark:bg-zinc-950/65 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none dark:text-zinc-50 resize-none font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">Key Learning Takeaways</label>
                  <textarea
                    placeholder="Document discoveries or key lessons learned..."
                    value={learnings}
                    onChange={(e) => setLearnings(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-1.5 text-xs bg-gray-55/65 dark:bg-zinc-950/65 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none dark:text-zinc-50 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">Bug-Fix Resolutions</label>
                  <textarea
                    placeholder="Detail bug behavior, core cause, and final fix..."
                    value={bugsFixed}
                    onChange={(e) => setBugsFixed(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-1.5 text-xs bg-gray-55/65 dark:bg-zinc-950/65 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none dark:text-zinc-50 resize-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">Technical documentation details (Optional)</label>
                <textarea
                  placeholder="Structure API requests, endpoints parameters or database definitions..."
                  value={documentation}
                  onChange={(e) => setDocumentation(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-1.5 text-xs bg-gray-55/65 dark:bg-zinc-950/65 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none dark:text-zinc-50 font-mono resize-none"
                />
              </div>

              {/* Configure code snippets block */}
              <div className="border-t border-gray-100 dark:border-zinc-800 pt-3">
                <span className="text-xs font-bold text-gray-700 dark:text-zinc-300 block mb-1.5 flex items-center gap-1">
                  <Code className="h-4 w-4" /> Added Code Snippets ({codeSnippets.length})
                </span>
                <div className="space-y-2 mb-2 p-3 bg-gray-50 dark:bg-zinc-955 rounded-xl border border-gray-150/40 dark:border-zinc-850">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Label (e.g. authMiddleware.ts)"
                      value={codeLabel}
                      onChange={(e) => setCodeLabel(e.target.value)}
                      className="px-2.5 py-1 text-xs bg-white dark:bg-zinc-950 border border-gray-150 dark:border-zinc-800 rounded-lg dark:text-zinc-100"
                    />
                    <select
                      value={codeLang}
                      onChange={(e) => setCodeLang(e.target.value)}
                      className="px-2 py-1 text-xs bg-white dark:bg-zinc-950 border border-gray-150 dark:border-zinc-800 rounded-lg dark:text-zinc-100 focus:outline-none"
                    >
                      <option value="typescript">TypeScript</option>
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="sql">SQL / Postgres</option>
                      <option value="html">HTML / CSS</option>
                      <option value="shell">Shell / Docker</option>
                    </select>
                  </div>
                  <textarea
                    placeholder="Paste code blocks here..."
                    value={codeContent}
                    onChange={(e) => setCodeContent(e.target.value)}
                    rows={3}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-950 border border-gray-150 dark:border-zinc-800 rounded-lg focus:outline-none dark:text-zinc-50 font-mono resize-none"
                  />
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={handleAddCodeSnippet}
                      className="px-3.5 py-1.5 bg-gray-950 dark:bg-teal-500 text-white dark:text-zinc-950 text-[10px] rounded-lg font-bold cursor-pointer"
                    >
                      Record Code block
                    </button>
                  </div>
                </div>

                {/* Listing added snippets */}
                <div className="space-y-1.5 max-h-24 overflow-y-auto">
                  {codeSnippets.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-50 dark:bg-zinc-850 px-2.5 py-1 rounded text-[11px] border border-gray-150/40 dark:border-zinc-800">
                      <span className="font-semibold text-gray-700 dark:text-zinc-300 truncate">
                        {item.label} ({item.language})
                      </span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSnippet(idx)}
                        className="text-gray-400 hover:text-red-500 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configure Note Tags */}
              <div className="border-t border-gray-100 dark:border-zinc-800 pt-3">
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">Coordinate Document Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. backend"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1 px-3 py-1.5 text-xs bg-gray-55/65 dark:bg-zinc-955/65 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none dark:text-zinc-50"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3.5 bg-gray-100 hover:bg-gray-205 dark:bg-zinc-800 hover:dark:bg-zinc-700 text-xs rounded-xl font-bold dark:text-zinc-100 cursor-pointer"
                  >
                    Add tag
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {tags.map((t, idx) => (
                    <span key={idx} className="text-[10px] bg-teal-50 dark:bg-teal-950/25 text-teal-655 dark:text-teal-400 pl-2 pr-1 py-0.5 rounded-md font-mono flex items-center gap-1 border border-teal-100/40">
                      #{t}
                      <button type="button" onClick={() => handleRemoveTag(idx)} className="text-gray-400 hover:text-red-550 cursor-pointer">
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
                  {editingNote ? 'Save note document' : 'Secure Note'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
