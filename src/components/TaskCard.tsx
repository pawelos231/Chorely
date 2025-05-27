import { Task, Member } from '@/types';

interface TaskCardProps {
  task: Task;
  member: Member | undefined;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskCard({ task, member, onToggle, onDelete }: TaskCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  return (
    <div
      className={`bg-gray-800 rounded-lg p-4 border-l-4 ${getPriorityColor(task.priority)} border-t border-r border-b border-gray-700 ${
        task.completed ? 'opacity-75' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className={`font-semibold ${task.completed ? 'line-through text-gray-500' : ''}`}>
          {task.title}
        </h3>
        <button
          onClick={() => onDelete(task.id)}
          className="text-red-400 hover:text-red-300 text-sm"
        >
          ✕
        </button>
      </div>
      
      <p className={`text-gray-400 text-sm mb-3 ${task.completed ? 'line-through' : ''}`}>
        {task.description}
      </p>

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs bg-gray-700 px-2 py-1 rounded">
          {task.category}
        </span>
        <span className={`text-xs px-2 py-1 rounded ${
          task.priority === 'high' ? 'bg-red-900 text-red-200' :
          task.priority === 'medium' ? 'bg-yellow-900 text-yellow-200' :
          'bg-green-900 text-green-200'
        }`}>
          {task.priority}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {member && (
            <>
              <div className={`w-6 h-6 rounded-full ${member.color}`}></div>
              <span className="text-sm text-gray-300">{member.name}</span>
            </>
          )}
        </div>
        <button
          onClick={() => onToggle(task.id)}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            task.completed
              ? 'bg-green-600 text-white'
              : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
          }`}
        >
          {task.completed ? '✓ Done' : 'Mark Done'}
        </button>
      </div>

      {task.dueDate && (
        <div className="mt-2 text-xs text-gray-500">
          Due: {new Date(task.dueDate).toLocaleDateString()}
        </div>
      )}
    </div>
  );
} 