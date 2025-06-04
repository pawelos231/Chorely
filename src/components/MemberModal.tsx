'use client';

import { useState, useEffect } from 'react';
import { Member, User } from '@/types';
import { memberSchema, formatZodErrors, type MemberFormData } from '@/utils/validation';
import toast from 'react-hot-toast';
import { z } from 'zod';

interface MemberModalProps {
  onAdd: (member: Omit<Member, 'id'>) => void;
  onClose: () => void;
  existingMembers: Member[];
}

interface ValidationErrors {
  name?: string;
  email?: string;
  role?: string;
  age?: string;
  room?: string;
  phone?: string;
  bio?: string;
  color?: string;
}

export default function MemberModal({ onAdd, onClose, existingMembers }: MemberModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    age: '',
    room: '',
    phone: '',
    bio: '',
    color: '#3B82F6',
  });
  const [users, setUsers] = useState<User[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isSelectingExistingUser, setIsSelectingExistingUser] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load all users for suggestions
  useEffect(() => {
    const savedUsers = localStorage.getItem('chorely-users');
    if (savedUsers) {
      try {
        const allUsers: User[] = JSON.parse(savedUsers);
        setUsers(allUsers);
        
        // Filter out users who are already members
        const existingEmails = existingMembers.map(m => m.email).filter(Boolean);
        const existingNames = existingMembers.map(m => m.name.toLowerCase());
        const available = allUsers.filter(user => 
          !existingEmails.includes(user.email) && 
          !existingNames.includes(user.name.toLowerCase())
        );
        setAvailableUsers(available);
      } catch {
        toast.error('Failed to load user data');
      }
    }
  }, [existingMembers]);

  // Filter suggested users based on email input and exclude existing members
  useEffect(() => {
    if (formData.email && users.length > 0 && !isSelectingExistingUser) {
      const existingEmails = existingMembers.map(m => m.email).filter(Boolean);
      const existingNames = existingMembers.map(m => m.name.toLowerCase());
      const filtered = users.filter(user => 
        user.email.toLowerCase().includes(formData.email.toLowerCase()) &&
        !existingEmails.includes(user.email) &&
        !existingNames.includes(user.name.toLowerCase())
      );
      setSuggestedUsers(filtered);
      setShowSuggestions(filtered.length > 0 && formData.email.length > 0);
    } else {
      setSuggestedUsers([]);
      setShowSuggestions(false);
    }
  }, [formData.email, users, existingMembers, isSelectingExistingUser]);

  const validateForm = (data: typeof formData): ValidationErrors => {
    // Prepare data for zod validation
    const validationData: Partial<MemberFormData> = {
      name: data.name.trim(),
      email: data.email.trim() || undefined,
      role: data.role.trim() || undefined,
      age: data.age ? parseInt(data.age) : undefined,
      room: data.room.trim() || undefined,
      phone: data.phone.trim() || undefined,
      bio: data.bio.trim() || undefined,
      color: data.color,
    };

    try {
      memberSchema.parse(validationData);
      
      // Additional custom validations for duplicates
      const customErrors: ValidationErrors = {};

      // Check for duplicate names (case insensitive)
      const duplicateName = existingMembers.some(
        member => member.name.toLowerCase() === data.name.trim().toLowerCase()
      );
      if (duplicateName) {
        customErrors.name = 'A member with this name already exists';
      }

      // Check for duplicate emails if email is provided
      if (data.email.trim()) {
        const duplicateEmail = existingMembers.some(
          member => member.email && member.email.toLowerCase() === data.email.trim().toLowerCase()
        );
        if (duplicateEmail) {
          customErrors.email = 'A member with this email already exists';
        }
      }

      return customErrors;
    } catch (error: unknown) {
      const zodErrors = formatZodErrors(error as z.ZodError);
      
      // Merge zod errors with custom validations
      const duplicateErrors: ValidationErrors = {};
      const duplicateName = existingMembers.some(
        member => member.name.toLowerCase() === data.name.trim().toLowerCase()
      );
      if (duplicateName) {
        duplicateErrors.name = 'A member with this name already exists';
      }

      if (data.email.trim()) {
        const duplicateEmail = existingMembers.some(
          member => member.email && member.email.toLowerCase() === data.email.trim().toLowerCase()
        );
        if (duplicateEmail) {
          duplicateErrors.email = 'A member with this email already exists';
        }
      }

      return { ...zodErrors, ...duplicateErrors };
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
      const memberData = {
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        role: formData.role.trim() || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        room: formData.room.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        bio: formData.bio.trim() || undefined,
        color: formData.color,
      };

      onAdd(memberData);

      // Reset form
      setFormData({
        name: '',
        email: '',
        role: '',
        age: '',
        room: '',
        phone: '',
        bio: '',
        color: '#3B82F6',
      });
      setSelectedUserId('');
      setIsSelectingExistingUser(false);
      setErrors({});
      
      toast.success(`${memberData.name} has been added to the household!`);
    } catch {
      toast.error('Failed to add member. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectSuggestedUser = (user: User) => {
    setFormData({
      ...formData,
      name: user.name,
      email: user.email,
    });
    setShowSuggestions(false);
    setSelectedUserId(user.id);
    // Clear validation errors when user is selected
    setErrors({});
    toast.success(`Selected ${user.name} from registered users`);
  };

  const handleUserSelection = (userId: string) => {
    const user = availableUsers.find(u => u.id === userId);
    if (user) {
      setFormData({
        ...formData,
        name: user.name,
        email: user.email,
      });
      setSelectedUserId(userId);
      // Clear validation errors when user is selected
      setErrors({});
      toast.success(`Selected ${user.name} from registered users`);
    }
  };

  const toggleUserSelection = () => {
    setIsSelectingExistingUser(!isSelectingExistingUser);
    if (!isSelectingExistingUser) {
      // Clear form when switching to existing user mode
      setFormData({
        ...formData,
        name: '',
        email: '',
      });
      setSelectedUserId('');
    } else {
      // Clear selection when switching to manual entry
      setSelectedUserId('');
    }
    // Clear errors when switching modes
    setErrors({});
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const predefinedColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-100">Add Member</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-2xl"
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Selection Toggle */}
          {availableUsers.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-4 mb-3">
                <button
                  type="button"
                  onClick={toggleUserSelection}
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isSelectingExistingUser 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Select Existing User
                </button>
                <button
                  type="button"
                  onClick={toggleUserSelection}
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    !isSelectingExistingUser 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Add New Member
                </button>
              </div>
              
              {isSelectingExistingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Choose from registered users
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => handleUserSelection(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value="">-- Select a user --</option>
                    {availableUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                        {user.role === 'admin' ? ' - Admin' : ''}
                      </option>
                    ))}
                  </select>
                  
                  {/* Display selected user info */}
                  {selectedUserId && (
                    <div className="mt-3 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                      {(() => {
                        const user = availableUsers.find(u => u.id === selectedUserId);
                        return user ? (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-white">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-gray-100 font-medium">{user.name}</p>
                              <p className="text-gray-400 text-sm">{user.email}</p>
                              {user.role === 'admin' && (
                                <span className="text-xs bg-red-600/20 text-red-400 px-2 py-1 rounded mt-1 inline-block">
                                  Admin
                                </span>
                              )}
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-gray-100 focus:ring-1 ${
                errors.name 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'
              } disabled:opacity-50`}
              placeholder="Enter member name"
              required
              disabled={isSubmitting || (isSelectingExistingUser && selectedUserId !== '')}
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email Field - with suggestions for manual entry */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email (Optional)
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-gray-100 focus:ring-1 ${
                errors.email 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'
              } disabled:opacity-50`}
              placeholder={isSelectingExistingUser ? "Email will be filled automatically" : "Enter email to search existing users"}
              disabled={isSubmitting || (isSelectingExistingUser && selectedUserId !== '')}
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
            
            {/* User Suggestions - only show in manual entry mode */}
            {showSuggestions && !isSelectingExistingUser && (
              <div className="absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 rounded-lg mt-1 shadow-lg z-10 max-h-40 overflow-y-auto">
                {suggestedUsers.map(user => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => selectSuggestedUser(user)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-600 transition-colors flex items-center gap-3"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-100 font-medium">{user.name}</p>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                    </div>
                    {user.role === 'admin' && (
                      <span className="ml-auto text-xs bg-red-600/20 text-red-400 px-2 py-1 rounded">
                        Admin
                      </span>
                    )}
                  </button>
                ))}
                {suggestedUsers.length === 0 && formData.email && (
                  <div className="px-3 py-2 text-gray-400 text-sm">
                    No matching users found
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Role (Optional)
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-gray-100 focus:ring-1 ${
                errors.role 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'
              } disabled:opacity-50`}
              placeholder="e.g., Parent, Child, Roommate"
              disabled={isSubmitting}
            />
            {errors.role && (
              <p className="text-red-400 text-sm mt-1">{errors.role}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Age (Optional)
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-gray-100 focus:ring-1 ${
                  errors.age 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                } disabled:opacity-50`}
                placeholder="Age"
                min="1"
                max="120"
                disabled={isSubmitting}
              />
              {errors.age && (
                <p className="text-red-400 text-sm mt-1">{errors.age}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Room (Optional)
              </label>
              <input
                type="text"
                value={formData.room}
                onChange={(e) => handleInputChange('room', e.target.value)}
                className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-gray-100 focus:ring-1 ${
                  errors.room 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                } disabled:opacity-50`}
                placeholder="Room name"
                disabled={isSubmitting}
              />
              {errors.room && (
                <p className="text-red-400 text-sm mt-1">{errors.room}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Phone (Optional)
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-gray-100 focus:ring-1 ${
                errors.phone 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'
              } disabled:opacity-50`}
              placeholder="Phone number"
              disabled={isSubmitting}
            />
            {errors.phone && (
              <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Color
            </label>
            <div className="flex gap-2 mb-2">
              {predefinedColors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleInputChange('color', color)}
                  disabled={isSubmitting}
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color ? 'border-white' : 'border-gray-600'
                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => handleInputChange('color', e.target.value)}
              disabled={isSubmitting}
              className="w-full h-10 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer disabled:opacity-50"
            />
            {errors.color && (
              <p className="text-red-400 text-sm mt-1">{errors.color}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bio (Optional)
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-gray-100 focus:ring-1 resize-none ${
                errors.bio 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'
              } disabled:opacity-50`}
              placeholder="Brief description about the member"
              rows={3}
              disabled={isSubmitting}
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.bio && (
                <p className="text-red-400 text-sm">{errors.bio}</p>
              )}
              <div className="text-right text-xs text-gray-400 ml-auto">
                {formData.bio.length}/500
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </>
              ) : (
                'Add Member'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 