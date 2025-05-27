import { Member } from '@/types';

export const defaultMembers: Member[] = [
  { 
    id: '1', 
    name: 'Alex', 
    color: 'bg-blue-500',
    role: 'Organizer',
    age: 25,
    room: 'Master Bedroom',
    email: 'alex@example.com',
    joinDate: new Date().toISOString(),
    bio: 'Loves keeping the house organized and clean!'
  },
  { 
    id: '2', 
    name: 'Sam', 
    color: 'bg-green-500',
    role: 'Chef',
    age: 23,
    room: 'Room 2',
    email: 'sam@example.com',
    joinDate: new Date().toISOString(),
    bio: 'The house chef who loves cooking for everyone.'
  },
  { 
    id: '3', 
    name: 'Jordan', 
    color: 'bg-purple-500',
    role: 'Student',
    age: 21,
    room: 'Room 3',
    email: 'jordan@example.com',
    joinDate: new Date().toISOString(),
    bio: 'Busy student but always helps with household tasks.'
  },
  { 
    id: '4', 
    name: 'Casey', 
    color: 'bg-orange-500',
    role: 'Professional',
    age: 27,
    room: 'Room 4',
    email: 'casey@example.com',
    joinDate: new Date().toISOString(),
    bio: 'Works from home and maintains the tech in the house.'
  },
];

export const categories = ['Kitchen', 'Bathroom', 'Living Room', 'Bedroom', 'Laundry', 'Outdoor', 'Other']; 