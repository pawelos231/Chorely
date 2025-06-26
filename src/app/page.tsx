'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import RegisterForm from '@/components/RegisterForm';
import HouseholdCard from '@/components/HouseholdCard';
import Link from 'next/link';

export default function Home() {
  const { user, logout, isLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(true);

  // Get user's households from the Auth context
  const userHouseholds = user?.households || [];

  // Calculate user statistics
  const allUserTasks = userHouseholds.flatMap(h => h.tasks || []);
  const completedTasks = allUserTasks.filter(t => t.completed);
  const pendingTasks = allUserTasks.filter(t => !t.completed);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🏠</div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth forms for non-logged users
  if (!user) {

    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <h1 className="text-4xl font-bold mb-2 hover:text-blue-400 transition-colors cursor-pointer">🏠 Chorely</h1>
            </Link>
            <p className="text-gray-400">Household Task Organization for Roommates & Family</p>
          </div>

          {/* Auth Forms */}
          {showLogin ? (
            <LoginForm onSwitchToRegister={() => setShowLogin(false)} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setShowLogin(true)} />
          )}
        </div>
      </div>
    );
  }

  // User Dashboard
      console.log('User households:', userHouseholds);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <Link href="/" className="inline-block">
                <h1 className="text-4xl font-bold hover:text-blue-400 transition-colors cursor-pointer">🏠 Chorely</h1>
              </Link>
              <p className="text-gray-400">Welcome back, {user.name}!</p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/admin"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Admin Panel
              </Link>
              <Link
                href="/profile"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                My Profile
              </Link>
              <button
                onClick={logout}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {userHouseholds.length === 0 ? (
          // No households message
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏠</div>
            <h2 className="text-2xl font-bold mb-2">No Households</h2>
            <p className="text-gray-400 mb-4">You&apos;re not a member of any households yet.</p>
            <p className="text-gray-500 text-sm">Contact an administrator to be added to a household.</p>
          </div>
        ) : (
          <>
            {/* User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-2xl font-bold text-blue-400">{allUserTasks.length}</div>
                <div className="text-gray-400">Total Tasks</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-2xl font-bold text-yellow-400">{pendingTasks.length}</div>
                <div className="text-gray-400">Pending</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-2xl font-bold text-green-400">{completedTasks.length}</div>
                <div className="text-gray-400">Completed</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-2xl font-bold text-purple-400">{userHouseholds.length}</div>
                <div className="text-gray-400">Households</div>
              </div>
            </div>

            {/* My Households */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">My Households</h2>
              <p className="text-gray-400 mb-6">
                Click on any household to view and manage its tasks and members.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userHouseholds.map(household => (
                  <HouseholdCard
                    key={household.id}
                    household={household}
                    showDelete={false}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
