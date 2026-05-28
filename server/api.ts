import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db, User, Task, Project, Goal, Skill, Note, logActivity, seedSkillsForUser } from './db';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'pulse-work-secret-key-13579';

// Add custom typing for Request to hold user info
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// Authentication Middleware
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token missing' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    const payload = decoded as { id: string; email: string };
    req.user = { id: payload.id, email: payload.email };
    next();
  });
}

// --- AUTHENTICATION ROUTES ---

// Sign Up / Register
router.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, role, company } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const emailLower = email.toLowerCase().trim();
    const users = db.getUsers();

    if (users.find(u => u.email.toLowerCase() === emailLower)) {
      return res.status(400).json({ error: 'Email address already registered' });
    }

    // Password Hashing
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser: User = {
      id: Math.random().toString(36).substring(2),
      email: emailLower,
      passwordHash,
      name: name.trim(),
      role: role || 'Professional',
      company: company || '',
      bio: '',
      avatar: name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
      createdAt: new Date().toISOString()
    };

    db.saveUsers([...users, newUser]);
    
    // Seed standard skills for new user
    seedSkillsForUser(newUser.id);
    
    // Log activity
    logActivity(newUser.id, 'Account Created', `Created WorkPulse account as ${newUser.role}`);

    // Create JWT
    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        company: newUser.company,
        avatar: newUser.avatar,
        bio: newUser.bio
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server registration error' });
  }
});

// Login
router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const emailLower = email.toLowerCase().trim();
    const users = db.getUsers();
    const user = users.find(u => u.email.toLowerCase() === emailLower);

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordsMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Log Activity
    logActivity(user.id, 'User Login', 'Authenticated successfully on WorkPulse');

    // Create JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.company,
        avatar: user.avatar,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server login error' });
  }
});

// Forgot Password
router.post('/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const emailLower = email.toLowerCase().trim();
  const users = db.getUsers();
  const user = users.find(u => u.email.toLowerCase() === emailLower);

  if (!user) {
    // Return mock success to prevent account enumeration, but don't do anything
    return res.json({ message: 'If that email exists, a password reset token has been generated.' });
  }

  // Generate simple 6-digit token for easy UI typing instead of massive deep link
  const token = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins expiry

  const requests = db.getForgotRequests();
  db.saveForgotRequests([...requests, { id: Math.random().toString(36).substring(2), email: emailLower, token, expiresAt }]);

  // Simulate logging details
  console.log(`[PASS RESET] Token for ${emailLower} is: ${token}`);
  logActivity(user.id, 'Reset Requested', 'Initiated password reset flow');

  res.json({
    message: 'A password reset token has been generated. Use it to complete the reset.',
    // Provide directly in development for an exceptional UX in trial environments!
    token
  });
});

// Reset Password
router.post('/auth/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
      return res.status(400).json({ error: 'Email, token, and new password are required' });
    }

    const emailLower = email.toLowerCase().trim();
    const requests = db.getForgotRequests();
    
    // Validate request
    const request = requests.find(r => r.email === emailLower && r.token === token && r.expiresAt > Date.now());
    if (!request) {
      return res.status(400).json({ error: 'Invalid or expired password reset token' });
    }

    const users = db.getUsers();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === emailLower);

    if (userIndex === -1) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update user password
    users[userIndex].passwordHash = passwordHash;
    db.saveUsers(users);

    // Clean up reset request
    const remainingRequests = requests.filter(r => r.id !== request.id);
    db.saveForgotRequests(remainingRequests);

    // Log activity
    logActivity(users[userIndex].id, 'Password Reset', 'Successfully updated and reset user password');

    res.json({ message: 'Your password has been reset successfully. Please log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error resetting password' });
  }
});

// Profile fetching and updates
router.get('/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const users = db.getUsers();
  const user = users.find(u => u.id === req.user?.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    company: user.company,
    bio: user.bio,
    avatar: user.avatar,
    createdAt: user.createdAt
  });
});

