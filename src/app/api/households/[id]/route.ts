import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // To maintain data integrity, we should delete related records first.
    // This is a cascading delete. In a real-world scenario, you might set up
    // cascading deletes in the database itself.

    // Delete comments related to tasks in the household
    await pool.query('DELETE FROM comments WHERE task_id IN (SELECT id FROM tasks WHERE household_id = $1)', [id]);

    // Delete task history related to tasks in the household
    await pool.query('DELETE FROM task_history WHERE task_id IN (SELECT id FROM tasks WHERE household_id = $1)', [id]);
    
    // Delete tasks in the household
    await pool.query('DELETE FROM tasks WHERE household_id = $1', [id]);
    
    // Delete members of the household
    await pool.query('DELETE FROM household_members WHERE household_id = $1', [id]);
    
    // Finally, delete the household
    const result = await pool.query('DELETE FROM households WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ message: `Household with id ${id} not found.` }, { status: 404 });
    }

    return NextResponse.json({ message: 'Household deleted successfully.' }, { status: 200 });

  } catch (error) {
    console.error(`Error deleting household ${params.id}:`, error);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
} 