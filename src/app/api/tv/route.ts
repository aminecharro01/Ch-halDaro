import { NextRequest, NextResponse } from 'next/server';
import { sportsDB } from '@/lib/api/sportsdb';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const country = searchParams.get('country');

  try {
    const listings = country
      ? await sportsDB.getTVByCountry(country)
      : await sportsDB.getTVByDay(date);

    return NextResponse.json({ date, country: country || null, listings: listings || [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'TV listings failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
