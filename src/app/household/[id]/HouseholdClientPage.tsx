'use client';

import { useState } from 'react';
import { Task, Household } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import TaskCard from '@/components/TaskCard';
import TaskModal from '@/components/TaskModal';
import TaskHistoryModal from '@/components/TaskHistoryModal';
import MemberModal from '@/components/MemberModal';
import MembersViewModal from '@/components/MembersViewModal';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface HouseholdClientPageProps {
  initialHousehold: Household;
}

export default function HouseholdClientPage({ initialHousehold }: HouseholdClientPageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [household] = useState<Household>(initialHousehold);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showMembersView, setShowMembersView] = useState(false);
  const [showTaskHistory, setShowTaskHistory] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedMember, setSelectedMember] = useState<string>('all');

  const refreshData = () => {
    router.refresh();
    toast.success('Data refreshed!');
  };

  const addTask = async (taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    if (!user) return;
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...taskData, household_id: household.id, status: 'To Do' }),
      });
      if (!response.ok) throw new Error('Failed to create task');
      toast.success(`Task "${taskData.title}" has been created!`);
      setShowAddTask(false);
      refreshData();
    } catch (error) {
      toast.error('Failed to create task.');
      console.error(error);
    }
  };

  const toggleTask = async (taskId: string) => {
    const task = household.tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed }),
      });
      if (!response.ok) throw new Error('Failed to update task');
      toast.success(task.completed ? 'Task marked as pending.' : 'Task completed! 🎉');
      refreshData();
    } catch (error) {
      toast.error('Failed to update task.');
      console.error(error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete task');
      toast.success('Task has been deleted.');
      refreshData();
    } catch (error) {
      toast.error('Failed to delete task.');
      console.error(error);
    }
  };

  const addMember = async (memberData: { user_id: string, role: string }) => {
    try {
      const response = await fetch(`/api/household/${household.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to add member');
      toast.success('Member added successfully!');
      setShowAddMember(false);
      refreshData();
    } catch (error) {
      const newError = error as Error;
      toast.error(newError.message || 'Failed to add member.');
      console.error(error);
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/household/${household.id}/members/${memberId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to remove member');
      toast.success('Member has been removed.');
      refreshData();
    } catch (error) {
      const newError = error as Error;
      toast.error(newError.message || 'Failed to remove member.');
      console.error(error);
    }
  };

  const filteredTasks = household.tasks.filter(task => {
    const statusFilter = filter === 'all' ||
                        (filter === 'pending' && !task.completed) ||
                        (filter === 'completed' && task.completed);
    const memberFilter = selectedMember === 'all' || task.assignedTo === selectedMember;
    return statusFilter && memberFilter;
  });

  const getMemberById = (id: string) => household.members.find(m => m.id === id);

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
          
          <div className="flex items-center gap-4 justify-center mb-4">
            <div className="text-4xl">🏠</div>
            <div className="text-center">
              <h1 className="text-4xl font-bold">{household.name}</h1>
              <p className="text-gray-400">
                Created in {new Date(household.createdAt).getFullYear()}
              </p>
            </div>
          </div>
        </div>

        {/* Household Info */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{household.numberOfRooms}</div>
              <div className="text-gray-400">Rooms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{household.houseSize}m²</div>
              <div className="text-gray-400">Size</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{household.numberOfFloors}</div>
              <div className="text-gray-400">Floors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">{new Date(household.createdAt).getFullYear()}</div>
              <div className="text-gray-400">Established</div>
            </div>
          </div>

          {/* Features */}
          {(household.hasGarden || household.hasGarage || household.hasBasement || household.hasAttic) && (
            <div className="flex flex-wrap gap-2 justify-center">
              {household.hasGarden && (
                <span className="text-sm bg-green-600/20 text-green-400 px-3 py-1 rounded-full">
                  🌿 Garden
                </span>
              )}
              {household.hasGarage && (
                <span className="text-sm bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full">
                  🚗 Garage
                </span>
              )}
              {household.hasBasement && (
                <span className="text-sm bg-gray-600/20 text-gray-400 px-3 py-1 rounded-full">
                  🏠 Basement
                </span>
              )}
              {household.hasAttic && (
                <span className="text-sm bg-yellow-600/20 text-yellow-400 px-3 py-1 rounded-full">
                  🏚️ Attic
                </span>
              )}
            </div>
          )}

          {household.description && (
            <p className="text-gray-400 text-center mt-4">
              {household.description}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-blue-400">{household.tasks.length}</div>
            <div className="text-gray-400">Total Tasks</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-yellow-400">{household.tasks.filter(t => !t.completed).length}</div>
            <div className="text-gray-400">Pending</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-green-400">{household.tasks.filter(t => t.completed).length}</div>
            <div className="text-gray-400">Completed</div>
          </div>
          <button
            onClick={() => setShowMembersView(true)}
            className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer"
          >
            <div className="text-2xl font-bold text-purple-400">{household.members.length}</div>
            <div className="text-gray-400">Members</div>
          </button>
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
              {household.members.map(member => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map(task => {
            const member = getMemberById(task.assignedTo);
            return (
              <TaskCard
                key={task.id}
                task={task}
                member={member}
                onToggle={toggleTask}
                onDelete={deleteTask}
                commentCount={task.comments?.length || 0}
              />
            );
          })}
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
            members={household.members}
            onAdd={addTask}
            onClose={() => setShowAddTask(false)}
          />
        )}

        {showAddMember && (
          <MemberModal
            onAdd={addMember}
            onClose={() => setShowAddMember(false)}
            existingMembers={household.members}
          />
        )}

        {showMembersView && (
          <MembersViewModal
            members={household.members}
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
            householdId={household.id}
          />
        )}
      </div>
    </div>
  );
} 