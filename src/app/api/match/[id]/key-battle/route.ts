import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { sportsDB } from '@/lib/api/sportsdb';
import {
  isQuotaExceeded,
  requireVisitedMatch,
  ruleBasedKeyBattle,
} from '@/lib/content-fallback';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!requireVisitedMatch(request)) {
      return NextResponse.json({ analysis: null, skipped: true });
    }

    const match = await sportsDB.getMatchDetails(id);
    if (!match) {
      return NextResponse.json({ analysis: 'Match data not found.' });
    }

    const fallback = ruleBasedKeyBattle(match.teams.home.name, match.teams.away.name);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ analysis: fallback, source: 'fallback' });
    }

    const [homeSquad, awaySquad] = await Promise.all([
      sportsDB.getTeamSquad(String(match.teams.home.id)).catch(() => []),
      sportsDB.getTeamSquad(String(match.teams.away.id)).catch(() => []),
    ]);

    const homePlayers = homeSquad
      .slice(0, 5)
      .map((p: { strPlayer?: string }) => p.strPlayer)
      .filter(Boolean)
      .join(', ');
    const awayPlayers = awaySquad
      .slice(0, 5)
      .map((p: { strPlayer?: string }) => p.strPlayer)
      .filter(Boolean)
      .join(', ');

    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Analyse le match de football: ${match.teams.home.name} vs ${match.teams.away.name}.
    Joueurs clés domicile: ${homePlayers || 'non disponibles'}
    Joueurs clés extérieur: ${awayPlayers || 'non disponibles'}
    Identifie UN "Duel Clé" (Key Battle) entre deux joueurs opposés.
    Explique pourquoi ce duel sera déterminant pour l'issue du match.
    Format: Une courte analyse percutante de 2-3 phrases en français.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ analysis: text, source: 'generated' });
  } catch (error: unknown) {
    if (isQuotaExceeded(error)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[key-battle] Gemini quota exceeded — using rule-based fallback');
      }
    } else {
      const message = error instanceof Error ? error.message : 'Key battle failed';
      console.error('[key-battle]', message);
    }

    if (isQuotaExceeded(error)) {
      try {
        const { id } = await params;
        const match = await sportsDB.getMatchDetails(id);
        if (match) {
          return NextResponse.json({
            analysis: ruleBasedKeyBattle(match.teams.home.name, match.teams.away.name),
            source: 'fallback',
          });
        }
      } catch {
        /* ignore */
      }
    }

    return NextResponse.json({
      analysis: 'Analyse du duel clé temporairement indisponible.',
      source: 'error',
    });
  }
}
