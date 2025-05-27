'use client';

import { useState, useEffect } from 'react';
import { Task, Member } from '@/types';
import { defaultMembers } from '@/data/defaultMembers';
import TaskCard from '@/components/TaskCard';
import TaskModal from '@/components/TaskModal';
import MemberModal from '@/components/MemberModal';
import MembersViewModal from '@/components/MembersViewModal';
import Link from 'next/link';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>(defaultMembers);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showMembersView, setShowMembersView] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedMember, setSelectedMember] = useState<string>('all');

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

  // Save to localStorage whenever tasks or members change
  useEffect(() => {
    localStorage.setItem('chorely-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('chorely-members', JSON.stringify(members));
  }, [members]);

  const addTask = (taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks([...tasks, newTask]);
    setShowAddTask(false);
  };

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const addMember = (name: string) => {
    const colors = ['bg-red-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'];
    const newMember: Member = {
      id: Date.now().toString(),
      name,
      color: colors[Math.floor(Math.random() * colors.length)],
      joinDate: new Date().toISOString(),
      role: 'Member',
    };
    setMembers([...members, newMember]);
    setShowAddMember(false);
  };

  const removeMember = (memberId: string) => {
    // Don't allow removing if they have assigned tasks
    const hasAssignedTasks = tasks.some(task => task.assignedTo === memberId);
    if (hasAssignedTasks) {
      alert('Cannot remove member with assigned tasks. Please reassign or complete their tasks first.');
      return;
    }
    setMembers(members.filter(member => member.id !== memberId));
  };

  const filteredTasks = tasks.filter(task => {
    const statusFilter = filter === 'all' || 
                        (filter === 'pending' && !task.completed) || 
                        (filter === 'completed' && task.completed);
    const memberFilter = selectedMember === 'all' || task.assignedTo === selectedMember;
    return statusFilter && memberFilter;
  });

  const getMemberById = (id: string) => members.find(m => m.id === id);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-2">🏠 Chorely</h1>
          <p className="text-gray-400 text-center">Household Task Organization for Roommates & Family</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-blue-400">{tasks.length}</div>
            <div className="text-gray-400">Total Tasks</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-yellow-400">{tasks.filter(t => !t.completed).length}</div>
            <div className="text-gray-400">Pending</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-green-400">{tasks.filter(t => t.completed).length}</div>
            <div className="text-gray-400">Completed</div>
          </div>
          <button
            onClick={() => setShowMembersView(true)}
            className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer"
          >
            <div className="text-2xl font-bold text-purple-400">{members.length}</div>
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
              {members.map(member => (
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
            members={members}
            onAdd={addTask}
            onClose={() => setShowAddTask(false)}
          />
        )}

        {showAddMember && (
          <MemberModal
            onAdd={addMember}
            onClose={() => setShowAddMember(false)}
          />
        )}

        {showMembersView && (
          <MembersViewModal
            members={members}
            onRemove={removeMember}
            onAddNew={() => {
              setShowMembersView(false);
              setShowAddMember(true);
            }}
            onClose={() => setShowMembersView(false)}
          />
        )}
      </div>
    </div>
  );
}
