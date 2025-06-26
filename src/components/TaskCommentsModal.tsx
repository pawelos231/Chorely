'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

// Extended Comment type to include user info from the API
interface ApiComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name: string;
  user_avatar: string | null;
}

interface TaskCommentsModalProps {
  task: Task;
  onClose: () => void;
}

export default function TaskCommentsModal({ task, onClose }: TaskCommentsModalProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [task.id]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      const data = await response.json();
      setComments(data);
    } catch (error) {
      toast.error('Could not load comments.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    try {
      const response = await fetch(`/api/tasks/${task.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, content: newComment.trim() }),
      });
      if (!response.ok) throw new Error('Failed to add comment');
      const addedComment = await response.json();
      setComments([...comments, addedComment]);
      setNewComment('');
      toast.success('Comment added!');
    } catch (error) {
      toast.error('Failed to add comment.');
      console.error(error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(`/api/tasks/${task.id}/comments/${commentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete comment');
      setComments(comments.filter(c => c.id !== commentId));
      toast.success('Comment deleted.');
    } catch (error) {
      toast.error('Failed to delete comment.');
      console.error(error);
    }
  };

  const handleEditComment = (comment: ApiComment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async (commentId: string) => {
    try {
      const response = await fetch(`/api/tasks/${task.id}/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent.trim() }),
      });
      if (!response.ok) throw new Error('Failed to update comment');
      const updatedComment = await response.json();
      setComments(comments.map(c => (c.id === commentId ? { ...c, content: updatedComment.content } : c)));
      setEditingComment(null);
      setEditContent('');
      toast.success('Comment updated!');
    } catch (error) {
      toast.error('Failed to update comment.');
      console.error(error);
    }
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const canEditComment = (comment: ApiComment) => {
    return user && (user.id === comment.user_id || user.role === 'admin');
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
            <div className="text-4xl mb-4">💬</div>
            <p className="text-gray-400">Loading comments...</p>
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
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-100">💬 Task Comments</h2>
            <p className="text-gray-400 text-sm">{task.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto mb-6">
          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map(comment => {
                const isEditing = editingComment === comment.id;
                
                return (
                  <div key={comment.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {comment.user_avatar ? (
                          <img src={comment.user_avatar} alt={comment.user_name} className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">
                              {comment.user_name.charAt(0).toUpperCase() || '?'}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-gray-100 font-medium text-sm">
                            {comment.user_name || 'Unknown User'}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {new Date(comment.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      {canEditComment(comment) && !isEditing && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditComment(comment)}
                            className="text-blue-400 hover:text-blue-300 text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-3">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-gray-100 text-sm resize-none"
                          rows={3}
                          placeholder="Edit your comment..."
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(comment.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">💬</div>
              <p>No comments yet</p>
              <p className="text-sm mt-1">Be the first to comment!</p>
            </div>
          )}
        </div>

        {/* Add Comment Form */}
        {user && (
          <form onSubmit={handleAddComment} className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 text-sm resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  rows={3}
                  placeholder="Add a comment..."
                  required
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Add Comment
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 