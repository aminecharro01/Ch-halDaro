import { NextRequest, NextResponse } from 'next/server';
import { fetchFootballApi } from '@/lib/api-football';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (process.env.DEMO_MODE === "true") {
      const { getMockData } = await import("@/lib/mockData");
      return NextResponse.json(getMockData('/predictions', { fixture: id }));
    }

    const data = await fetchFootballApi('/predictions', { fixture: id });
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("API Predictions Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
