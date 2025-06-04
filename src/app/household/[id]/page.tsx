'use client';

import { useState, useEffect, use } from 'react';
import { Task, Member, Household } from '@/types';
import { defaultHouseholds } from '@/data/defaultHouseholds';
import { defaultComments } from '@/data/defaultComments';
import { addTaskHistoryEntry } from '@/utils/taskHistory';
import { useAuth } from '@/contexts/AuthContext';
import TaskCard from '@/components/TaskCard';
import TaskModal from '@/components/TaskModal';
import TaskHistoryModal from '@/components/TaskHistoryModal';
import MemberModal from '@/components/MemberModal';
import MembersViewModal from '@/components/MembersViewModal';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface HouseholdPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function HouseholdPage({ params }: HouseholdPageProps) {
  const resolvedParams = use(params);
  const { user } = useAuth();
  const [households, setHouseholds] = useState<Household[]>([]);
  const [currentHousehold, setCurrentHousehold] = useState<Household | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showMembersView, setShowMembersView] = useState(false);
  const [showTaskHistory, setShowTaskHistory] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load households from localStorage on component mount
  useEffect(() => {
    const savedHouseholds = localStorage.getItem('chorely-households');
    
    if (savedHouseholds) {
      try {
        const parsedHouseholds = JSON.parse(savedHouseholds);
        setHouseholds(parsedHouseholds);
      } catch {
        toast.error('Failed to load household data');
        setHouseholds(defaultHouseholds);
      }
    } else {
      // No saved data, use defaults
      setHouseholds(defaultHouseholds);
      toast('Loading default household data', {
        icon: 'ℹ️',
      });
    }

    // Initialize comments if not exists
    const savedComments = localStorage.getItem('chorely-comments');
    if (!savedComments) {
      localStorage.setItem('chorely-comments', JSON.stringify(defaultComments));
    }

    setIsLoaded(true);
  }, []);

  // Find the current household by ID
  useEffect(() => {
    if (isLoaded) {
      const household = households.find(h => h.id === resolvedParams.id);
      setCurrentHousehold(household || null);
      
      if (!household && households.length > 0) {
        toast.error('Household not found');
      }
    }
  }, [households, resolvedParams.id, isLoaded]);

  // Save to localStorage whenever households change (but only after initial load)
  useEffect(() => {
    if (isLoaded && households.length > 0) {
      try {
        localStorage.setItem('chorely-households', JSON.stringify(households));
      } catch {
        toast.error('Failed to save household data');
      }
    }
  }, [households, isLoaded]);

  const updateCurrentHousehold = (updatedHousehold: Household) => {
    const updatedHouseholds = households.map(h => 
      h.id === updatedHousehold.id ? updatedHousehold : h
    );
    setHouseholds(updatedHouseholds);
    setCurrentHousehold(updatedHousehold);
  };

  const addTask = (taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    if (!currentHousehold) return;

    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const updatedHousehold = {
      ...currentHousehold,
      tasks: [...currentHousehold.tasks, newTask],
    };

    updateCurrentHousehold(updatedHousehold);
    setShowAddTask(false);
    toast.success(`Task "${taskData.title}" has been created!`);

    // Track task creation in history
    if (user) {
      addTaskHistoryEntry(
        newTask.id,
        user.id,
        'created',
        'false'
      );
    }
  };

  const toggleTask = (taskId: string) => {
    if (!currentHousehold || !user) return;

    // Find the current task to get its current status
    const currentTask = currentHousehold.tasks.find(t => t.id === taskId);
    if (!currentTask) return;

    const oldStatus = currentTask.completed.toString();
    const newStatus = (!currentTask.completed).toString();

    const updatedTasks = currentHousehold.tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );

    const updatedHousehold = {
      ...currentHousehold,
      tasks: updatedTasks,
    };

    updateCurrentHousehold(updatedHousehold);

    // Show appropriate toast message
    if (currentTask.completed) {
      toast('Task marked as pending', {
        icon: '🔄',
      });
    } else {
      toast.success('Task completed! 🎉');
    }

    // Track status change in history
    addTaskHistoryEntry(taskId, user.id, oldStatus, newStatus);
  };

  const deleteTask = (taskId: string) => {
    if (!currentHousehold || !user) return;

    // Find the current task to get its current status
    const currentTask = currentHousehold.tasks.find(t => t.id === taskId);

    const updatedTasks = currentHousehold.tasks.filter(task => task.id !== taskId);

    const updatedHousehold = {
      ...currentHousehold,
      tasks: updatedTasks,
    };

    updateCurrentHousehold(updatedHousehold);
    
    if (currentTask) {
      toast.success(`Task "${currentTask.title}" has been deleted`);
      
      // Track task deletion in history
      addTaskHistoryEntry(
        taskId,
        user.id,
        currentTask.completed.toString(),
        'deleted'
      );
    }
  };

  const addMember = (memberData: Omit<Member, 'id'>) => {
    if (!currentHousehold) return;

    // Check for duplicate names (case insensitive)
    const duplicateName = currentHousehold.members.some(
      member => member.name.toLowerCase() === memberData.name.toLowerCase()
    );
    
    if (duplicateName) {
      toast.error(`A member named "${memberData.name}" already exists in this household`);
      return;
    }

    // Check for duplicate emails if email is provided
    if (memberData.email) {
      const duplicateEmail = currentHousehold.members.some(
        member => member.email && member.email.toLowerCase() === memberData.email!.toLowerCase()
      );
      
      if (duplicateEmail) {
        toast.error(`A member with email "${memberData.email}" already exists in this household`);
        return;
      }
    }

    const newMember: Member = {
      ...memberData,
      id: Date.now().toString(),
      joinDate: new Date().toISOString(),
    };

    const updatedHousehold = {
      ...currentHousehold,
      members: [...currentHousehold.members, newMember],
    };

    updateCurrentHousehold(updatedHousehold);
    setShowAddMember(false);

    // Also add to global members list for profile access
    try {
      const existingMembers = localStorage.getItem('chorely-members');
      const allMembers: Member[] = existingMembers ? JSON.parse(existingMembers) : [];
      
      // Check if this member doesn't already exist in global list
      const memberExists = allMembers.some(m => m.id === newMember.id);
      if (!memberExists) {
        allMembers.push(newMember);
        localStorage.setItem('chorely-members', JSON.stringify(allMembers));
      }
    } catch {
      toast.error('Failed to sync member data');
    }
  };

  const removeMember = (memberId: string) => {
    if (!currentHousehold) return;

    // Don't allow removing if they have assigned tasks
    const hasAssignedTasks = currentHousehold.tasks.some(task => task.assignedTo === memberId);
    if (hasAssignedTasks) {
      toast.error('Cannot remove member with assigned tasks. Please reassign or complete their tasks first');
      return;
    }

    const memberToRemove = currentHousehold.members.find(m => m.id === memberId);
    const updatedMembers = currentHousehold.members.filter(member => member.id !== memberId);

    const updatedHousehold = {
      ...currentHousehold,
      members: updatedMembers,
    };

    updateCurrentHousehold(updatedHousehold);
    
    if (memberToRemove) {
      toast.success(`${memberToRemove.name} has been removed from the household`);
    }
  };

  if (!currentHousehold) {
    const handleRefresh = () => {
      // Force reload from localStorage
      const savedHouseholds = localStorage.getItem('chorely-households');
      if (savedHouseholds) {
        try {
          const parsedHouseholds = JSON.parse(savedHouseholds);
          setHouseholds(parsedHouseholds);
          toast.success('Data refreshed successfully');
        } catch {
          toast.error('Failed to refresh data');
        }
      }
    };

    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏠</div>
          <h1 className="text-2xl font-bold mb-2">Household Not Found</h1>
          <p className="text-gray-400 mb-4">The requested household could not be found.</p>
          <p className="text-gray-500 text-sm mb-6">Household ID: {resolvedParams.id}</p>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleRefresh}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Refresh Data
            </button>
            <Link 
              href="/admin"
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Back to Admin Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredTasks = currentHousehold.tasks.filter(task => {
    const statusFilter = filter === 'all' || 
                        (filter === 'pending' && !task.completed) || 
                        (filter === 'completed' && task.completed);
    const memberFilter = selectedMember === 'all' || task.assignedTo === selectedMember;
    return statusFilter && memberFilter;
  });

  const getMemberById = (id: string) => currentHousehold.members.find(m => m.id === id);

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
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/admin"
              className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors"
            >
              <span className="text-xl">←</span>
              <span>Back to Admin Dashboard</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4 justify-center mb-4">
            <div className="text-4xl">{getHouseTypeIcon(currentHousehold.houseType || 'house')}</div>
            <div className="text-center">
              <h1 className="text-4xl font-bold">{currentHousehold.name}</h1>
              <p className="text-gray-400">
                {currentHousehold.houseType && currentHousehold.houseType.charAt(0).toUpperCase() + currentHousehold.houseType.slice(1)} • {currentHousehold.numberOfRooms} rooms • {currentHousehold.houseSize}m²
              </p>
              {currentHousehold.address && (
                <p className="text-gray-500 text-sm">📍 {currentHousehold.address}</p>
              )}
            </div>
          </div>
        </div>

        {/* Household Info */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{currentHousehold.numberOfRooms}</div>
              <div className="text-gray-400">Rooms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{currentHousehold.houseSize}m²</div>
              <div className="text-gray-400">Size</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{currentHousehold.numberOfFloors}</div>
              <div className="text-gray-400">Floors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">{new Date(currentHousehold.createdAt).getFullYear()}</div>
              <div className="text-gray-400">Established</div>
            </div>
          </div>

          {/* Features */}
          {(currentHousehold.hasGarden || currentHousehold.hasGarage || currentHousehold.hasBasement || currentHousehold.hasAttic) && (
            <div className="flex flex-wrap gap-2 justify-center">
              {currentHousehold.hasGarden && (
                <span className="text-sm bg-green-600/20 text-green-400 px-3 py-1 rounded-full">
                  🌿 Garden
                </span>
              )}
              {currentHousehold.hasGarage && (
                <span className="text-sm bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full">
                  🚗 Garage
                </span>
              )}
              {currentHousehold.hasBasement && (
                <span className="text-sm bg-gray-600/20 text-gray-400 px-3 py-1 rounded-full">
                  🏠 Basement
                </span>
              )}
              {currentHousehold.hasAttic && (
                <span className="text-sm bg-yellow-600/20 text-yellow-400 px-3 py-1 rounded-full">
                  🏚️ Attic
                </span>
              )}
            </div>
          )}

          {currentHousehold.description && (
            <p className="text-gray-400 text-center mt-4">
              {currentHousehold.description}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-blue-400">{currentHousehold.tasks.length}</div>
            <div className="text-gray-400">Total Tasks</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-yellow-400">{currentHousehold.tasks.filter(t => !t.completed).length}</div>
            <div className="text-gray-400">Pending</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-green-400">{currentHousehold.tasks.filter(t => t.completed).length}</div>
            <div className="text-gray-400">Completed</div>
          </div>
          <button
            onClick={() => setShowMembersView(true)}
            className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer"
          >
            <div className="text-2xl font-bold text-purple-400">{currentHousehold.members.length}</div>
            <div className="text-gray-400">Members</div>
          </button>
          <Link
            href="/house"
            className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer block"
          >
            <div className="text-2xl font-bold text-orange-400">🏠</div>
            <div className="text-gray-400">3D House</div>
          </Link>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowAddTask(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              + Add Task
            </button>
            <button
              onClick={() => setShowAddMember(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              + Add Member
            </button>
            <button
              onClick={() => setShowTaskHistory(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              📊 Task History
            </button>
          </div>

          <div className="flex flex-wrap gap-4">
            {/* Filter by status */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'completed')}
              className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-100"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>

            {/* Filter by member */}
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-100"
            >
              <option value="all">All Members</option>
              {currentHousehold.members.map(member => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              member={getMemberById(task.assignedTo)}
              onToggle={toggleTask}
              onDelete={deleteTask}
            />
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📝</div>
            <p>No tasks found. Add some tasks to get started!</p>
          </div>
        )}

        {/* Modals */}
        {showAddTask && (
          <TaskModal
            members={currentHousehold.members}
            onAdd={addTask}
            onClose={() => setShowAddTask(false)}
          />
        )}

        {showAddMember && (
          <MemberModal
            onAdd={addMember}
            onClose={() => setShowAddMember(false)}
            existingMembers={currentHousehold.members}
          />
        )}

        {showMembersView && (
          <MembersViewModal
            members={currentHousehold.members}
            onRemove={removeMember}
            onAddNew={() => {
              setShowMembersView(false);
              setShowAddMember(true);
            }}
            onClose={() => setShowMembersView(false)}
          />
        )}

        {showTaskHistory && (
          <TaskHistoryModal
            onClose={() => setShowTaskHistory(false)}
            householdId={currentHousehold.id}
          />
        )}
      </div>
    </div>
  );
} 