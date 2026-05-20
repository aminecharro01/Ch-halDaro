import { NextRequest, NextResponse } from 'next/server';
import { sportsDB } from '@/lib/api/sportsdb';
import { REGION_LEAGUES } from '@/lib/regions';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const regionKey = id.toLowerCase().replace(/_/g, '-');
    const entries = REGION_LEAGUES[regionKey] || [];

    if (entries.length === 0) {
      return NextResponse.json({ leagues: [] });
    }

    const leagues = await Promise.all(
      entries.map(async (entry) => {
        const row = await sportsDB.getLeagueDetails(entry.id).catch(() => null);
        if (!row) {
          return {
            league: {
              id: parseInt(entry.id, 10),
              name: entry.name,
              logo: '',
              country: entry.country,
            },
          };
        }
        return {
          league: {
            id: parseInt(String(row.idLeague), 10),
            name: row.strLeague || entry.name,
            logo: row.strBadge || row.strLogo || '',
            country: row.strCountry || entry.country,
          },
        };
      })
    );

    return NextResponse.json({
      region: id,
      leagues,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Region error';
    console.error('Region API Error', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
