import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Get all household IDs the user is a member of
    const householdIdsRes = await pool.query('SELECT household_id FROM household_members WHERE user_id = $1', [id]);
    const householdIds = householdIdsRes.rows.map(row => row.household_id);

    if (householdIds.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const households = [];
    for (const householdId of householdIds) {
      const householdRes = await pool.query('SELECT id, name, created_at AS "createdAt" FROM households WHERE id = $1', [householdId]);
      if (householdRes.rows.length === 0) continue;

      const household = householdRes.rows[0];

      const membersRes = await pool.query(
        'SELECT u.id, u.name, u.email, hm.role FROM users u JOIN household_members hm ON u.id = hm.user_id WHERE hm.household_id = $1',
        [householdId]
      );
      household.members = membersRes.rows;

      const tasksRes = await pool.query('SELECT * FROM tasks WHERE household_id = $1', [householdId]);
      household.tasks = tasksRes.rows;

      households.push(household);
    }

    return NextResponse.json(households, { status: 200 });
  } catch (error) {
    console.error(`Error fetching households for user ${params.id}:`, error);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
} 