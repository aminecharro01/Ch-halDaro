import { NextResponse } from 'next/server';
import { fetchFootballApi } from '@/lib/api-football';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    if (process.env.DEMO_MODE === "true") {
      const { getMockData } = await import("@/lib/mockData");
      return NextResponse.json(getMockData('/fixtures', { date }));
    }

    const isToday = date === new Date().toISOString().split('T')[0];
    const revalidate = isToday ? 60 : 86400; // 24 hours for past/future dates
    const data = await fetchFootballApi('/fixtures', { date }, revalidate);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("API Scores Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
