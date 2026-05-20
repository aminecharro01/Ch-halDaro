import { sportsDB } from '@/lib/api/sportsdb';
import { normalizeSquad } from '@/lib/api/normalizers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing team id' }, { status: 400 });
  }

  try {
    const data = await sportsDB.getTeamSquad(id);
    const players = normalizeSquad(data);
    return NextResponse.json([{ players }]); // Wrap in array to match expected format
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
