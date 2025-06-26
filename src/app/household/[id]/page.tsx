import { Household } from '@/types';
import HouseholdClientPage from './HouseholdClientPage';
import { notFound } from 'next/navigation';

async function getHouseholdData(id: string): Promise<Household | null> {
  // This URL needs to be absolute when fetching from a server component
  const res = await fetch(`http://localhost:3000/api/household/${id}`, {
    cache: 'no-store', // Disable caching for dynamic data
  });

  if (!res.ok) {
    if (res.status === 404) {
      return null;
    }
    // You might want to handle other errors differently
    throw new Error('Failed to fetch household data');
  }
  return res.json();
}

interface HouseholdPageProps {
  params: {
    id: string;
  };
}

export default async function HouseholdPage({ params }: HouseholdPageProps) {
  const household = await getHouseholdData(params.id);

  if (!household) {
    notFound();
  }

  return <HouseholdClientPage initialHousehold={household} />;
}