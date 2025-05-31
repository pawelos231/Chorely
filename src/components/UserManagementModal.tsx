'use client';

import { useState, useEffect } from 'react';
import { User, Household } from '@/types';

interface UserManagementModalProps {
  household: Household;
  onClose: () => void;
  onUpdate: (updatedHousehold: Household) => void;
}

export default function UserManagementModal({ household, onClose, onUpdate }: UserManagementModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load all users
  useEffect(() => {
    const savedUsers = localStorage.getItem('chorely-users');
    if (savedUsers) {
      const allUsers: User[] = JSON.parse(savedUsers);
      setUsers(allUsers);
    }
  }, []);

  // Get users that have access to this household
  const householdUsers = users.filter(user => user.households.includes(household.id));
  
  // Get users that don't have access to this household
  const availableUsers = users.filter(user => 
    !user.households.includes(household.id) &&
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addUserToHousehold = async (user: User) => {
    setIsLoading(true);
    
    try {
      // Update user's households list
      const updatedUsers = users.map(u => 
        u.id === user.id 
          ? { ...u, households: [...u.households, household.id] }
          : u
      );
      
      // Save users to localStorage
      localStorage.setItem('chorely-users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      
      // Add user as member to household if not already a member
      const existingMember = household.members.find(m => m.email === user.email);
      if (!existingMember) {
        const newMember = {
          id: Date.now().toString(),
          name: user.name,
          email: user.email,
          color: '#3B82F6',
          role: 'Member',
          joinDate: new Date().toISOString(),
        };
        
        const updatedHousehold = {
          ...household,
          members: [...household.members, newMember],
        };
        
        onUpdate(updatedHousehold);
      }
      
    } catch (error) {
      console.error('Error adding user to household:', error);
    }
    
    setIsLoading(false);
  };

  const removeUserFromHousehold = async (user: User) => {
    setIsLoading(true);
    
    try {
      // Update user's households list
      const updatedUsers = users.map(u => 
        u.id === user.id 
          ? { ...u, households: u.households.filter(h => h !== household.id) }
          : u
      );
      
      // Save users to localStorage
      localStorage.setItem('chorely-users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      
      // Remove user as member from household if they exist
      const memberToRemove = household.members.find(m => m.email === user.email);
      if (memberToRemove) {
        // Check if they have assigned tasks
        const hasAssignedTasks = household.tasks.some(task => task.assignedTo === memberToRemove.id);
        if (hasAssignedTasks) {
          alert('Cannot remove user with assigned tasks. Please reassign or complete their tasks first.');
          setIsLoading(false);
          return;
        }
        
        const updatedHousehold = {
          ...household,
          members: household.members.filter(m => m.id !== memberToRemove.id),
        };
        
        onUpdate(updatedHousehold);
      }
      
    } catch (error) {
      console.error('Error removing user from household:', error);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-4xl border border-gray-700 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-100">Manage Users - {household.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
          {/* Current Users */}
          <div className="flex flex-col">
            <h3 className="text-lg font-bold mb-4 text-green-400">
              Current Users ({householdUsers.length})
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-3">
              {householdUsers.length > 0 ? (
                householdUsers.map(user => (
                  <div
                    key={user.id}
                    className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-100 font-medium">{user.name}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                      </div>
                      {user.role === 'admin' && (
                        <span className="text-xs bg-red-600/20 text-red-400 px-2 py-1 rounded border border-red-600/50">
                          👑 Admin
                        </span>
                      )}
                    </div>
                    
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => removeUserFromHousehold(user)}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No users have access to this household</p>
                </div>
              )}
            </div>
          </div>

          {/* Available Users */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-blue-400">
                Available Users
              </h3>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-gray-100 text-sm w-48"
              />
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3">
              {availableUsers.length > 0 ? (
                availableUsers.map(user => (
                  <div
                    key={user.id}
                    className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-100 font-medium">{user.name}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                        <p className="text-gray-500 text-xs">
                          Member of {user.households.length} household{user.households.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      {user.role === 'admin' && (
                        <span className="text-xs bg-red-600/20 text-red-400 px-2 py-1 rounded border border-red-600/50">
                          👑 Admin
                        </span>
                      )}
                    </div>
                    
                    <button
                      onClick={() => addUserToHousehold(user)}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Add
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>{searchTerm ? 'No users found matching your search' : 'All users already have access'}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 