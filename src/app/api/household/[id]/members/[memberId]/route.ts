import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function DELETE(req: Request, { params }: { params: { id: string, memberId: string } }) {
  try {
    const { id: household_id, memberId: user_id } = params;

    // Optional: Check if the user has any outstanding tasks in this household before deleting.
    const tasksRes = await pool.query('SELECT id FROM tasks WHERE household_id = $1 AND assigned_to = $2', [household_id, user_id]);
    if (tasksRes.rows.length > 0) {
      return NextResponse.json({ message: 'Cannot remove member with assigned tasks. Please reassign tasks first.' }, { status: 400 });
    }

    const result = await pool.query(
      'DELETE FROM household_members WHERE household_id = $1 AND user_id = $2 RETURNING *',
      [household_id, user_id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'Member not found in this household.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Member removed successfully.' }, { status: 200 });
  } catch (error) {
    console.error(`Error removing member ${params.memberId} from household ${params.id}:`, error);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
} 