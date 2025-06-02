import { Comment } from '@/types';

export const addComment = (
  taskId: string,
  userId: string,
  content: string
): Comment => {
  const newComment: Comment = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    task_id: taskId,
    user_id: userId,
    content: content.trim(),
    created_at: new Date().toISOString(),
  };

  // Load existing comments
  const savedComments = localStorage.getItem('chorely-comments');
  const existingComments: Comment[] = savedComments ? JSON.parse(savedComments) : [];

  // Add new comment
  const updatedComments = [...existingComments, newComment];

  // Save back to localStorage
  localStorage.setItem('chorely-comments', JSON.stringify(updatedComments));

  console.log('Comment added:', newComment);
  return newComment;
};

export const getCommentsForTask = (taskId: string): Comment[] => {
  const savedComments = localStorage.getItem('chorely-comments');
  const comments: Comment[] = savedComments ? JSON.parse(savedComments) : [];

  return comments
    .filter(c => c.task_id === taskId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
};

export const getCommentsByUser = (userId: string): Comment[] => {
  const savedComments = localStorage.getItem('chorely-comments');
  const comments: Comment[] = savedComments ? JSON.parse(savedComments) : [];

  return comments
    .filter(c => c.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const getAllComments = (): Comment[] => {
  const savedComments = localStorage.getItem('chorely-comments');
  const comments: Comment[] = savedComments ? JSON.parse(savedComments) : [];

  return comments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const deleteComment = (commentId: string): boolean => {
  try {
    const savedComments = localStorage.getItem('chorely-comments');
    const comments: Comment[] = savedComments ? JSON.parse(savedComments) : [];

    const updatedComments = comments.filter(c => c.id !== commentId);
    localStorage.setItem('chorely-comments', JSON.stringify(updatedComments));

    console.log('Comment deleted:', commentId);
    return true;
  } catch (error) {
    console.error('Error deleting comment:', error);
    return false;
  }
};

export const updateComment = (commentId: string, newContent: string): boolean => {
  try {
    const savedComments = localStorage.getItem('chorely-comments');
    const comments: Comment[] = savedComments ? JSON.parse(savedComments) : [];

    const updatedComments = comments.map(c => 
      c.id === commentId 
        ? { ...c, content: newContent.trim() }
        : c
    );

    localStorage.setItem('chorely-comments', JSON.stringify(updatedComments));

    console.log('Comment updated:', commentId);
    return true;
  } catch (error) {
    console.error('Error updating comment:', error);
    return false;
  }
};

export const getCommentCount = (taskId: string): number => {
  return getCommentsForTask(taskId).length;
}; 