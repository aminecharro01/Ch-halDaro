'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { EventTimeline } from '@/components/EventTimeline';
import { StatBar } from '@/components/StatBar';
import { PredictionPanel } from '@/components/PredictionPanel';
import { MatchAnalysis } from '@/components/MatchAnalysis';
import { LineupField } from '@/components/LineupField';
import { KeyBattle } from '@/components/KeyBattle';
import {
  LayoutGrid,
  FileText,
  ListOrdered,
  BarChart3,
  Users,
  History,
  Trophy,
  Tv,
  Sparkles,
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const TABS = [
  { id: 'info', label: 'Info', icon: LayoutGrid },
  { id: 'summary', label: 'Summary', icon: FileText },
  { id: 'events', label: 'Events', icon: ListOrdered },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
  { id: 'lineups', label: 'Line-ups', icon: Users },
  { id: 'h2h', label: 'H2H', icon: History },
  { id: 'table', label: 'Table', icon: Trophy },
  { id: 'tv', label: 'TV', icon: Tv },
] as const;

type TabId = (typeof TABS)[number]['id'];

type MatchBundle = {
  fixture: any;
  lineups: any[];
  events: any[];
  statistics: any[];
  analysis: string | null;
  tv: any[];
  media: Record<string, string | null | undefined>;
  headToHead?: any[];
  leagueTable?: { standings: any[]; leagueId: number; season: string } | null;
};

export function MatchDetailTabs({ matchId, data }: { matchId: string; data: MatchBundle }) {
  const [tab, setTab] = useState<TabId>('info');

  const { data: summaryRes, isLoading: summaryLoading } = useSWR(
    tab === 'summary' ? `/api/match/${matchId}/summary` : null,
    fetcher
  );

  const match = data.fixture;
  const isFinished = ['FT', 'AET', 'PEN'].includes(match?.fixture?.status?.short);
  const isNotStarted = match?.fixture?.status?.short === 'NS' || match?.fixture?.status?.short === 'TBD';

  const stats = data.statistics || [];
  const homeStats = stats[0]?.statistics || [];
  const awayStats = stats[1]?.statistics || [];

  const getStat = (arr: any[], type: string) => {
    const found = arr.find((s: any) => (s.type || s.strStat)?.toLowerCase() === type.toLowerCase());
    return found ? found.value : 0;
  };

  const statTypes = ['Ball Possession', 'Total Shots', 'Shots on Goal', 'Corner Kicks', 'Fouls', 'Yellow Cards', 'Red Cards'];

  const homeId = match?.teams?.home?.id;
  const awayId = match?.teams?.away?.id;

  const h2h = data.headToHead || [];
  const leagueBlock = data.leagueTable;

  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 overflow-x-auto scrollbar-hide">
        <nav className="flex gap-1 min-w-max pb-px" role="tablist" aria-label="Match sections">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-widest rounded-t-xl border border-b-0 transition whitespace-nowrap ${
                tab === id
                  ? 'bg-white text-black border-white/20'
                  : 'bg-transparent text-gray-500 border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5 opacity-80" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="min-h-[280px]">
        {tab === 'info' && (
          <div className="space-y-6 max-w-3xl">
            {match?.fixture?.description ? (
              <div className="prose prose-invert prose-sm max-w-none">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{match.fixture.description}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No match description from the data provider.</p>
            )}
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {match?.fixture?.venue?.name && (
                <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-4">
                  <dt className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Venue</dt>
                  <dd className="font-bold text-white">
                    {match.fixture.venue.name}
                    {match.fixture.venue.city ? ` · ${match.fixture.venue.city}` : ''}
                  </dd>
                </div>
              )}
              <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-4">
                <dt className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Kick-off</dt>
                <dd className="font-bold text-white">
                  {new Date(match.fixture.date).toLocaleString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </dd>
              </div>
              {match?.fixture?.status?.round != null && (
                <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-4">
                  <dt className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Round</dt>
                  <dd className="font-bold text-white">{match.fixture.status.round}</dd>
                </div>
              )}
              {match?.fixture?.spectators != null && (
                <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-4">
                  <dt className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Attendance</dt>
                  <dd className="font-bold text-white">{match.fixture.spectators.toLocaleString()}</dd>
                </div>
              )}
            </dl>
            {data.media?.strVideo && (
              <a
                href={String(data.media.strVideo)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-red-600/90 text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500 transition"
              >
                Highlights / video
              </a>
            )}
            {isNotStarted && (
              <div className="pt-4 border-t border-white/10">
                <PredictionPanel fixtureId={matchId} />
              </div>
            )}
          </div>
        )}

        {tab === 'summary' && (
          <div className="space-y-8 max-w-3xl">
            {data.analysis && (
              <div className="bg-gradient-to-br from-indigo-900/30 to-violet-900/20 border border-indigo-500/25 rounded-3xl p-6">
                <h3 className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.25em] mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Tactical analysis
                </h3>
                <p className="text-white/95 text-lg leading-relaxed italic">{data.analysis}</p>
              </div>
            )}
            <KeyBattle matchId={matchId} />
            <div className="bg-gray-900/50 border border-white/5 rounded-3xl p-6">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.25em] mb-3">Short summary</h3>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {summaryLoading ? 'Loading…' : summaryRes?.summary || 'Summary unavailable.'}
              </p>
            </div>
            {isFinished && <MatchAnalysis matchData={data} />}
          </div>
        )}

        {tab === 'events' && (
          <section className="bg-gray-900/40 border border-white/5 rounded-3xl p-6 md:p-8">
            {data.events?.length > 0 ? (
              <EventTimeline events={data.events} />
            ) : (
              <p className="text-center text-gray-500 text-sm py-16">No timeline events yet.</p>
            )}
          </section>
        )}

        {tab === 'stats' && (
          <section className="bg-gray-900/40 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6 max-w-2xl">
            {homeStats.length > 0 ? (
              statTypes.map((type) => (
                <StatBar key={type} label={type} homeTotal={getStat(homeStats, type)} awayTotal={getStat(awayStats, type)} />
              ))
            ) : (
              <p className="text-center text-gray-500 text-sm py-12">Statistics not available for this match.</p>
            )}
          </section>
        )}

        {tab === 'lineups' && (
          <section className="space-y-10">
            {data.lineups?.length >= 2 ? (
              <>
                <LineupField
                  teamName={data.lineups[0].team.name}
                  formation={data.lineups[0].formation}
                  players={data.lineups[0].startXI}
                  side="home"
                />
                <div className="border-t border-white/10" />
                <LineupField
                  teamName={data.lineups[1].team.name}
                  formation={data.lineups[1].formation}
                  players={data.lineups[1].startXI}
                  side="away"
                />
              </>
            ) : (
              <p className="text-center text-gray-500 text-sm py-12">Line-ups not available.</p>
            )}
          </section>
        )}

        {tab === 'h2h' && (
          <div className="space-y-3">
            {h2h.length === 0 ? (
              <p className="text-gray-500 text-sm">No previous meetings found in the feed.</p>
            ) : (
              h2h.map((m: any) => (
                <Link
                  key={m.fixture.id}
                  href={`/match/${m.fixture.id}`}
                  className="flex items-center justify-between gap-4 bg-gray-900/50 border border-white/5 rounded-2xl px-4 py-3 hover:border-white/15 transition"
                >
                  <span className="text-[10px] text-gray-500 font-bold uppercase shrink-0 w-24">
                    {new Date(m.fixture.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
                  </span>
                  <span className="text-xs font-bold text-gray-400 truncate flex-1 text-center">
                    {m.teams.home.name} vs {m.teams.away.name}
                  </span>
                  <span className="text-sm font-black text-white tabular-nums shrink-0">
                    {m.goals.home} – {m.goals.away}
                  </span>
                </Link>
              ))
            )}
          </div>
        )}

        {tab === 'table' && (
          <div className="overflow-x-auto rounded-2xl border border-white/5">
            {!leagueBlock?.standings?.length ? (
              <p className="text-gray-500 text-sm p-8 text-center">League table not available.</p>
            ) : (
              <>
                <div className="flex items-center justify-between px-4 py-3 bg-gray-900/80 border-b border-white/5">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">League table</span>
                  <Link href={`/league/${leagueBlock.leagueId}`} className="text-xs font-bold text-blue-400 hover:underline">
                    Full league →
                  </Link>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-white/5">
                      <th className="px-3 py-2 w-10">#</th>
                      <th className="px-3 py-2">Team</th>
                      <th className="px-3 py-2 text-center">P</th>
                      <th className="px-3 py-2 text-center">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leagueBlock.standings.map((row: any) => {
                      const highlight =
                        row.team.id === homeId || row.team.id === awayId ? 'bg-white/5 text-white' : 'text-gray-300';
                      return (
                        <tr key={row.team.id} className={`border-b border-white/5 ${highlight}`}>
                          <td className="px-3 py-2 font-mono text-xs">{row.rank}</td>
                          <td className="px-3 py-2">
                            <Link href={`/team/${row.team.id}`} className="font-bold hover:text-blue-400 flex items-center gap-2">
                              {row.team.logo && <img src={row.team.logo} alt="" className="w-5 h-5 object-contain" />}
                              {row.team.name}
                            </Link>
                          </td>
                          <td className="px-3 py-2 text-center text-xs">{row.all?.played ?? '—'}</td>
                          <td className="px-3 py-2 text-center font-black">{row.points}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}

        {tab === 'tv' && (
          <div className="space-y-3 max-w-lg">
            {!data.tv?.length ? (
              <p className="text-gray-500 text-sm">No broadcast listings for this match.</p>
            ) : (
              data.tv.map((station: any, i: number) => {
                const name = station.strTV || station.strChannel || station.strName || 'Channel';
                return (
                  <div key={i} className="flex items-center gap-3 bg-gray-900/50 p-4 rounded-2xl border border-white/5">
                    <div className="w-10 h-10 bg-black/40 rounded-lg flex items-center justify-center font-black text-[10px] text-white shrink-0">
                      {String(name).slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-white">{name}</span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
