import { getTeamEventsPast } from '@/lib/thesportsdb';
import { mapMatch } from '@/lib/api-adapter';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing team id' }, { status: 400 });
  }

  try {
    const data = await getTeamEventsPast(id);
    const eventList = Array.isArray(data) ? data : (data.results || []);
    const matches = eventList.map(mapMatch);
    return NextResponse.json(matches);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