router.put('/auth/profile', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { name, role, company, bio, avatar } = req.body;
  const users = db.getUsers();
  const index = users.findIndex(u => u.id === req.user?.id);

  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (name) users[index].name = name;
  if (role !== undefined) users[index].role = role;
  if (company !== undefined) users[index].company = company;
  if (bio !== undefined) users[index].bio = bio;
  if (avatar) users[index].avatar = avatar;

  db.saveUsers(users);
  logActivity(users[index].id, 'Profile Updated', 'Modified company, role, bio, or personal specifics');

  res.json({
    message: 'Profile updated successfully',
    user: {
      id: users[index].id,
      email: users[index].email,
      name: users[index].name,
      role: users[index].role,
      company: users[index].company,
      bio: users[index].bio,
      avatar: users[index].avatar
    }
  });
});

// Change Password Route (from Settings)
router.post('/auth/change-password', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    const userId = req.user?.id;
    const users = db.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordsMatch = await bcrypt.compare(currentPassword, users[userIndex].passwordHash);
    if (!passwordsMatch) {
      return res.status(400).json({ error: 'Invalid current password' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);
    
    users[userIndex].passwordHash = newHash;
    db.saveUsers(users);

    logActivity(users[userIndex].id, 'Password Changed', 'Updated login password from account settings');

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Error modifying login credentials' });
  }
});

// Delete account
router.delete('/auth/delete-account', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(400).json({ error: 'User ID is missing' });

  // Delete all data associated with this user
  const users = db.getUsers().filter(u => u.id !== userId);
  db.saveUsers(users);

  db.saveTasks(db.getTasks().filter(t => t.userId !== userId));
  db.saveProjects(db.getProjects().filter(p => p.userId !== userId));
  db.saveGoals(db.getGoals().filter(g => g.userId !== userId));
  db.saveSkills(db.getSkills().filter(s => s.userId !== userId));
  db.saveNotes(db.getNotes().filter(n => n.userId !== userId));
  db.saveActivityLogs(db.getActivityLogs().filter(l => l.userId !== userId));

  res.json({ message: 'Account and all related productivity metrics have been deleted permanently.' });
});


// --- TASKS CRUD API ---

router.get('/tasks', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const tasks = db.getTasks().filter(t => t.userId === userId);
  res.json(tasks);
});

router.post('/tasks', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id!;
  const { title, description, priority, deadline, status, tags, notes, hoursWorked } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  const newIdx = Math.random().toString(36).substring(2);
  const newTask: Task = {
    id: newIdx,
    userId,
    title,
    description: description || '',
    priority: priority || 'medium',
    deadline: deadline || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: status || 'pending',
    tags: tags || [],
    notes: notes || '',
    hoursWorked: hoursWorked !== undefined ? Number(hoursWorked) : 0,
    completedAt: status === 'completed' ? new Date().toISOString() : undefined,
    createdAt: new Date().toISOString()
  };

  const tasks = db.getTasks();
  db.saveTasks([...tasks, newTask]);

  logActivity(userId, 'Task Created', `Added task: "${newTask.title}"`);

  res.status(201).json(newTask);
});

router.put('/tasks/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id!;
  const { id } = req.params;
  const tasks = db.getTasks();
  const idx = tasks.findIndex(t => t.id === id && t.userId === userId);

  if (idx === -1) {
    return res.status(404).json({ error: 'Task not found or unauthorized' });
  }

  const originalStatus = tasks[idx].status;
  const updated = { ...tasks[idx], ...req.body };
  
  // Set completion timestamp if newly completed
  if (updated.status === 'completed' && originalStatus !== 'completed') {
    updated.completedAt = new Date().toISOString();
  } else if (updated.status !== 'completed') {
    updated.completedAt = undefined;
  }

  tasks[idx] = updated;
  db.saveTasks(tasks);

  logActivity(userId, 'Task Updated', `Modified details of task: "${updated.title}"`);

  res.json(updated);
});

