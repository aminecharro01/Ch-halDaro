import { NextRequest, NextResponse } from 'next/server';
import { fetchFootballApi } from '@/lib/api-football';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await fetchFootballApi('/predictions', { fixture: id });
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("API Predictions Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
