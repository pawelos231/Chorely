import { User } from '@/types';

// Simple hash function for demo purposes
const simpleHash = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
};

export const defaultUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@chorely.com',
    passwordHash: simpleHash('admin123'),
    createdAt: '2024-01-01T10:00:00.000Z',
    role: 'admin',
    households: ['1', '2', '3'], // Admin has access to all households
  },
  {
    id: '2',
    name: 'John Smith',
    email: 'john@example.com',
    passwordHash: simpleHash('password123'),
    createdAt: '2024-01-15T10:00:00.000Z',
    role: 'user',
    households: ['1'], // Member of Smith Family Home
  },
  {
    id: '3',
    name: 'Taylor Johnson',
    email: 'taylor@example.com',
    passwordHash: simpleHash('password123'),
    createdAt: '2024-02-01T14:30:00.000Z',
    role: 'user',
    households: ['2'], // Member of Downtown Apartment
  },
  {
    id: '4',
    name: 'Alex Villa',
    email: 'alex@example.com',
    passwordHash: simpleHash('password123'),
    createdAt: '2024-01-10T08:15:00.000Z',
    role: 'user',
    households: ['3'], // Member of Luxury Villa Estate
  },
]; 