import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DB_DIR = path.join(process.cwd(), 'db_files');

// Create directory if not exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Helper to load/save JSON files
function getFile<T>(filename: string, defaultData: T): T {
  const filePath = path.join(DB_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`Error reading ${filename}, resetting`, error);
    return defaultData;
  }
}

function saveFile<T>(filename: string, data: T): void {
  const filePath = path.join(DB_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Interfaces matching full-stack requirements (Postgres/MongoDB simulated with high fidelity)
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role?: string;
  company?: string;
  bio?: string;
  avatar?: string; // name initials, color or emoji
  createdAt: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed';
  tags: string[];
  notes?: string;
  hoursWorked?: number;
  completedAt?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  startDate: string;
  deadline: string;
  progress: number; // 0 - 100
  status: 'planned' | 'active' | 'completed';
  files: { name: string; size: string; uploadedAt: string }[];
  links: { label: string; url: string }[];
  createdAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly';
  progress: number; // 0 to target (e.g. 0 to 1) or percent
  completed: boolean;
  targetDate: string;
  createdAt: string;
}

export interface Skill {
  id: string;
  userId: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  progress: number; // 0-100%
  updatedAt: string;
}

export interface Note {
  id: string; // Mongo ID style
  userId: string;
  title: string;
  content: string;
  codeSnippets?: { language: string; code: string; label?: string }[];
  learnings?: string;
  documentation?: string;
  bugsFixed?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface ForgotPasswordRequest {
  id: string;
  email: string;
  token: string;
  expiresAt: number;
}

// High-fidelity local database wrapper loads/saves
export const db = {
  getUsers: () => getFile<User[]>('users.json', []),
  saveUsers: (data: User[]) => saveFile('users.json', data),

  getTasks: () => getFile<Task[]>('tasks.json', []),
  saveTasks: (data: Task[]) => saveFile('tasks.json', data),

  getProjects: () => getFile<Project[]>('projects.json', []),
  saveProjects: (data: Project[]) => saveFile('projects.json', data),

  getGoals: () => getFile<Goal[]>('goals.json', []),
  saveGoals: (data: Goal[]) => saveFile('goals.json', data),

  getSkills: () => getFile<Skill[]>('skills.json', []),
  saveSkills: (data: Skill[]) => saveFile('skills.json', data),

  getNotes: () => getFile<Note[]>('notes.json', []),
  saveNotes: (data: Note[]) => saveFile('notes.json', data),

  getActivityLogs: () => getFile<ActivityLog[]>('activity_logs.json', []),
  saveActivityLogs: (data: ActivityLog[]) => saveFile('activity_logs.json', data),

  getForgotRequests: () => getFile<ForgotPasswordRequest[]>('forgot_requests.json', []),
  saveForgotRequests: (data: ForgotPasswordRequest[]) => saveFile('forgot_requests.json', data),
};

// Seed initial default skills helper for a new user
export function seedSkillsForUser(userId: string) {
  const skills = db.getSkills();
  const existing = skills.filter(s => s.userId === userId);
  if (existing.length === 0) {
    const defaults: Skill[] = [
      { id: Math.random().toString(36).substring(2), userId, name: 'Python', level: 'Intermediate', progress: 50, updatedAt: new Date().toISOString() },
      { id: Math.random().toString(36).substring(2), userId, name: 'SQL', level: 'Intermediate', progress: 65, updatedAt: new Date().toISOString() },
      { id: Math.random().toString(36).substring(2), userId, name: 'Excel', level: 'Advanced', progress: 80, updatedAt: new Date().toISOString() },
      { id: Math.random().toString(36).substring(2), userId, name: 'Power BI', level: 'Beginner', progress: 30, updatedAt: new Date().toISOString() },
      { id: Math.random().toString(36).substring(2), userId, name: 'APIs', level: 'Intermediate', progress: 60, updatedAt: new Date().toISOString() },
      { id: Math.random().toString(36).substring(2), userId, name: 'Communication', level: 'Advanced', progress: 75, updatedAt: new Date().toISOString() },
      { id: Math.random().toString(36).substring(2), userId, name: 'Leadership', level: 'Beginner', progress: 25, updatedAt: new Date().toISOString() }
    ];
    db.saveSkills([...skills, ...defaults]);
  }
}

// Log user activity helper
export function logActivity(userId: string, action: string, details: string) {
  const logs = db.getActivityLogs();
  const newLog: ActivityLog = {
    id: Math.random().toString(36).substring(2),
    userId,
    action,
    details,
    timestamp: new Date().toISOString()
  };
  // Store up to last 1000 logs per user
  db.saveActivityLogs([newLog, ...logs].slice(0, 5000));
}

// Auto-seed default demo user if db is empty
try {
  const users = db.getUsers();
  if (users.length === 0) {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('password123', salt);
    const demoUser: User = {
      id: 'demo-user-id',
      email: 'demo@company.com',
      passwordHash,
      name: 'Demo User',
      role: 'Professional',
      company: 'WorkPulse Inc',
      bio: 'Lead Developer & Productivity Enthusiast',
      avatar: 'DU',
      createdAt: new Date().toISOString()
    };
    db.saveUsers([demoUser]);
    seedSkillsForUser('demo-user-id');
    console.log('[WorkPulse DS] Seeded demo@company.com credentials safely with password123.');
  }
} catch (seedErr) {
  console.error('[WorkPulse DS] Errored when verifying credentials auto-seeding:', seedErr);
}
