export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  completed: boolean;
  dueDate: string;
  createdAt: string;
}

export interface Member {
  id: string;
  name: string;
  color: string;
  role?: string;
  age?: number;
  room?: string;
  email?: string;
  phone?: string;
  joinDate?: string;
  bio?: string;
} 