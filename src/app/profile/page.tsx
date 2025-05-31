'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Get current users from localStorage
      const savedUsers = localStorage.getItem('chorely-users');
      const users: User[] = savedUsers ? JSON.parse(savedUsers) : [];

      // Check if email is already taken by another user
      const emailExists = users.some(u => u.email === formData.email && u.id !== user.id);
      if (emailExists) {
        setError('Email is already taken by another user');
        setIsLoading(false);
        return;
      }

      // Update user data
      const updatedUsers = users.map(u => 
        u.id === user.id 
          ? { ...u, name: formData.name, email: formData.email }
          : u
      );

      // Save to localStorage
      localStorage.setItem('chorely-users', JSON.stringify(updatedUsers));

      // Update auth user
      const updatedAuthUser = {
        ...user,
        name: formData.name,
        email: formData.email,
      };
      localStorage.setItem('chorely-auth-user', JSON.stringify(updatedAuthUser));

      // Update context (this would normally be done by re-login, but for demo we'll update manually)
      window.location.reload(); // Simple way to refresh user data

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    }

    setIsLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-4">Please log in to view your profile.</p>
          <Link 
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
            <h1 className="text-4xl font-bold text-center mb-2 hover:text-blue-400 transition-colors cursor-pointer">👤 My Profile</h1>
          </Link>
          <p className="text-gray-400 text-center">Manage your account information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-100">{user.name}</h2>
                <p className="text-gray-400">{user.email}</p>
                <div className="mt-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin' 
                      ? 'bg-red-600/20 text-red-400 border border-red-600/50' 
                      : 'bg-blue-600/20 text-blue-400 border border-blue-600/50'
                  }`}>
                    {user.role === 'admin' ? '👑 Administrator' : '👤 User'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mt-6">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/"
                  className="flex items-center gap-3 text-gray-300 hover:text-gray-100 transition-colors"
                >
                  <span>🏠</span>
                  <span>My Dashboard</span>
                </Link>
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 text-gray-300 hover:text-gray-100 transition-colors"
                  >
                    <span>⚙️</span>
                    <span>Admin Panel</span>
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors w-full text-left"
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Profile Information</h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-3 text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-600/20 border border-green-600/50 rounded-lg p-3 text-green-400 text-sm">
                      {success}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setError('');
                        setSuccess('');
                        setFormData({ name: user.name, email: user.email });
                      }}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Full Name
                    </label>
                    <p className="text-gray-100 text-lg">{user.name}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Email Address
                    </label>
                    <p className="text-gray-100 text-lg">{user.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Role
                    </label>
                    <p className="text-gray-100 text-lg">
                      {user.role === 'admin' ? 'Administrator' : 'User'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Households
                    </label>
                    <p className="text-gray-100 text-lg">
                      {user.households.length} household{user.households.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Account Statistics */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mt-6">
              <h3 className="text-xl font-bold mb-4">Account Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{user.households.length}</div>
                  <div className="text-gray-400 text-sm">Households</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{user.role === 'admin' ? '∞' : user.households.length}</div>
                  <div className="text-gray-400 text-sm">Access Level</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 