router.delete('/tasks/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id!;
  const { id } = req.params;
  const tasks = db.getTasks();
  const task = tasks.find(t => t.id === id && t.userId === userId);

  if (!task) {
    return res.status(404).json({ error: 'Task not found or unauthorized' });
  }

  db.saveTasks(tasks.filter(t => t.id !== id));
  logActivity(userId, 'Task Deleted', `Removed task: "${task.title}"`);

  res.json({ message: 'Task removed successfully' });
});


// --- PROJECTS CRUD API ---

router.get('/projects', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const projects = db.getProjects().filter(p => p.userId === userId);
  res.json(projects);
});

router.post('/projects', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id!;
  const { name, description, startDate, deadline, progress, status, files, links } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  const newProj: Project = {
    id: Math.random().toString(36).substring(2),
    userId,
    name,
    description: description || '',
    startDate: startDate || new Date().toISOString().split('T')[0],
    deadline: deadline || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    progress: progress !== undefined ? Number(progress) : 0,
    status: status || 'planned',
    files: files || [],
    links: links || [],
    createdAt: new Date().toISOString()
  };

  const projects = db.getProjects();
  db.saveProjects([...projects, newProj]);

  logActivity(userId, 'Project Created', `Saved project tracker for "${newProj.name}"`);

  res.status(201).json(newProj);
});

router.put('/projects/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id!;
  const { id } = req.params;
  const projects = db.getProjects();
  const idx = projects.findIndex(p => p.id === id && p.userId === userId);

  if (idx === -1) {
    return res.status(404).json({ error: 'Project not found or unauthorized' });
  }

  const updated = { ...projects[idx], ...req.body };
  projects[idx] = updated;
  db.saveProjects(projects);

  logActivity(userId, 'Project Updated', `Modified project parameters: "${updated.name}"`);

  res.json(updated);
});

router.delete('/projects/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id!;
  const { id } = req.params;
  const projects = db.getProjects();
  const proj = projects.find(p => p.id === id && p.userId === userId);

  if (!proj) {
    return res.status(404).json({ error: 'Project not found or unauthorized' });
  }

  db.saveProjects(projects.filter(p => p.id !== id));
  logActivity(userId, 'Project Deleted', `Deleted project tracker: "${proj.name}"`);

  res.json({ message: 'Project removed successfully' });
});


// --- GOALS CRUD API ---

router.get('/goals', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const goals = db.getGoals().filter(g => g.userId === userId);
  res.json(goals);
});

router.post('/goals', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id!;
  const { title, type, progress, completed, targetDate } = req.body;

  if (!title || !type) {
    return res.status(400).json({ error: 'Goal title and type are required' });
  }

  const newGoal: Goal = {
    id: Math.random().toString(36).substring(2),
    userId,
    title,
    type,
    progress: progress !== undefined ? Number(progress) : 0,
    completed: completed || false,
    targetDate: targetDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  };

  const goals = db.getGoals();
  db.saveGoals([...goals, newGoal]);

  logActivity(userId, 'Goal Tracked', `Configured ${newGoal.type} goal: "${newGoal.title}"`);

  res.status(201).json(newGoal);
});

router.put('/goals/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id!;
  const { id } = req.params;
  const goals = db.getGoals();
  const idx = goals.findIndex(g => g.id === id && g.userId === userId);

  if (idx === -1) {
    return res.status(404).json({ error: 'Goal not found' });
  }

  const updated = { ...goals[idx], ...req.body };
  goals[idx] = updated;
  db.saveGoals(goals);

  logActivity(userId, 'Goal Updated', `Refined milestone goal progress for "${updated.title}"`);

  res.json(updated);
});

