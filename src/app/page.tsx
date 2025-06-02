'use client';

import { useState, useEffect } from 'react';
import { Task, Household } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { defaultUsers } from '@/data/defaultUsers';
import { defaultHouseholds } from '@/data/defaultHouseholds';
import { defaultTaskHistory } from '@/data/defaultTaskHistory';
import { defaultComments } from '@/data/defaultComments';
import { addTaskHistoryEntry } from '@/utils/taskHistory';
import LoginForm from '@/components/LoginForm';
import RegisterForm from '@/components/RegisterForm';
import TaskCard from '@/components/TaskCard';
import TaskModal from '@/components/TaskModal';
import TaskHistoryModal from '@/components/TaskHistoryModal';
import HouseholdCard from '@/components/HouseholdCard';
import Link from 'next/link';

export default function Home() {
  const { user, logout, isLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(true);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showTaskHistory, setShowTaskHistory] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [selectedHousehold, setSelectedHousehold] = useState<string>('all');

  // Initialize default data
  useEffect(() => {
    // Initialize users if not exists
    const savedUsers = localStorage.getItem('chorely-users');
    if (!savedUsers) {
      localStorage.setItem('chorely-users', JSON.stringify(defaultUsers));
    }

    // Initialize households if not exists
    const savedHouseholds = localStorage.getItem('chorely-households');
    if (savedHouseholds) {
      setHouseholds(JSON.parse(savedHouseholds));
    } else {
      setHouseholds(defaultHouseholds);
      localStorage.setItem('chorely-households', JSON.stringify(defaultHouseholds));
    }

    // Initialize task history if not exists
    const savedTaskHistory = localStorage.getItem('chorely-task-history');
    if (!savedTaskHistory) {
      localStorage.setItem('chorely-task-history', JSON.stringify(defaultTaskHistory));
    }

    // Initialize comments if not exists
    const savedComments = localStorage.getItem('chorely-comments');
    if (!savedComments) {
      localStorage.setItem('chorely-comments', JSON.stringify(defaultComments));
    }
  }, []);

  // Save households when they change
  useEffect(() => {
    if (households.length > 0) {
      localStorage.setItem('chorely-households', JSON.stringify(households));
    }
  }, [households]);

  // Get user's households and tasks
  const userHouseholds = user ? households.filter(h => user.households.includes(h.id)) : [];
  const allUserTasks = userHouseholds.flatMap(h => h.tasks.map(task => ({ ...task, householdId: h.id, householdName: h.name })));
  const allUserMembers = userHouseholds.flatMap(h => h.members);

  const filteredTasks = allUserTasks.filter(task => {
    const statusFilter = filter === 'all' || 
                        (filter === 'pending' && !task.completed) || 
                        (filter === 'completed' && task.completed);
    const memberFilter = selectedMember === 'all' || task.assignedTo === selectedMember;
    const householdFilter = selectedHousehold === 'all' || task.householdId === selectedHousehold;
    return statusFilter && memberFilter && householdFilter;
  });

  const addTask = (taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    if (!user || userHouseholds.length === 0) return;

    const targetHouseholdId = selectedHousehold !== 'all' ? selectedHousehold : userHouseholds[0].id;
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const updatedHouseholds = households.map(h => 
      h.id === targetHouseholdId 
        ? { ...h, tasks: [...h.tasks, newTask] }
        : h
    );

    setHouseholds(updatedHouseholds);
    setShowAddTask(false);

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
    if (!user) return;

    // Find the current task to get its current status
    const currentTask = allUserTasks.find(t => t.id === taskId);
    if (!currentTask) return;

    const oldStatus = currentTask.completed.toString();
    const newStatus = (!currentTask.completed).toString();

    const updatedHouseholds = households.map(h => ({
      ...h,
      tasks: h.tasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    }));
    setHouseholds(updatedHouseholds);

    // Track status change in history
    addTaskHistoryEntry(taskId, user.id, oldStatus, newStatus);
  };

  const deleteTask = (taskId: string) => {
    if (!user) return;

    // Find the current task to get its current status
    const currentTask = allUserTasks.find(t => t.id === taskId);
    
    const updatedHouseholds = households.map(h => ({
      ...h,
      tasks: h.tasks.filter(task => task.id !== taskId)
    }));
    setHouseholds(updatedHouseholds);

    // Track task deletion in history
    if (currentTask) {
      addTaskHistoryEntry(
        taskId,
        user.id,
        currentTask.completed.toString(),
        'deleted'
      );
    }
  };

  const getMemberById = (id: string) => allUserMembers.find(m => m.id === id);

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
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Admin Panel
                </Link>
              )}
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
                <div className="text-2xl font-bold text-yellow-400">{allUserTasks.filter(t => !t.completed).length}</div>
                <div className="text-gray-400">Pending</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-2xl font-bold text-green-400">{allUserTasks.filter(t => t.completed).length}</div>
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

            {/* Task Controls */}
            <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setShowAddTask(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  + Add Task
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

                {/* Filter by household */}
                <select
                  value={selectedHousehold}
                  onChange={(e) => setSelectedHousehold(e.target.value)}
                  className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-100"
                >
                  <option value="all">All Households</option>
                  {userHouseholds.map(household => (
                    <option key={household.id} value={household.id}>{household.name}</option>
                  ))}
                </select>

                {/* Filter by member */}
                <select
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-100"
                >
                  <option value="all">All Members</option>
                  {allUserMembers.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tasks Grid */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">My Tasks</h2>
              {filteredTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTasks.map(task => (
                    <div key={task.id} className="relative">
                      <TaskCard
                        task={task}
                        member={getMemberById(task.assignedTo)}
                        onToggle={toggleTask}
                        onDelete={deleteTask}
                      />
                      <div className="absolute top-2 right-2 bg-gray-700 text-xs px-2 py-1 rounded">
                        {task.householdName}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">📝</div>
                  <p>No tasks found. Add some tasks to get started!</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Modals */}
        {showAddTask && userHouseholds.length > 0 && (
          <TaskModal
            members={allUserMembers}
            onAdd={addTask}
            onClose={() => setShowAddTask(false)}
          />
        )}

        {showTaskHistory && (
          <TaskHistoryModal
            onClose={() => setShowTaskHistory(false)}
            householdId={selectedHousehold !== 'all' ? selectedHousehold : undefined}
          />
        )}
      </div>
    </div>
  );
}
