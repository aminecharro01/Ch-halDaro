import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { sportsDB } from '@/lib/api/sportsdb';
import {
  isQuotaExceeded,
  requireVisitedMatch,
  ruleBasedMatchSummary,
} from '@/lib/content-fallback';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!requireVisitedMatch(request)) {
      return NextResponse.json({
        summary: 'Ouvrez la page du match pour afficher le résumé.',
        skipped: true,
      });
    }

    const [match, timeline] = await Promise.all([
      sportsDB.getMatchDetails(id),
      sportsDB.getMatchTimeline(id),
    ]);

    if (!match) {
      return NextResponse.json({ summary: 'Match data not found.' });
    }

    const fallback = ruleBasedMatchSummary(
      match.teams.home.name,
      match.teams.away.name,
      match.goals.home,
      match.goals.away,
      timeline
    );

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ summary: fallback, source: 'fallback' });
    }

    const eventsStr = timeline
      .map((e: { minute?: number; type?: string; player?: string }) => `${e.minute}': ${e.type} by ${e.player}`)
      .join(', ');

    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Génère un bref résumé (max 3 phrases) en français pour le match de football suivant:
    Affiche: ${match.teams.home.name} vs ${match.teams.away.name}
    Score: ${match.goals.home} - ${match.goals.away}
    Événements: ${eventsStr}
    Le résumé doit être dynamique et informatif.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ summary: text, source: 'generated' });
  } catch (error: unknown) {
    console.error('[API Summary]', error);

    if (isQuotaExceeded(error)) {
      try {
        const { id } = await params;
        const [match, timeline] = await Promise.all([
          sportsDB.getMatchDetails(id),
          sportsDB.getMatchTimeline(id),
        ]);
        if (match) {
          return NextResponse.json({
            summary: ruleBasedMatchSummary(
              match.teams.home.name,
              match.teams.away.name,
              match.goals.home,
              match.goals.away,
              timeline
            ),
            source: 'fallback',
          });
        }
      } catch {
        /* ignore */
      }
    }

    return NextResponse.json({
      summary: 'Résumé temporairement indisponible. Réessayez plus tard.',
      source: 'error',
    });
  }
}
