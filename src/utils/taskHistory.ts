import { TaskHistory } from '@/types';

export const addTaskHistoryEntry = (
  taskId: string,
  changedBy: string,
  oldStatus: string,
  newStatus: string
) => {
  // Don't create history entry if status hasn't actually changed
  if (oldStatus === newStatus) return;

  const historyEntry: TaskHistory = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    task_id: taskId,
    changed_by: changedBy,
    old_status: oldStatus,
    new_status: newStatus,
    changed_at: new Date().toISOString(),
  };

  // Load existing history
  const savedHistory = localStorage.getItem('chorely-task-history');
  const existingHistory: TaskHistory[] = savedHistory ? JSON.parse(savedHistory) : [];

  // Add new entry
  const updatedHistory = [...existingHistory, historyEntry];

  // Save back to localStorage
  localStorage.setItem('chorely-task-history', JSON.stringify(updatedHistory));

  console.log('Task history entry added:', historyEntry);
  return historyEntry;
};

export const getTaskHistory = (taskId?: string): TaskHistory[] => {
  const savedHistory = localStorage.getItem('chorely-task-history');
  let history: TaskHistory[] = savedHistory ? JSON.parse(savedHistory) : [];

  if (taskId) {
    history = history.filter(h => h.task_id === taskId);
  }

  return history.sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime());
};

export const clearTaskHistory = (taskId?: string) => {
  if (taskId) {
    // Clear history for specific task
    const savedHistory = localStorage.getItem('chorely-task-history');
    const existingHistory: TaskHistory[] = savedHistory ? JSON.parse(savedHistory) : [];
    const filteredHistory = existingHistory.filter(h => h.task_id !== taskId);
    localStorage.setItem('chorely-task-history', JSON.stringify(filteredHistory));
  } else {
    // Clear all history
    localStorage.removeItem('chorely-task-history');
  }
}; 