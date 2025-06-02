import { Comment } from '@/types';

// Create some demo comments for demonstration
export const defaultComments: Comment[] = [
  {
    id: '1',
    task_id: '1', // "Clean the kitchen" from Smith Family Home
    user_id: '2', // John Smith
    content: 'I started cleaning the kitchen this morning. Will finish it after lunch.',
    created_at: '2024-03-14T10:30:00.000Z',
  },
  {
    id: '2',
    task_id: '1', // "Clean the kitchen" from Smith Family Home
    user_id: '1', // Admin User
    content: 'Great job! Make sure to clean behind the stove as well.',
    created_at: '2024-03-14T12:15:00.000Z',
  },
  {
    id: '3',
    task_id: '1', // "Clean the kitchen" from Smith Family Home
    user_id: '2', // John Smith
    content: 'Done! Kitchen is sparkling clean now. Also cleaned the microwave and dishwasher.',
    created_at: '2024-03-15T11:45:00.000Z',
  },
  {
    id: '4',
    task_id: '2', // "Take out trash" from Smith Family Home
    user_id: '2', // John Smith
    content: 'Will take this out when I go for groceries this evening.',
    created_at: '2024-03-15T14:20:00.000Z',
  },
  {
    id: '5',
    task_id: '3', // "Vacuum living room" from Downtown Apartment
    user_id: '3', // Taylor Johnson
    content: 'The vacuum cleaner is making weird noises. Might need to replace the bag.',
    created_at: '2024-03-16T09:30:00.000Z',
  },
  {
    id: '6',
    task_id: '3', // "Vacuum living room" from Downtown Apartment
    user_id: '1', // Admin User
    content: 'There are replacement bags in the utility closet. Let me know if you need help.',
    created_at: '2024-03-16T11:15:00.000Z',
  },
  {
    id: '7',
    task_id: '4', // "Clean bathroom" from Downtown Apartment
    user_id: '3', // Taylor Johnson
    content: 'Need to buy more cleaning supplies. Added toilet paper and bathroom cleaner to shopping list.',
    created_at: '2024-03-16T16:45:00.000Z',
  },
  {
    id: '8',
    task_id: '5', // "Pool maintenance" from Luxury Villa Estate
    user_id: '4', // Alex Villa
    content: 'Pool pH levels are a bit high. Will add some pH decreaser tomorrow.',
    created_at: '2024-03-17T08:20:00.000Z',
  },
  {
    id: '9',
    task_id: '5', // "Pool maintenance" from Luxury Villa Estate
    user_id: '4', // Alex Villa
    content: 'Pool is back to perfect condition! Ready for the weekend.',
    created_at: '2024-03-18T12:30:00.000Z',
  },
  {
    id: '10',
    task_id: '6', // "Garden care" from Luxury Villa Estate
    user_id: '4', // Alex Villa
    content: 'Planted new roses in the front garden. They should bloom beautifully this spring!',
    created_at: '2024-03-17T15:45:00.000Z',
  },
]; 