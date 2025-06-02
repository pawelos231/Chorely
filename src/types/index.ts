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

export interface Household {
  id: string;
  name: string;
  numberOfRooms: number;
  houseSize: number; // in square meters
  numberOfFloors: number;
  address?: string;
  houseType?: 'apartment' | 'house' | 'studio' | 'villa' | 'other';
  hasGarden?: boolean;
  hasGarage?: boolean;
  hasBasement?: boolean;
  hasAttic?: boolean;
  description?: string;
  createdAt: string;
  members: Member[];
  tasks: Task[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'user';
  households: string[]; // Array of household IDs user has access to
  created_at: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  households: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface TaskHistory {
  id: string;
  task_id: string;
  changed_by: string;
  old_status: string;
  new_status: string;
  changed_at: string;
}

export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
} 