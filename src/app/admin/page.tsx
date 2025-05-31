'use client';

import { useState, useEffect } from 'react';
import { Household } from '@/types';
import HouseholdModal from '@/components/HouseholdModal';
import HouseholdCard from '@/components/HouseholdCard';
import UserManagementModal from '@/components/UserManagementModal';
import { defaultHouseholds } from '@/data/defaultHouseholds';
import Link from 'next/link';

export default function AdminPage() {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [showAddHousehold, setShowAddHousehold] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'size' | 'members'>('name');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load households from localStorage on component mount
  useEffect(() => {
    console.log('Admin: Loading households from localStorage...');
    const savedHouseholds = localStorage.getItem('chorely-households');
    console.log('Admin: Raw localStorage data:', savedHouseholds);
    
    if (savedHouseholds) {
      try {
        const parsedHouseholds = JSON.parse(savedHouseholds);
        console.log('Admin: Parsed households:', parsedHouseholds);
        setHouseholds(parsedHouseholds);
      } catch (error) {
        console.error('Admin: Error parsing households:', error);
        setHouseholds(defaultHouseholds);
        localStorage.setItem('chorely-households', JSON.stringify(defaultHouseholds));
      }
    } else {
      // Initialize with default households if none exist
      console.log('Admin: No saved households found, using defaults');
      setHouseholds(defaultHouseholds);
      localStorage.setItem('chorely-households', JSON.stringify(defaultHouseholds));
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever households change (but only after initial load)
  useEffect(() => {
    if (isLoaded && households.length > 0) {
      console.log('Admin: Saving households to localStorage:', households);
      localStorage.setItem('chorely-households', JSON.stringify(households));
    }
  }, [households, isLoaded]);

  const addHousehold = (householdData: Omit<Household, 'id' | 'createdAt' | 'members' | 'tasks'>) => {
    const newHousehold: Household = {
      ...householdData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      members: [],
      tasks: [],
    };
    
    console.log('Admin: Adding new household:', newHousehold);
    const updatedHouseholds = [...households, newHousehold];
    setHouseholds(updatedHouseholds);
    
    console.log('Admin: Updated households list:', updatedHouseholds);
    setShowAddHousehold(false);
  };

  const deleteHousehold = (householdId: string) => {
    setHouseholds(households.filter(h => h.id !== householdId));
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
      household.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      household.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      household.houseType?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'size':
          return b.houseSize - a.houseSize;
        case 'members':
          return b.members.length - a.members.length;
        default:
          return 0;
      }
    });

  const totalMembers = households.reduce((sum, h) => sum + h.members.length, 0);
  const totalTasks = households.reduce((sum, h) => sum + h.tasks.length, 0);
  const completedTasks = households.reduce((sum, h) => sum + h.tasks.filter(t => t.completed).length, 0);
  const totalSize = households.reduce((sum, h) => sum + h.houseSize, 0);

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
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-center mb-2 hover:text-blue-400 transition-colors cursor-pointer">🏠 Admin Dashboard</h1>
          </Link>
          <p className="text-gray-400 text-center">Manage all households in the system</p>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
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
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-cyan-400">{totalSize.toLocaleString()}m²</div>
            <div className="text-gray-400">Total Size</div>
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
              <option value="size">Sort by Size</option>
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
                onManageUsers={handleManageUsers}
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

        {/* Quick Actions */}
        {households.length > 0 && (
          <div className="mt-12 bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-gray-100 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h4 className="font-bold text-gray-100 mb-2">📊 Analytics</h4>
                <p className="text-gray-400 text-sm mb-3">View detailed analytics across all households</p>
                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                  View Analytics →
                </button>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h4 className="font-bold text-gray-100 mb-2">📋 Bulk Actions</h4>
                <p className="text-gray-400 text-sm mb-3">Perform actions on multiple households</p>
                <button className="text-green-400 hover:text-green-300 text-sm font-medium">
                  Bulk Manage →
                </button>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h4 className="font-bold text-gray-100 mb-2">⚙️ Settings</h4>
                <p className="text-gray-400 text-sm mb-3">Configure system-wide settings</p>
                <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                  Settings →
                </button>
              </div>
            </div>
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
      </div>
    </div>
  );
} 