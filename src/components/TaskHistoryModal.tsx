'use client';

import { useState, useEffect } from 'react';
import { TaskHistory, User, Task, Household } from '@/types';

interface TaskHistoryModalProps {
  onClose: () => void;
  householdId?: string; // If provided, show only history for this household
  taskId?: string; // If provided, show only history for this specific task
}

export default function TaskHistoryModal({ onClose, householdId, taskId }: TaskHistoryModalProps) {
  const [taskHistory, setTaskHistory] = useState<TaskHistory[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'user' | 'task'>('date');
  const [filterUser, setFilterUser] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [householdId, taskId]);

  const loadData = () => {
    setIsLoading(true);
    
    // Load users
    const savedUsers = localStorage.getItem('chorely-users');
    const usersData: User[] = savedUsers ? JSON.parse(savedUsers) : [];
    setUsers(usersData);
    
    // Load households
    const savedHouseholds = localStorage.getItem('chorely-households');
    const householdsData: Household[] = savedHouseholds ? JSON.parse(savedHouseholds) : [];
    setHouseholds(householdsData);
    
    // Extract all tasks
    const allTasks = householdsData.flatMap(h => 
      h.tasks.map(task => ({ ...task, householdId: h.id, householdName: h.name }))
    );
    setTasks(allTasks);
    
    // Load task history
    const savedHistory = localStorage.getItem('chorely-task-history');
    let historyData: TaskHistory[] = savedHistory ? JSON.parse(savedHistory) : [];
    
    // Filter history based on props
    if (taskId) {
      historyData = historyData.filter(h => h.task_id === taskId);
    } else if (householdId) {
      const householdTaskIds = householdsData
        .find(h => h.id === householdId)?.tasks.map(t => t.id) || [];
      historyData = historyData.filter(h => householdTaskIds.includes(h.task_id));
    }
    
    setTaskHistory(historyData);
    setIsLoading(false);
  };

  const getUserById = (id: string) => users.find(u => u.id === id);
  const getTaskById = (id: string) => tasks.find(t => t.id === id);

  const filteredAndSortedHistory = taskHistory
    .filter(h => filterUser === 'all' || h.changed_by === filterUser)
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime();
        case 'user':
          const userA = getUserById(a.changed_by)?.name || 'Unknown';
          const userB = getUserById(b.changed_by)?.name || 'Unknown';
          return userA.localeCompare(userB);
        case 'task':
          const taskA = getTaskById(a.task_id)?.title || 'Unknown';
          const taskB = getTaskById(b.task_id)?.title || 'Unknown';
          return taskA.localeCompare(taskB);
        default:
          return 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'false':
        return 'text-yellow-400';
      case 'completed':
      case 'true':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'false':
        return '⏳';
      case 'completed':
      case 'true':
        return '✅';
      default:
        return '📋';
    }
  };

  const formatStatus = (status: string) => {
    if (status === 'true') return 'Completed';
    if (status === 'false') return 'Pending';
    return status;
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
          <div className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-gray-400">Loading task history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-4xl border border-gray-700 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-100">📊 Task History</h2>
            <p className="text-gray-400">
              {taskId ? 'History for specific task' : 
               householdId ? 'History for household tasks' : 
               'Complete task history across all households'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400">{taskHistory.length}</div>
            <div className="text-gray-400 text-sm">Total Changes</div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">
              {taskHistory.filter(h => h.new_status === 'true' || h.new_status.toLowerCase() === 'completed').length}
            </div>
            <div className="text-gray-400 text-sm">Completed</div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-400">
              {new Set(taskHistory.map(h => h.changed_by)).size}
            </div>
            <div className="text-gray-400 text-sm">Active Users</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100"
          >
            <option value="date">Sort by Date</option>
            <option value="user">Sort by User</option>
            <option value="task">Sort by Task</option>
          </select>

          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100"
          >
            <option value="all">All Users</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto">
          {filteredAndSortedHistory.length > 0 ? (
            <div className="space-y-3">
              {filteredAndSortedHistory.map(history => {
                const user = getUserById(history.changed_by);
                const task = getTaskById(history.task_id);
                const household = households.find(h => h.tasks.some(t => t.id === history.task_id));
                
                return (
                  <div key={history.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-white">
                            {user?.name.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="text-gray-100 font-medium">{user?.name || 'Unknown User'}</p>
                          <p className="text-gray-400 text-sm">
                            {new Date(history.changed_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {household && !householdId && (
                        <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
                          {household.name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex-1">
                        <p className="text-gray-300 font-medium">{task?.title || 'Unknown Task'}</p>
                        {task?.description && (
                          <p className="text-gray-500 text-xs mt-1">{task.description}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`flex items-center gap-1 ${getStatusColor(history.old_status)}`}>
                          {getStatusIcon(history.old_status)}
                          {formatStatus(history.old_status)}
                        </span>
                        <span className="text-gray-500">→</span>
                        <span className={`flex items-center gap-1 ${getStatusColor(history.new_status)}`}>
                          {getStatusIcon(history.new_status)}
                          {formatStatus(history.new_status)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📊</div>
              <p>No task history found</p>
              {filterUser !== 'all' && (
                <p className="text-sm mt-2">Try changing the user filter</p>
              )}
            </div>
          )}
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