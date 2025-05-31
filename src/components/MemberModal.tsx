'use client';

import { useState, useEffect } from 'react';
import { Member, User } from '@/types';

interface MemberModalProps {
  onAdd: (member: Omit<Member, 'id'>) => void;
  onClose: () => void;
  existingMembers: Member[];
}

export default function MemberModal({ onAdd, onClose, existingMembers }: MemberModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    age: '',
    room: '',
    phone: '',
    bio: '',
    color: '#3B82F6',
  });
  const [users, setUsers] = useState<User[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load all users for suggestions
  useEffect(() => {
    const savedUsers = localStorage.getItem('chorely-users');
    if (savedUsers) {
      const allUsers: User[] = JSON.parse(savedUsers);
      setUsers(allUsers);
    }
  }, []);

  // Filter suggested users based on email input and exclude existing members
  useEffect(() => {
    if (formData.email && users.length > 0) {
      const existingEmails = existingMembers.map(m => m.email).filter(Boolean);
      const filtered = users.filter(user => 
        user.email.toLowerCase().includes(formData.email.toLowerCase()) &&
        !existingEmails.includes(user.email)
      );
      setSuggestedUsers(filtered);
      setShowSuggestions(filtered.length > 0 && formData.email.length > 0);
    } else {
      setSuggestedUsers([]);
      setShowSuggestions(false);
    }
  }, [formData.email, users, existingMembers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onAdd({
      name: formData.name || 'Unnamed Member',
      email: formData.email || undefined,
      role: formData.role || undefined,
      age: formData.age ? parseInt(formData.age) : undefined,
      room: formData.room || undefined,
      phone: formData.phone || undefined,
      bio: formData.bio || undefined,
      color: formData.color,
    });

    setFormData({
      name: '',
      email: '',
      role: '',
      age: '',
      room: '',
      phone: '',
      bio: '',
      color: '#3B82F6',
    });
  };

  const selectSuggestedUser = (user: User) => {
    setFormData({
      ...formData,
      name: user.name,
      email: user.email,
    });
    setShowSuggestions(false);
  };

  const predefinedColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-100">Add Member</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter member name"
              required
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email (Optional)
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter email to search existing users"
            />
            
            {/* User Suggestions */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 rounded-lg mt-1 shadow-lg z-10 max-h-40 overflow-y-auto">
                {suggestedUsers.map(user => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => selectSuggestedUser(user)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-600 transition-colors flex items-center gap-3"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-100 font-medium">{user.name}</p>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                    </div>
                    {user.role === 'admin' && (
                      <span className="ml-auto text-xs bg-red-600/20 text-red-400 px-2 py-1 rounded">
                        Admin
                      </span>
                    )}
                  </button>
                ))}
                {suggestedUsers.length === 0 && formData.email && (
                  <div className="px-3 py-2 text-gray-400 text-sm">
                    No matching users found
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Role (Optional)
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., Parent, Child, Roommate"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Age (Optional)
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Age"
                min="1"
                max="120"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Room (Optional)
              </label>
              <input
                type="text"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Room name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Phone (Optional)
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Color
            </label>
            <div className="flex gap-2 mb-2">
              {predefinedColors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color ? 'border-white' : 'border-gray-600'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full h-10 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bio (Optional)
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              placeholder="Brief description about the member"
              rows={3}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Add Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 