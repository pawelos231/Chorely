'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Task, Member } from '@/types';
import { defaultMembers } from '@/data/defaultMembers';

interface UserProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  const resolvedParams = use(params);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>(defaultMembers);
  const [user, setUser] = useState<Member | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('chorely-tasks');
    const savedMembers = localStorage.getItem('chorely-members');
    
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
    if (savedMembers) {
      setMembers(JSON.parse(savedMembers));
    }
  }, []);

  // Find the user by ID
  useEffect(() => {
    const foundUser = members.find(m => m.id === resolvedParams.id);
    setUser(foundUser || null);
  }, [members, resolvedParams.id]);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    color: user?.color || 'bg-blue-500',
    role: user?.role || '',
    age: user?.age || undefined,
    room: user?.room || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
  });

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        color: user.color,
        role: user.role || '',
        age: user.age,
        room: user.room || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && user) {
      const updatedUser = {
        ...user,
        ...formData,
      };
      const updatedMembers = members.map(m => m.id === user.id ? updatedUser : m);
      setMembers(updatedMembers);
      setUser(updatedUser);
      localStorage.setItem('chorely-members', JSON.stringify(updatedMembers));
      setIsEditing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
          <p className="text-gray-400 mb-4">The requested user profile could not be found.</p>
          <Link 
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const userTasks = tasks.filter(task => task.assignedTo === user.id);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header with Navigation */}
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
          <h1 className="text-4xl font-bold text-center mb-2">🏠 Chorely</h1>
          <p className="text-gray-400 text-center">Member Profile</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 sticky top-8">
              {/* Profile Header */}
              <div className="text-center mb-6">
                <div className={`w-24 h-24 rounded-full ${user.color} flex items-center justify-center mx-auto mb-4 text-white text-4xl font-bold`}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-2xl font-bold text-gray-100">{user.name}</h2>
                <p className="text-gray-400">{user.role || 'Member'}</p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-gray-700 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-blue-400">{userTasks.length}</div>
                  <div className="text-xs text-gray-400">Total</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-yellow-400">{userTasks.filter(t => !t.completed).length}</div>
                  <div className="text-xs text-gray-400">Pending</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-green-400">{userTasks.filter(t => t.completed).length}</div>
                  <div className="text-xs text-gray-400">Done</div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="space-y-3 mb-6">
                {user.age && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Age:</span>
                    <span className="text-gray-100">{user.age} years</span>
                  </div>
                )}
                {user.room && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Room:</span>
                    <span className="text-gray-100">{user.room}</span>
                  </div>
                )}
                {user.email && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="text-gray-100 text-sm">{user.email}</span>
                  </div>
                )}
                {user.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Phone:</span>
                    <span className="text-gray-100">{user.phone}</span>
                  </div>
                )}
                {user.joinDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Joined:</span>
                    <span className="text-gray-100">{new Date(user.joinDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {user.bio && (
                <div className="mb-6">
                  <h3 className="text-gray-400 text-sm font-medium mb-2">Bio</h3>
                  <p className="text-gray-100 text-sm bg-gray-700 rounded-lg p-3">{user.bio}</p>
                </div>
              )}

              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Right Column - Tasks */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-gray-100 mb-6">Tasks Overview</h3>
              
              {userTasks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">📝</div>
                  <p>No tasks assigned yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userTasks.map(task => (
                    <div key={task.id} className={`bg-gray-700 rounded-lg p-4 border-l-4 ${
                      task.priority === 'high' ? 'border-l-red-500' :
                      task.priority === 'medium' ? 'border-l-yellow-500' :
                      'border-l-green-500'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className={`font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-100'}`}>
                          {task.title}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          task.completed ? 'bg-green-900 text-green-200' : 'bg-yellow-900 text-yellow-200'
                        }`}>
                          {task.completed ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                      
                      {task.description && (
                        <p className={`text-sm mb-3 ${task.completed ? 'line-through text-gray-500' : 'text-gray-400'}`}>
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="bg-gray-600 px-2 py-1 rounded">{task.category}</span>
                        <div className="flex items-center gap-4">
                          <span className={`px-2 py-1 rounded ${
                            task.priority === 'high' ? 'bg-red-900 text-red-200' :
                            task.priority === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                            'bg-green-900 text-green-200'
                          }`}>
                            {task.priority} priority
                          </span>
                          {task.dueDate && (
                            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {isEditing && (
          <div className="fixed inset-0 backdrop-blur-md backdrop-brightness-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-8 w-full max-w-md border border-gray-700/50 shadow-2xl">
              <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100"
                  required
                />
                
                <select
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100"
                >
                  <option value="bg-red-500">Red</option>
                  <option value="bg-green-500">Green</option>
                  <option value="bg-blue-500">Blue</option>
                  <option value="bg-yellow-500">Yellow</option>
                  <option value="bg-pink-500">Pink</option>
                  <option value="bg-indigo-500">Indigo</option>
                  <option value="bg-purple-500">Purple</option>
                  <option value="bg-orange-500">Orange</option>
                  <option value="bg-teal-500">Teal</option>
                </select>

                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100"
                >
                  <option value="">Select role...</option>
                  <option value="Organizer">Organizer</option>
                  <option value="Chef">Chef</option>
                  <option value="Student">Student</option>
                  <option value="Professional">Professional</option>
                  <option value="Member">Member</option>
                </select>

                <input
                  type="number"
                  placeholder="Age"
                  value={formData.age || ''}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) || undefined })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100"
                />

                <input
                  type="text"
                  placeholder="Room"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100"
                />

                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100"
                />

                <input
                  type="tel"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100"
                />

                <textarea
                  placeholder="Bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 h-20"
                />

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 