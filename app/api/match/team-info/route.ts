import { getTeamDetails } from '@/lib/thesportsdb';
import { mapTeam } from '@/lib/api-adapter';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing team id' }, { status: 400 });
  }

  try {
    const data = await getTeamDetails(id);
    const teamList = Array.isArray(data) ? data : (data.teams || []);
    const teams = teamList.map(mapTeam);
    return NextResponse.json(teams);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
