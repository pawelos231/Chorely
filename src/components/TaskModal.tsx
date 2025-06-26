'use client';

import { useState } from 'react';
import { Task, Member } from '@/types';
import { taskSchema, formatZodErrors } from '@/utils/validation';
import toast from 'react-hot-toast';
import { z } from 'zod';

interface TaskModalProps {
  members: Member[];
  onAdd: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void;
  onClose: () => void;
}

interface ValidationErrors {
  title?: string;
  description?: string;
  assignedTo?: string;
  priority?: string;
  category?: string;
  dueDate?: string;
}

export default function TaskModal({ members, onAdd, onClose }: TaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: 'Other',
    dueDate: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (data: typeof formData): ValidationErrors => {
    try {
      taskSchema.parse(data);
      return {};
    } catch (error: unknown) {
      const zodErrors = formatZodErrors(error as z.ZodError);
      return zodErrors;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error('Please fix the form errors before submitting');
      setIsSubmitting(false);
      return;
    }

    try {
      onAdd(formData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'medium',
        category: 'Other',
        dueDate: '',
      });
      setErrors({});
      
      toast.success(`Task "${formData.title}" has been created!`);
    } catch {
      toast.error('Failed to create task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | 'low' | 'medium' | 'high') => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  const categories = [
    'Cleaning',
    'Cooking',
    'Shopping',
    'Maintenance',
    'Yard Work',
    'Bills',
    'Other',
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-100">Add New Task</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-2xl"
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              placeholder="Enter task title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-gray-100 focus:ring-1 ${
                errors.title 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'
              } disabled:opacity-50`}
              required
              disabled={isSubmitting}
              maxLength={100}
            />
            {errors.title && (
              <p className="text-red-400 text-sm mt-1">{errors.title}</p>
            )}
          </div>
          
          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              placeholder="Enter task description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-gray-100 focus:ring-1 resize-none ${
                errors.description 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'
              } disabled:opacity-50`}
              rows={3}
              disabled={isSubmitting}
              maxLength={500}
            />
            {errors.description && (
              <p className="text-red-400 text-sm mt-1">{errors.description}</p>
            )}
            <div className="text-right text-xs text-gray-400 mt-1">
              {formData.description.length}/500
            </div>
          </div>

          {/* Assigned To Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Assign To *
            </label>
            <select
              value={formData.assignedTo}
              onChange={(e) => handleInputChange('assignedTo', e.target.value)}
              className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-gray-100 focus:ring-1 ${
                errors.assignedTo 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'
              } disabled:opacity-50`}
              required
              disabled={isSubmitting}
            >
              <option value="">-- Select a member --</option>
              {members.map(member => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
            {errors.assignedTo && (
              <p className="text-red-400 text-sm mt-1">{errors.assignedTo}</p>
            )}
          </div>

          {/* Category Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-gray-100 focus:ring-1 ${
                errors.category 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'
              } disabled:opacity-50`}
              disabled={isSubmitting}
            >
              {categories.map((category: string) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-400 text-sm mt-1">{errors.category}</p>
            )}
          </div>

          {/* Priority Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Priority *
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value as 'low' | 'medium' | 'high')}
              className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-gray-100 focus:ring-1 ${
                errors.priority 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'
              } disabled:opacity-50`}
              disabled={isSubmitting}
            >
              <option value="low">🟢 Low Priority</option>
              <option value="medium">🟡 Medium Priority</option>
              <option value="high">🔴 High Priority</option>
            </select>
            {errors.priority && (
              <p className="text-red-400 text-sm mt-1">{errors.priority}</p>
            )}
          </div>

          {/* Due Date Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Due Date *
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-gray-100 focus:ring-1 ${
                errors.dueDate 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'
              } disabled:opacity-50`}
              min={today}
              required
              disabled={isSubmitting}
            />
            {errors.dueDate && (
              <p className="text-red-400 text-sm mt-1">{errors.dueDate}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                'Add Task'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 