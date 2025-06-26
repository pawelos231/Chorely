import { Household } from '@/types';
import AdminClientPage from './AdminClientPage';

async function getAllHouseholds(): Promise<Household[]> {
  const res = await fetch('http://localhost:3000/api/households', {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch households');
  }
  return res.json();
}

export default async function AdminPage() {
  const households = await getAllHouseholds();
  return <AdminClientPage initialHouseholds={households} />;
} 