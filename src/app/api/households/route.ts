import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const householdsRes = await pool.query('SELECT id, name, created_at AS "createdAt" FROM households');
    const households = householdsRes.rows;

    for (const household of households) {
      const membersRes = await pool.query(
        'SELECT u.id, u.name, u.email, hm.role FROM users u JOIN household_members hm ON u.id = hm.user_id WHERE hm.household_id = $1',
        [household.id]
      );
      household.members = membersRes.rows;

      const tasksRes = await pool.query('SELECT * FROM tasks WHERE household_id = $1', [household.id]);
      household.tasks = tasksRes.rows;
    }

    return NextResponse.json(households, { status: 200 });
  } catch (error) {
    console.error('Error fetching all households:', error);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ message: 'Household name is required.' }, { status: 400 });
    }

    const result = await pool.query(
      'INSERT INTO households (name) VALUES ($1) RETURNING id, name, created_at AS "createdAt"',
      [name]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating household:', error);
    return NextResponse.json({ message: 'An error occurred while creating the household.' }, { status: 500 });
  }
} 