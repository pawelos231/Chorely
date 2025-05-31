'use client';

import Link from 'next/link';
import { Member } from '@/types';

interface MembersViewModalProps {
  members: Member[];
  onRemove: (memberId: string) => void;
  onAddNew: () => void;
  onClose: () => void;
}

export default function MembersViewModal({ 
  members, 
  onRemove, 
  onAddNew, 
  onClose 
}: MembersViewModalProps) {
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
      <div className="bg-gray-800 rounded-xl p-8 w-full max-w-2xl border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-xl">👥</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-100">Household Members</h2>
              <p className="text-gray-400">Manage your household members</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto mb-6">
          {members.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">👤</div>
              <p>No members added yet</p>
            </div>
          ) : (
            members.map(member => (
              <div key={member.id} className="flex items-center justify-between bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors">
                <Link 
                  href={`/member/${member.id}`}
                  className="flex items-center gap-3 flex-1 text-left hover:opacity-80 transition-opacity"
                  onClick={onClose}
                >
                  <div className={`w-10 h-10 rounded-full ${member.color} flex items-center justify-center text-white font-bold`}>
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-gray-100 font-medium">{member.name}</span>
                    <div className="text-xs text-gray-400">
                      {member.role || 'Member'} • Click to view profile
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => onRemove(member.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-2 rounded-lg transition-all"
                  title="Remove member"
                >
                  <span className="text-lg">🗑️</span>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onAddNew}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
          >
            <span>➕</span>
            Add New Member
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 