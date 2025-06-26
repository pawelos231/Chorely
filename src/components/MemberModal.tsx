'use client';

import { useState, useEffect } from 'react';
import { User, Member } from '@/types';
import toast from 'react-hot-toast';

interface MemberModalProps {
  onAdd: (member: { user_id: string; role: string }) => void;
  onClose: () => void;
  existingMembers: Member[];
}

export default function MemberModal({ onAdd, onClose, existingMembers }: MemberModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [role, setRole] = useState<'admin' | 'member'>('member');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('Failed to fetch users');
        const allUsers: User[] = await response.json();
        
        const existingMemberIds = existingMembers.map(m => m.id);
        const availableUsers = allUsers.filter(u => !existingMemberIds.includes(u.id));
        
        setUsers(availableUsers);
        if (availableUsers.length > 0) {
          setSelectedUserId(availableUsers[0].id);
        }
      } catch (error) {
        toast.error('Failed to load users.');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, [existingMembers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast.error('Please select a user to add.');
      return;
    }
    onAdd({ user_id: selectedUserId, role });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-auto border border-gray-700">
        <form onSubmit={handleSubmit} className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Add New Member</h2>
          
          {isLoading ? (
            <p className="text-center text-gray-400">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-center text-gray-400">No new users available to add.</p>
          ) : (
            <>
              <div className="mb-4">
                <label htmlFor="user" className="block text-gray-400 text-sm font-bold mb-2">
                  User
                </label>
                <select
                  id="user"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-3 px-4 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label htmlFor="role" className="block text-gray-400 text-sm font-bold mb-2">
                  Role
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'admin' | 'member')}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-3 px-4 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </>
          )}

          <div className="flex items-center justify-between mt-8">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || users.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-500"
            >
              Add Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 