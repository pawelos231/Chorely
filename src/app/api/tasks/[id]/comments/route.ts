import db from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET comments for a task
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const taskId = params.id;
  try {
    const comments = await db.query(
      `SELECT c.*, u.name as user_name, u.avatar as user_avatar 
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.task_id = $1 
       ORDER BY c.created_at ASC`,
      [taskId]
    );
    return NextResponse.json(comments.rows);
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    return NextResponse.json({ message: 'Failed to fetch comments' }, { status: 500 });
  }
}

// POST a new comment
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const taskId = params.id;
  const { user_id, content } = await request.json();

  if (!user_id || !content) {
    return NextResponse.json({ message: 'Missing user_id or content' }, { status: 400 });
  }

  try {
    const result = await db.query(
      'INSERT INTO comments (task_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
      [taskId, user_id, content]
    );
    // Also fetch user info for the response
    const userResult = await db.query('SELECT name, avatar FROM users WHERE id = $1', [user_id]);
    const comment = {
      ...result.rows[0],
      user_name: userResult.rows[0].name,
      user_avatar: userResult.rows[0].avatar
    };

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Failed to create comment:', error);
    return NextResponse.json({ message: 'Failed to create comment' }, { status: 500 });
  }
} 