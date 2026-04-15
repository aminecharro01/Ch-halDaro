import { NextResponse } from 'next/server';
import { fetchFootballApi } from '@/lib/api-football';

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const data = await fetchFootballApi('/fixtures', { date: today });
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("API Scores Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
