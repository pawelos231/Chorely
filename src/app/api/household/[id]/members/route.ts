import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id: household_id } = params;
    const { user_id, role } = await req.json();

    // Check if member already exists in the household
    const existingMember = await pool.query(
      'SELECT * FROM household_members WHERE household_id = $1 AND user_id = $2',
      [household_id, user_id]
    );

    if (existingMember.rows.length > 0) {
      return NextResponse.json({ message: 'User is already a member of this household.' }, { status: 409 });
    }

    const result = await pool.query(
      'INSERT INTO household_members (household_id, user_id, role) VALUES ($1, $2, $3) RETURNING *',
      [household_id, user_id, role]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error(`Error adding member to household ${params.id}:`, error);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
} 