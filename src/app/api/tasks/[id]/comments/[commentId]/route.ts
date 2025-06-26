import db from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// DELETE a comment
export async function DELETE(request: NextRequest, { params }: { params: { commentId: string } }) {
  const commentId = params.commentId;
  try {
    const result = await db.query('DELETE FROM comments WHERE id = $1 RETURNING id', [commentId]);
    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Comment not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Comment deleted' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete comment:', error);
    return NextResponse.json({ message: 'Failed to delete comment' }, { status: 500 });
  }
}

// PUT (update) a comment
export async function PUT(request: NextRequest, { params }: { params: { commentId: string } }) {
  const commentId = params.commentId;
  const { content } = await request.json();

  if (!content) {
    return NextResponse.json({ message: 'Content is required' }, { status: 400 });
  }

  try {
    const result = await db.query(
      'UPDATE comments SET content = $1 WHERE id = $2 RETURNING *',
      [content, commentId]
    );
    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Comment not found' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to update comment:', error);
    return NextResponse.json({ message: 'Failed to update comment' }, { status: 500 });
  }
} 