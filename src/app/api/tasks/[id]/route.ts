import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Update a task (e.g., toggle completion)
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { completed } = await req.json();

    const result = await pool.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
      [completed ? 'Done' : 'In Progress', id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ message: `Task with id ${id} not found` }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error(`Error updating task ${params.id}:`, error);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
}

// Delete a task
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ message: `Task with id ${id} not found` }, { status: 404 });
    }

    return NextResponse.json({ message: 'Task deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting task ${params.id}:`, error);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
} 