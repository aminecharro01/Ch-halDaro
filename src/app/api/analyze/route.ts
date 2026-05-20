import { NextRequest, NextResponse } from 'next/server';
import { model } from '@/lib/analysis-engine';
import { isQuotaExceeded, requireVisitedMatch, ruleBasedAnalysis } from '@/lib/content-fallback';

function formatEvents(events: { minute?: number; player?: string; type?: string; detail?: string }[]) {
  if (!events?.length) return 'None';
  return events
    .filter((e) => e.type === 'goal' || e.type?.includes('card'))
    .map((e) => `${e.minute ?? '?'}' ${e.player ?? 'Unknown'} (${e.type}${e.detail ? ` - ${e.detail}` : ''})`)
    .join(', ');
}

function extractStat(
  statistics: { team?: { id: string }; statistics?: { type: string; value: string }[] }[],
  label: string,
  side: 'home' | 'away'
) {
  const block = statistics?.find((s) => s.team?.id === side);
  const stat = block?.statistics?.find((x) => x.type?.toLowerCase().includes(label.toLowerCase()));
  return stat?.value ?? 'N/A';
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { homeTeam, awayTeam, score, events = [], statistics = [] } = body;

  try {

    if (!requireVisitedMatch(request)) {
      return NextResponse.json({
        analysis: 'Ouvrez la page du match pour afficher l’analyse complète.',
        skipped: true,
      });
    }

    const fallback = ruleBasedAnalysis(homeTeam, awayTeam, score);

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ analysis: fallback, source: 'fallback' });
    }

    const prompt = `You are a professional football match analyst. Write a concise 2-paragraph post-match report in broadcast journalism style in French.

Match: ${homeTeam} ${score} ${awayTeam}
Goals: ${formatEvents(events)}
Possession: ${extractStat(statistics, 'possession', 'home')}% vs ${extractStat(statistics, 'possession', 'away')}%
Shots on target: ${extractStat(statistics, 'shots on goal', 'home')} vs ${extractStat(statistics, 'shots on goal', 'away')}
Cards: ${events.filter((e: { type?: string }) => e.type?.includes('card')).map((e: { minute?: number; player?: string }) => `${e.minute}' ${e.player}`).join(', ') || 'None'}

Write the report now:`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ analysis: text, source: 'generated' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Analysis failed';
    console.error('API Analyze Error:', message);

    if (isQuotaExceeded(error)) {
      return NextResponse.json({
        analysis: ruleBasedAnalysis(homeTeam, awayTeam, score),
        source: 'fallback',
      });
    }

    return NextResponse.json({ error: message, analysis: null }, { status: 200 });
  }
}