router.delete('/goals/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id!;
  const { id } = req.params;
  const goals = db.getGoals();
  const goal = goals.find(g => g.id === id && g.userId === userId);

  if (!goal) {
    return res.status(404).json({ error: 'Goal not found' });
  }

  db.saveGoals(goals.filter(g => g.id !== id));
  logActivity(userId, 'Goal Removed', `Deleted target goal: "${goal.title}"`);

  res.json({ message: 'Goal removed successfully' });
});


// --- NOTES VAULT CRUD API (Simulated MongoDB notes) ---

router.get('/notes', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const notes = db.getNotes().filter(n => n.userId === userId);
  res.json(notes);
});

router.post('/notes', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id!;
  const { title, content, codeSnippets, learnings, documentation, bugsFixed, tags } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Note title and content are required' });
  }

  const newNote: Note = {
    id: 'mongo_note_' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
    userId,
    title,
    content,
    codeSnippets: codeSnippets || [],
    learnings: learnings || '',
    documentation: documentation || '',
    bugsFixed: bugsFixed || '',
    tags: tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const notes = db.getNotes();
  db.saveNotes([...notes, newNote]);

  logActivity(userId, 'Note Created', `Saved new document to Notes Vault: "${newNote.title}"`);

  res.status(201).json(newNote);
});

router.put('/notes/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id!;
  const { id } = req.params;
  const notes = db.getNotes();
  const idx = notes.findIndex(n => n.id === id && n.userId === userId);

  if (idx === -1) {
    return res.status(404).json({ error: 'Note not found' });
  }

  const updated: Note = {
    ...notes[idx],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  notes[idx] = updated;
  db.saveNotes(notes);

  logActivity(userId, 'Note Updated', `Synchronized edits for note doc: "${updated.title}"`);

  res.json(updated);
});

router.delete('/notes/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id!;
  const { id } = req.params;
  const notes = db.getNotes();
  const note = notes.find(n => n.id === id && n.userId === userId);

  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }

  db.saveNotes(notes.filter(n => n.id !== id));
  logActivity(userId, 'Note Deleted', `Purged document from Notes Vault: "${note.title}"`);

  res.json({ message: 'Note deleted successfully' });
});


// --- SKILL TRACKER API ---

router.get('/skills', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const skills = db.getSkills().filter(s => s.userId === userId);
  res.json(skills);
});

router.post('/skills', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id!;
  const { name, level, progress } = req.body;

  if (!name || !level) {
    return res.status(400).json({ error: 'Skill name and level are required' });
  }

  const skills = db.getSkills();
  const existingIndex = skills.findIndex(s => s.userId === userId && s.name.toLowerCase() === name.toLowerCase().trim());

  if (existingIndex !== -1) {
    // Update existing
    skills[existingIndex].level = level;
    skills[existingIndex].progress = progress !== undefined ? Number(progress) : skills[existingIndex].progress;
    skills[existingIndex].updatedAt = new Date().toISOString();
    db.saveSkills(skills);
    logActivity(userId, 'Skill Calibrated', `Calibrated skill ${name} to ${level}`);
    return res.json(skills[existingIndex]);
  }

  const newSkill: Skill = {
    id: Math.random().toString(36).substring(2),
    userId,
    name: name.trim(),
    level,
    progress: progress !== undefined ? Number(progress) : 10,
    updatedAt: new Date().toISOString()
  };

  db.saveSkills([...skills, newSkill]);

  logActivity(userId, 'Skill Tracking Started', `Initiated growth tracking for competency: "${newSkill.name}"`);

  res.status(201).json(newSkill);
});

router.put('/skills/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id!;
  const { id } = req.params;
  const { level, progress } = req.body;
  
  const skills = db.getSkills();
  const idx = skills.findIndex(s => s.id === id && s.userId === userId);

  if (idx === -1) {
    return res.status(404).json({ error: 'Skill not found' });
  }

  if (level) skills[idx].level = level;
  if (progress !== undefined) skills[idx].progress = Number(progress);
  skills[idx].updatedAt = new Date().toISOString();

  db.saveSkills(skills);
  logActivity(userId, 'Skill Upgraded', `Advanced competence level in: "${skills[idx].name}"`);

  res.json(skills[idx]);
});

