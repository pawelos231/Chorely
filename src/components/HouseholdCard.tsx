'use client';

import { Household } from '@/types';
import Link from 'next/link';

interface HouseholdCardProps {
  household: Household;
  onDelete?: (householdId: string) => void;
  onManageUsers?: (household: Household) => void;
  showDelete?: boolean;
  showManageUsers?: boolean;
}

export default function HouseholdCard({ 
  household, 
  onDelete, 
  onManageUsers, 
  showDelete = false, 
  showManageUsers = false 
}: HouseholdCardProps) {
  // Safely access tasks and members, default to an empty array if undefined
  const tasks = household.tasks || [];
  const members = household.members || [];
  
  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete && window.confirm(`Are you sure you want to delete "${household.name}"? This action cannot be undone.`)) {
      onDelete(household.id);
    }
  };

  const handleManageUsers = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onManageUsers) {
      onManageUsers(household);
    }
  };

  const handleCardClick = () => {
    console.log('Navigating to household:', household.id, household.name);
  };

  const getHouseTypeIcon = (type: string) => {
    switch (type) {
      case 'apartment': return '🏢';
      case 'house': return '🏠';
      case 'studio': return '🏠';
      case 'villa': return '🏰';
      default: return '🏠';
    }
  };

  return (
    <Link href={`/household/${household.id}`} className="block" onClick={handleCardClick}>
      <div className="bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-200 hover:shadow-lg hover:shadow-gray-900/50 group cursor-pointer">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{getHouseTypeIcon(household.houseType || 'house')}</div>
              <div>
                <h3 className="text-xl font-bold text-gray-100 group-hover:text-orange-400 transition-colors">
                  {household.name}
                </h3>
                <p className="text-gray-400 text-sm">
                  {members.length} Members • {totalTasks} Tasks
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {showManageUsers && onManageUsers && (
                <button
                  onClick={handleManageUsers}
                  className="text-blue-400 hover:text-blue-300 transition-colors p-1 rounded opacity-0 group-hover:opacity-100"
                  title="Manage users"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </button>
              )}
              
              {showDelete && onDelete && (
                <button
                  onClick={handleDelete}
                  className="text-red-400 hover:text-red-300 transition-colors p-1 rounded opacity-0 group-hover:opacity-100"
                  title="Delete household"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {household.address && (
            <p className="text-gray-400 text-sm mt-2">📍 {household.address}</p>
          )}
        </div>

        {/* Stats */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="font-bold text-lg">{totalTasks}</div>
              <div className="text-sm text-gray-400">Total Tasks</div>
            </div>
            <div>
              <div className="font-bold text-lg text-green-400">{completedTasks}</div>
              <div className="text-sm text-gray-400">Completed</div>
            </div>
            <div>
              <div className="font-bold text-lg text-yellow-400">{pendingTasks}</div>
              <div className="text-sm text-gray-400">Pending</div>
            </div>
          </div>

          {/* Features */}
          {(household.hasGarden || household.hasGarage || household.hasBasement || household.hasAttic) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {household.hasGarden && (
                <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded-full">
                  🌿 Garden
                </span>
              )}
              {household.hasGarage && (
                <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded-full">
                  🚗 Garage
                </span>
              )}
              {household.hasBasement && (
                <span className="text-xs bg-gray-600/20 text-gray-400 px-2 py-1 rounded-full">
                  🏠 Basement
                </span>
              )}
              {household.hasAttic && (
                <span className="text-xs bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded-full">
                  🏚️ Attic
                </span>
              )}
            </div>
          )}

          {/* Members & Tasks */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="text-lg font-bold text-orange-400">{members.length}</div>
              <div className="text-xs text-gray-400">Members</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="text-lg font-bold text-cyan-400">{totalTasks}</div>
              <div className="text-xs text-gray-400">Tasks</div>
            </div>
          </div>

          {/* Progress Bar */}
          {totalTasks > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Task Progress</span>
                <span>{completedTasks}/{totalTasks}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-600 to-green-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Description */}
          {household.description && (
            <p className="text-gray-400 text-sm mt-3 line-clamp-2">
              {household.description}
            </p>
          )}

          {/* Created Date */}
          <div className="text-xs text-gray-500 mt-4">
            Created {new Date(household.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </Link>
  );
} 