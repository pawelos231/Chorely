import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { title, description, assigned_to, household_id, due_date, status } = await req.json();

    const result = await pool.query(
      'INSERT INTO tasks (title, description, assigned_to, household_id, due_date, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description, assigned_to, household_id, due_date, status]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ message: 'An error occurred while creating the task.' }, { status: 500 });
  }
} 