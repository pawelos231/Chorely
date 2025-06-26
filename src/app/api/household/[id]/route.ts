import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Fetch household details
    const householdRes = await pool.query(`
      SELECT 
        id, 
        name, 
        created_at AS "createdAt",
        description,
        number_of_rooms AS "numberOfRooms",
        house_size AS "houseSize",
        number_of_floors AS "numberOfFloors",
        address,
        house_type AS "houseType",
        has_garden AS "hasGarden",
        has_garage AS "hasGarage",
        has_basement AS "hasBasement",
        has_attic AS "hasAttic"
      FROM households 
      WHERE id = $1
    `, [id]);
    if (householdRes.rows.length === 0) {
      return NextResponse.json({ message: `Household with id ${id} not found` }, { status: 404 });
    }
    const household = householdRes.rows[0];

    // Fetch members
    const membersRes = await pool.query(
      `SELECT u.id, u.name, u.email, hm.role 
       FROM users u 
       JOIN household_members hm ON u.id = hm.user_id 
       WHERE hm.household_id = $1`,
      [id]
    );
    household.members = membersRes.rows;

    // Fetch tasks and their comments
    const tasksRes = await pool.query(`
      SELECT 
        t.*,
        t.created_at as "createdAt",
        COALESCE(
          (SELECT json_agg(c.*) FROM comments c WHERE c.task_id = t.id),
          '[]'::json
        ) as comments
      FROM tasks t
      WHERE t.household_id = $1
    `, [id]);
    household.tasks = tasksRes.rows;

    return NextResponse.json(household, { status: 200 });

  } catch (error) {
    console.error(`Error fetching data for household ${params.id}:`, error);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
} 