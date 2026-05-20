import { sportsDB } from '@/lib/api/sportsdb';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing team id' }, { status: 400 });
  }

  try {
    const team = await sportsDB.getTeam(id);
    // Wrap in array to match frontend expectation
    return NextResponse.json(team ? [{ team }] : []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
