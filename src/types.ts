export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  company?: string;
  bio?: string;
  avatar?: string;
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
  progress: number;
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
  progress: number;
  completed: boolean;
  targetDate: string;
  createdAt: string;
}

export interface Skill {
  id: string;
  userId: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  progress: number;
  updatedAt: string;
}

export interface Note {
  id: string;
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

export interface AnalyticsSummary {
  summary: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    totalHours: number;
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalGoals: number;
    completedGoals: number;
    streak: number;
  };
  charts: {
    productivityTrend: {
      date: string;
      day: string;
      tasksCompleted: number;
      hoursWorked: number;
    }[];
    skillGrowth: {
      name: string;
      level: string;
      progress: number;
    }[];
    projects: {
      name: string;
      progress: number;
      status: string;
    }[];
  };
}
