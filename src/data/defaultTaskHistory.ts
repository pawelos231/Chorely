import { TaskHistory } from '@/types';

// Create some demo task history entries for demonstration
export const defaultTaskHistory: TaskHistory[] = [
  {
    id: '1',
    task_id: '1', // "Clean the kitchen" from Smith Family Home
    changed_by: '2', // John Smith
    old_status: 'false',
    new_status: 'true',
    changed_at: '2024-03-15T10:30:00.000Z',
  },
  {
    id: '2',
    task_id: '1', // "Clean the kitchen" from Smith Family Home
    changed_by: '2', // John Smith
    old_status: 'created',
    new_status: 'false',
    changed_at: '2024-03-14T08:15:00.000Z',
  },
  {
    id: '3',
    task_id: '2', // "Take out trash" from Smith Family Home
    changed_by: '2', // John Smith
    old_status: 'false',
    new_status: 'true',
    changed_at: '2024-03-16T16:45:00.000Z',
  },
  {
    id: '4',
    task_id: '3', // "Vacuum living room" from Downtown Apartment
    changed_by: '3', // Taylor Johnson
    old_status: 'false',
    new_status: 'true',
    changed_at: '2024-03-17T14:20:00.000Z',
  },
  {
    id: '5',
    task_id: '4', // "Clean bathroom" from Downtown Apartment
    changed_by: '3', // Taylor Johnson
    old_status: 'created',
    new_status: 'false',
    changed_at: '2024-03-16T09:30:00.000Z',
  },
  {
    id: '6',
    task_id: '5', // "Pool maintenance" from Luxury Villa Estate
    changed_by: '4', // Alex Villa
    old_status: 'false',
    new_status: 'true',
    changed_at: '2024-03-18T11:15:00.000Z',
  },
  {
    id: '7',
    task_id: '6', // "Garden care" from Luxury Villa Estate
    changed_by: '4', // Alex Villa
    old_status: 'created',
    new_status: 'false',
    changed_at: '2024-03-17T07:45:00.000Z',
  },
  {
    id: '8',
    task_id: '2', // "Take out trash" was created initially
    changed_by: '2', // John Smith
    old_status: 'created',
    new_status: 'false',
    changed_at: '2024-03-15T12:00:00.000Z',
  }
]; 