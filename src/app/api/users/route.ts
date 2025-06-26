import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query('SELECT id, name, email FROM users');
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'An error occurred while fetching users.' }, { status: 500 });
  }
} 