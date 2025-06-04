'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Household } from '@/types';
import { registerSchema, formatZodErrors } from '@/utils/validation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { z } from 'zod';

interface ValidationErrors {
  name?: string;
  email?: string;
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [userHouseholds, setUserHouseholds] = useState<Household[]>([]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
      });
      loadUserHouseholds();
    }
  }, [user]);

  const loadUserHouseholds = () => {
    if (!user) return;

    try {
      const savedHouseholds = localStorage.getItem('chorely-households');
      if (savedHouseholds) {
        const allHouseholds: Household[] = JSON.parse(savedHouseholds);
        
        // Find households where user is a member (by email or ID)
        const userHouseholdsFiltered = allHouseholds.filter(household => {
          // Check if user has access to this household
          if (user.households.includes(household.id)) {
            return true;
          }
          
          // Also check if user is a member by email
          return household.members.some(member => 
            member.email && member.email.toLowerCase() === user.email.toLowerCase()
          );
        });
        
        setUserHouseholds(userHouseholdsFiltered);
      }
    } catch {
      toast.error('Failed to load your households');
    }
  };

  const validateForm = (data: typeof formData): ValidationErrors => {
    try {
      // Create a partial schema for profile updates (without password)
      const profileSchema = registerSchema.omit({ password: true });
      profileSchema.parse(data);
      return {};
    } catch (error: unknown) {
      const zodErrors = formatZodErrors(error as z.ZodError);
      return zodErrors;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setErrors({});
    setIsLoading(true);

    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error('Please fix the form errors before submitting');
      setIsLoading(false);
      return;
    }

    try {
      // Get current users from localStorage
      const savedUsers = localStorage.getItem('chorely-users');
      const users: User[] = savedUsers ? JSON.parse(savedUsers) : [];

      // Check if email is already taken by another user
      const emailExists = users.some(u => u.email === formData.email && u.id !== user.id);
      if (emailExists) {
        setErrors({ email: 'Email is already taken by another user' });
        toast.error('Email is already taken by another user');
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

      // Also update user data in all households where user is a member
      const savedHouseholds = localStorage.getItem('chorely-households');
      if (savedHouseholds) {
        try {
          const households: Household[] = JSON.parse(savedHouseholds);
          
          // Find and update user data in households where user is a member
          const updatedHouseholds = households.map(household => {
            const updatedMembers = household.members.map(member => {
              // Check if this member is the current user (by email match)
              if (member.email && member.email.toLowerCase() === user.email.toLowerCase()) {
                return {
                  ...member,
                  name: formData.name,
                  email: formData.email,
                };
              }
              return member;
            });
            
            return {
              ...household,
              members: updatedMembers,
            };
          });
          
          // Save updated households
          localStorage.setItem('chorely-households', JSON.stringify(updatedHouseholds));
        } catch {
          // If household update fails, still continue with user update
          toast.error('Profile updated but failed to sync with households');
        }
      }

      // Update auth user
      const updatedAuthUser = {
        ...user,
        name: formData.name,
        email: formData.email,
      };
      localStorage.setItem('chorely-auth-user', JSON.stringify(updatedAuthUser));

      toast.success('Profile updated successfully!');
      setIsEditing(false);
      setErrors({});
      
      // Reload user households to reflect changes
      loadUserHouseholds();
      
      // Update context (this would normally be done by re-login, but for demo we'll update manually)
      setTimeout(() => window.location.reload(), 1000); // Give time for toast to show
    } catch {
      toast.error('Failed to update profile');
    }

    setIsLoading(false);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getHouseTypeIcon = (type?: string) => {
    switch (type) {
      case 'apartment': return '🏢';
      case 'house': return '🏠';
      case 'studio': return '🏠';
      case 'villa': return '🏰';
      default: return '🏠';
    }
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
      <div className="container mx-auto px-4 py-8 max-w-6xl">
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

            {/* Account Statistics */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mt-6">
              <h3 className="text-lg font-bold mb-4">Account Statistics</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{userHouseholds.length}</div>
                  <div className="text-gray-400 text-sm">My Households</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {userHouseholds.reduce((total, household) => total + household.tasks.length, 0)}
                  </div>
                  <div className="text-gray-400 text-sm">Total Tasks</div>
                </div>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-gray-100 focus:ring-1 ${
                        errors.name 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                      } disabled:opacity-50`}
                      required
                      disabled={isLoading}
                    />
                    {errors.name && (
                      <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-gray-100 focus:ring-1 ${
                        errors.email 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                      } disabled:opacity-50`}
                      required
                      disabled={isLoading}
                    />
                    {errors.email && (
                      <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setErrors({});
                        setFormData({ name: user.name, email: user.email });
                      }}
                      disabled={isLoading}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
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
                </div>
              )}
            </div>

            {/* My Households */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mt-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">My Households</h3>
                <span className="text-sm text-gray-400">
                  {userHouseholds.length} household{userHouseholds.length !== 1 ? 's' : ''}
                </span>
              </div>

              {userHouseholds.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🏠</div>
                  <p>You&apos;re not a member of any households yet</p>
                  <p className="text-sm mt-2">Ask an admin to add you to a household</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userHouseholds.map(household => (
                    <Link
                      key={household.id}
                      href={`/household/${household.id}`}
                      className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-all hover:bg-gray-650 group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">
                          {getHouseTypeIcon(household.houseType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-100 group-hover:text-blue-400 transition-colors truncate">
                            {household.name}
                          </h4>
                          <p className="text-sm text-gray-400 mb-2">
                            {household.houseType && household.houseType.charAt(0).toUpperCase() + household.houseType.slice(1)} • {household.numberOfRooms} rooms
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>👥 {household.members.length} members</span>
                            <span>📝 {household.tasks.length} tasks</span>
                            <span>✅ {household.tasks.filter(t => t.completed).length} done</span>
                          </div>
                          
                          {household.address && (
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              📍 {household.address}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {household.members.slice(0, 3).map((member) => (
                            <div
                              key={member.id}
                              className="w-6 h-6 rounded-full border-2 border-gray-700 flex items-center justify-center text-xs font-bold text-white"
                              style={{ backgroundColor: member.color }}
                              title={member.name}
                            >
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                          ))}
                          {household.members.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-gray-600 border-2 border-gray-700 flex items-center justify-center text-xs font-bold text-white">
                              +{household.members.length - 3}
                            </div>
                          )}
                        </div>
                        
                        <span className="text-xs text-blue-400 group-hover:text-blue-300">
                          Click to view →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 