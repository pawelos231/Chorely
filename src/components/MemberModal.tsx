'use client';

import { useState } from 'react';

interface MemberModalProps {
  onAdd: (name: string) => void;
  onClose: () => void;
}

export default function MemberModal({ onAdd, onClose }: MemberModalProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md backdrop-brightness-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-8 w-full max-w-md border border-gray-700/50 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👤</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-100">Add New Member</h2>
          <p className="text-gray-400 mt-2">Add a new household member to assign tasks</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Member Name
            </label>
            <input
              type="text"
              placeholder="Enter member name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              required
              autoFocus
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
            >
              <span>✓</span>
              Add Member
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 