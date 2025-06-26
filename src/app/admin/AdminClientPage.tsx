'use client';

import { useState } from 'react';
import { Household } from '@/types';
import HouseholdModal from '@/components/HouseholdModal';
import HouseholdCard from '@/components/HouseholdCard';
import UserManagementModal from '@/components/UserManagementModal';
import TaskHistoryModal from '@/components/TaskHistoryModal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface AdminClientPageProps {
  initialHouseholds: Household[];
}

export default function AdminClientPage({ initialHouseholds }: AdminClientPageProps) {
  const [households, setHouseholds] = useState<Household[]>(initialHouseholds);
  const [showAddHousehold, setShowAddHousehold] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showTaskHistory, setShowTaskHistory] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'members'>('name');
  const router = useRouter();

  const refreshData = () => {
    router.refresh();
    toast.success('Data refreshed!');
  };

  const addHousehold = async (householdData: Omit<Household, 'id' | 'createdAt' | 'members' | 'tasks'>) => {
    try {
      const response = await fetch('/api/households', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(householdData),
      });
      if (!response.ok) throw new Error('Failed to create household');
      toast.success('Household created successfully!');
      setShowAddHousehold(false);
      refreshData();
    } catch (error) {
      toast.error('Failed to create household.');
      console.error(error);
    }
  };

  const deleteHousehold = async (householdId: string) => {
    if (!window.confirm('Are you sure you want to delete this household and all its data? This action cannot be undone.')) {
      return;
    }
    try {
      const response = await fetch(`/api/households/${householdId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete household');
      toast.success('Household deleted successfully.');
      refreshData();
    } catch (error) {
      toast.error('Failed to delete household.');
      console.error(error);
    }
  };

  const handleManageUsers = (household: Household) => {
    setSelectedHousehold(household);
    setShowUserManagement(true);
  };

  const handleUpdateHousehold = (updatedHousehold: Household) => {
    const updatedHouseholds = households.map(h => 
      h.id === updatedHousehold.id ? updatedHousehold : h
    );
    setHouseholds(updatedHouseholds);
  };

  // Filter and sort households
  const filteredHouseholds = households
    .filter(household =>
      household.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'members':
          return (b.members?.length || 0) - (a.members?.length || 0);
        default:
          return 0;
      }
    });

  const totalMembers = households.reduce((sum, h) => sum + (h.members?.length || 0), 0);
  const totalTasks = households.reduce((sum, h) => sum + (h.tasks?.length || 0), 0);
  const completedTasks = households.reduce((sum, h) => sum + (h.tasks?.filter(t => t.completed).length || 0), 0);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors"
            >
              <span className="text-xl">←</span>
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <Link href="/admin" className="inline-block w-full">
            <h1 className="text-4xl font-bold text-center mb-2 hover:text-blue-400 transition-colors cursor-pointer">🏠 Admin Dashboard</h1>
          </Link>
          <p className="text-gray-400 text-center">Manage all households in the system</p>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-orange-400">{households.length}</div>
            <div className="text-gray-400">Households</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-purple-400">{totalMembers}</div>
            <div className="text-gray-400">Total Members</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-blue-400">{totalTasks}</div>
            <div className="text-gray-400">Total Tasks</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-green-400">{completedTasks}</div>
            <div className="text-gray-400">Completed</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowAddHousehold(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <span className="text-xl">🏠</span>
              Add Household
            </button>
            <button
              onClick={() => setShowTaskHistory(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <span>📊</span>
              View All Task History
            </button>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search households..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 pl-10 text-gray-100 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            >
              <option value="name">Sort by Name</option>
              <option value="createdAt">Sort by Date</option>
              <option value="members">Sort by Members</option>
            </select>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6">
          <p className="text-gray-400">
            Showing {filteredHouseholds.length} of {households.length} households
          </p>
        </div>

        {/* Households Grid */}
        {filteredHouseholds.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHouseholds.map(household => (
              <HouseholdCard
                key={household.id}
                household={household}
                onDelete={deleteHousehold}
                onManageUsers={() => handleManageUsers(household)}
                showDelete={true}
                showManageUsers={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">🏠</div>
            <p>{searchTerm ? 'No households found matching your search.' : 'No households to display.'}</p>
          </div>
        )}
        
        {/* Modals */}
        {showAddHousehold && (
          <HouseholdModal
            onAdd={addHousehold}
            onClose={() => setShowAddHousehold(false)}
          />
        )}

        {showUserManagement && selectedHousehold && (
          <UserManagementModal
            household={selectedHousehold}
            onClose={() => {
              setShowUserManagement(false);
              setSelectedHousehold(null);
            }}
            onUpdate={handleUpdateHousehold}
          />
        )}

        {showTaskHistory && (
          <TaskHistoryModal
            onClose={() => setShowTaskHistory(false)}
          />
        )}
      </div>
    </div>
  );
} 