import { NextResponse } from 'next/server';
import { fetchFootballApi } from '@/lib/api-football';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const data = await fetchFootballApi('/fixtures', { date });
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("API Scores Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