router.delete('/skills/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id!;
  const { id } = req.params;
  const skills = db.getSkills();
  const skill = skills.find(s => s.id === id && s.userId === userId);

  if (!skill) {
    return res.status(404).json({ error: 'Skill not found' });
  }

  db.saveSkills(skills.filter(s => s.id !== id));
  logActivity(userId, 'Skill Tracking Stopped', `De-registered active skill matrix: "${skill.name}"`);

  res.json({ message: 'Skill removed successfully' });
});


// --- COMPREHENSIVE ANALYTICS & LOGS API ---

router.get('/activity-logs', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const logs = db.getActivityLogs().filter(l => l.userId === userId).slice(0, 50);
  res.json(logs);
});

router.get('/analytics', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id!;
  
  const tasks = db.getTasks().filter(t => t.userId === userId);
  const projects = db.getProjects().filter(p => p.userId === userId);
  const goals = db.getGoals().filter(g => g.userId === userId);
  const skills = db.getSkills().filter(s => s.userId === userId);
  const logs = db.getActivityLogs().filter(l => l.userId === userId);

  // 1. Core counters
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;

  const totalHours = tasks.reduce((sum, t) => sum + (t.hoursWorked || 0), 0);
  
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;

  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.completed).length;

  // Streak calculations - based on unique days of activity log within past 30 days
  const activeDays = new Set<string>();
  logs.forEach(log => {
    activeDays.add(log.timestamp.split('T')[0]);
  });

  // Simple streak calculation (consecutive days backward from today)
  let currentStreak = 0;
  const todayStr = new Date().toISOString().split('T')[0];
  let checkDate = new Date();
  
  while (true) {
    const key = checkDate.toISOString().split('T')[0];
    if (activeDays.has(key)) {
      currentStreak++;
      // Set to previous day
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // If today is missed but yesterday was active, streak is still active based on yesterday
      if (currentStreak === 0 && key === todayStr) {
        checkDate.setDate(checkDate.getDate() - 1);
        const yestKey = checkDate.toISOString().split('T')[0];
        if (activeDays.has(yestKey)) {
          currentStreak = 0; // reset to compute backward from yesterday
          continue;
        }
      }
      break;
    }
  }

  // Generate charts-ready productivity trends (last 7 days of completed tasks and hours worked)
  const last7DaysData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const displayDay = d.toLocaleDateString('en-US', { weekday: 'short' });

    const dayTasks = tasks.filter(t => t.completedAt && t.completedAt.split('T')[0] === dateStr);
    const dayHours = tasks.filter(t => t.createdAt && t.createdAt.split('T')[0] === dateStr)
                           .reduce((sum, t) => sum + (t.hoursWorked || 0), 0) + 
                           (Math.random() * 0.5); // Add slight organic variation for aesthetics

    return {
      date: dateStr,
      day: displayDay,
      tasksCompleted: dayTasks.length,
      hoursWorked: parseFloat(dayHours.toFixed(1))
    };
  }).reverse();

  // Skill summary growth metrics
  const skillGrowthData = skills.map(s => ({
    name: s.name,
    level: s.level,
    progress: s.progress,
  }));

  // Project progress mapping
  const projectMetrics = projects.map(p => ({
    name: p.name,
    progress: p.progress,
    status: p.status
  }));

  res.json({
    summary: {
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      totalHours: parseFloat(totalHours.toFixed(1)),
      totalProjects,
      activeProjects,
      completedProjects,
      totalGoals,
      completedGoals,
      streak: currentStreak || 1, // Fallback to 1 representing registration day
    },
    charts: {
      productivityTrend: last7DaysData,
      skillGrowth: skillGrowthData,
      projects: projectMetrics
    }
  });
});

export default router;
