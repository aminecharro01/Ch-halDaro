"use client";
import useSWR from 'swr';
import { use, useState } from 'react';
import { pickCurrentSeason } from '@/lib/season';
import { getMatchStatusDisplay } from '@/lib/match-status';
import Image from 'next/image';
import Link from 'next/link';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { ExpandableDescription } from '@/components/ui/ExpandableDescription';
import { PageLoader } from '@/components/ui/PageLoader';
import { 
  Trophy, 
  Users, 
  Calendar, 
  Activity, 
  Globe, 
  ExternalLink, 
  Info, 
  ChevronRight,
  TrendingUp,
  Award,
  History,
  MapPin
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function LeaguePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [season, setSeason] = useState<string | null>(null);
  const seasonQuery = season ? `?season=${encodeURIComponent(season)}` : '';
  const { data, error, isLoading } = useSWR(`/api/league/${id}${seasonQuery}`, fetcher);

  const seasons: string[] = data?.seasons?.length ? data.seasons : [];
  const activeSeason = season || data?.league?.season || pickCurrentSeason(seasons);

  if (isLoading) return <PageLoader context="league" />;
  
  if (error || !data) return <div className="text-red-500 py-20 text-center font-bold">Error loading league data.</div>;

  const { league, standings, topScorers, topAssists, lastFixtures, nextFixtures } = data;
  const isGrouped = Array.isArray(standings[0]);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-12 animate-fade-up pb-20">
      
      {/* Hero Section */}
      <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-gray-950">
        {/* Banner Background */}
        <div className="absolute inset-0 z-0">
          {league?.banner ? (
            <>
              <img src={league.banner} alt="" className="w-full h-full object-cover opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent"></div>
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-900/20 to-gray-950"></div>
          )}
        </div>

        <div className="relative z-10 p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="relative group">
              <div className="absolute -inset-4 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
              {league?.logo && (
                <img 
                  src={league.logo} 
                  alt={league.name} 
                  className="w-40 h-40 md:w-48 md:h-48 object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-transform duration-500 hover:scale-105" 
                />
              )}
            </div>

            <div className="flex-1 text-center md:text-left space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-center md:justify-start gap-4">
                   <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-tight">
                    {league?.name}
                  </h1>
                  <FavoriteButton itemId={id} itemType="league" itemName={league?.name} itemLogo={league?.logo} className="scale-150" />
                </div>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-500" /> {league?.country}</span>
                  {seasons.length > 0 ? (
                    <label className="flex items-center gap-2 text-green-500">
                      <TrendingUp className="w-4 h-4 shrink-0" />
                      <select
                        value={activeSeason}
                        onChange={(e) => setSeason(e.target.value)}
                        className="bg-transparent border border-green-500/30 rounded-lg px-2 py-1 text-xs font-bold text-green-400 uppercase tracking-wider"
                      >
                        {seasons.map((s) => (
                          <option key={s} value={s} className="bg-gray-900">
                            {s}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <span className="flex items-center gap-2 text-green-500">
                      <TrendingUp className="w-4 h-4" /> Season {activeSeason}
                    </span>
                  )}
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center justify-center md:justify-start gap-4">
                {league?.social?.website && (
                  <a href={`https://${league.social.website}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 border border-white/5 transition-all text-white">
                    <Globe className="w-5 h-5" />
                  </a>
                )}
                {['facebook', 'twitter', 'instagram'].map(platform => (
                  league?.social?.[platform] && (
                    <a key={platform} href={`https://${league.social[platform]}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 border border-white/5 transition-all text-white">
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )
                ))}
              </div>
            </div>

            {/* Trophy Display */}
            {league?.trophy && (
              <div className="hidden xl:block relative group">
                <div className="absolute inset-0 bg-yellow-500/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-all"></div>
                <img src={league.trophy} alt="League Trophy" className="relative h-56 object-contain drop-shadow-2xl transition-transform duration-500 group-hover:-rotate-6" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* About Section */}
          {league?.description && (
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight uppercase">
                <Info className="w-6 h-6 text-blue-500" /> Competition Profile
              </h3>
              <div className="bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-[2rem] p-8 shadow-xl">
                <ExpandableDescription text={league.description} title="" />
              </div>
            </div>
          )}

          {/* Standings */}
          <section className="space-y-6">
            <h3 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight uppercase">
              <Trophy className="w-6 h-6 text-yellow-500" /> Current Standings
            </h3>
            
            <div className="grid gap-8">
              {(isGrouped ? standings : [standings]).map((group: any, gIdx: number) => (
                <div key={gIdx} className="bg-gray-900/30 backdrop-blur border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
                  {isGrouped && (
                    <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                      <h4 className="font-black text-blue-400 uppercase tracking-[0.2em] text-xs">
                        {group[0]?.group || `Group ${gIdx + 1}`}
                      </h4>
                      <Award className="w-4 h-4 text-blue-500/50" />
                    </div>
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="text-[10px] text-gray-500 uppercase tracking-widest bg-black/20">
                        <tr>
                          <th className="px-6 py-4 text-center">Pos</th>
                          <th className="px-6 py-4">Club</th>
                          <th className="px-4 py-4 text-center">P</th>
                          <th className="px-4 py-4 text-center">GD</th>
                          <th className="px-6 py-4 text-center font-black text-white">Pts</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {group.map((row: any) => (
                          <tr key={row.team.id} className="group hover:bg-white/5 transition-all">
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-black text-xs ${row.rank <= 4 ? 'bg-blue-500/20 text-blue-400' : 'text-gray-500'}`}>
                                {row.rank}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <Link href={`/team/${row.team.id}`} className="flex items-center gap-3 group/link">
                                {row.team.logo && (
                                  <img src={row.team.logo} className="w-7 h-7 object-contain transition-transform group-hover/link:scale-110" alt="" />
                                )}
                                <span className="font-black text-gray-200 text-sm tracking-tight group-hover/link:text-white transition-colors">{row.team.name}</span>
                              </Link>
                            </td>
                            <td className="px-4 py-4 text-center font-bold text-gray-400 text-xs">{row.all.played}</td>
                            <td className="px-4 py-4 text-center font-bold text-xs">
                              <span className={row.goalsDiff >= 0 ? 'text-green-500' : 'text-red-400'}>
                                {row.goalsDiff > 0 ? '+' : ''}{row.goalsDiff}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="font-black text-white text-sm">{row.points}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Results */}
          <section className="space-y-6">
            <h3 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight uppercase">
              <History className="w-6 h-6 text-green-500" /> Recent Results
            </h3>
            <div className="grid gap-4">
              {lastFixtures.slice(0, 10).map((f: any) => (
                <div key={f.fixture.id} className="group bg-gray-900/30 backdrop-blur border border-white/5 rounded-[1.5rem] p-5 hover:bg-gray-800/40 hover:border-white/10 transition-all duration-300">
                  <Link href={`/match/${f.fixture.id}`} className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 flex-1">
                      <img src={f.teams.home.logo} className="w-8 h-8 object-contain" alt="" />
                      <span className="text-sm font-black text-gray-300 group-hover:text-white transition-colors">{f.teams.home.name}</span>
                    </div>
                    <div className="px-8 flex flex-col items-center">
                      <div className="text-2xl font-black text-white tracking-tighter tabular-nums">
                        {f.goals.home} - {f.goals.away}
                      </div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                        {getMatchStatusDisplay(f).label}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-1 justify-end text-right">
                      <span className="text-sm font-black text-gray-300 group-hover:text-white transition-colors">{f.teams.away.name}</span>
                      <img src={f.teams.away.logo} className="w-8 h-8 object-contain" alt="" />
                    </div>
                  </Link>
                  {f.video && (
                    <a 
                      href={f.video} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 rounded-xl flex items-center justify-center gap-2 text-xs font-black text-red-400 uppercase tracking-widest transition-all"
                    >
                      <Activity className="w-4 h-4 animate-pulse" /> Watch Highlights
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Participating Teams */}
          {data.teams && data.teams.length > 0 && (
            <section className="space-y-6">
              <h3 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight uppercase">
                <Users className="w-6 h-6 text-blue-500" /> Participating Clubs
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {data.teams.map((team: any) => (
                  <Link 
                    href={`/team/${team.id}`} 
                    key={team.id}
                    className="bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 hover:bg-gray-800/60 hover:border-blue-500/30 transition-all group shadow-lg"
                  >
                    <div className="relative">
                      <div className="absolute -inset-2 bg-blue-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all"></div>
                      <img src={team.logo} className="relative w-16 h-16 object-contain drop-shadow-xl transition-transform group-hover:scale-110" alt={team.name} />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center group-hover:text-white transition-colors line-clamp-1">
                      {team.name}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-12">
          
          {/* Upcoming Matches */}
          {nextFixtures.length > 0 && (
            <section className="space-y-6">
              <h3 className="text-xl font-black text-white flex items-center gap-3 tracking-tight uppercase">
                <Calendar className="w-5 h-5 text-indigo-500" /> UPCOMING
              </h3>
              <div className="space-y-3">
                {nextFixtures.slice(0, 5).map((f: any) => (
                  <Link href={`/match/${f.fixture.id}`} key={f.fixture.id} className="block bg-gray-900/40 p-4 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all group">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                        {new Date(f.fixture.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                      <span className="text-[10px] font-black text-gray-500">
                        {new Date(f.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-gray-200 truncate max-w-[80px]">{f.teams.home.name}</span>
                      <span className="text-[10px] font-black text-gray-600 px-2">VS</span>
                      <span className="text-xs font-black text-gray-200 truncate max-w-[80px] text-right">{f.teams.away.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Top Scorers */}
          <section className="space-y-6">
            <h3 className="text-xl font-black text-white flex items-center gap-3 tracking-tight uppercase">
              <Award className="w-5 h-5 text-green-500" /> Golden Boot
            </h3>
            <div className="space-y-3">
              {topScorers.slice(0, 5).map((s: any, idx: number) => (
                <div key={s.player.id} className="flex items-center gap-4 bg-gray-900/50 p-4 rounded-2xl border border-white/5 group hover:bg-gray-800/80 transition-all">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-green-500/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-all"></div>
                    {s.player.photo && (
                      <img src={s.player.photo} className="relative w-12 h-12 rounded-full object-cover border-2 border-gray-800 group-hover:border-green-500/30 transition-all" alt="" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-black text-gray-200 truncate">{s.player.name}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <img src={s.statistics[0].team.logo} className="w-3 h-3 object-contain" alt="" />
                      <span className="text-[10px] text-gray-500 font-bold uppercase truncate">{s.statistics[0].team.name}</span>
                    </div>
                  </div>
                  <div className="text-lg font-black text-white tabular-nums">{s.statistics[0].goals.total}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Top Assists */}
          <section className="space-y-6">
            <h3 className="text-xl font-black text-white flex items-center gap-3 tracking-tight uppercase">
              <Users className="w-5 h-5 text-blue-500" /> Top Assists
            </h3>
            <div className="space-y-3">
              {topAssists.slice(0, 5).map((s: any) => (
                <div key={s.player.id} className="flex items-center gap-4 bg-gray-900/50 p-4 rounded-2xl border border-white/5 group hover:bg-gray-800/80 transition-all">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-blue-500/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-all"></div>
                    {s.player.photo && (
                      <img src={s.player.photo} className="relative w-12 h-12 rounded-full object-cover border-2 border-gray-800 group-hover:border-blue-500/30 transition-all" alt="" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-black text-gray-200 truncate">{s.player.name}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <img src={s.statistics[0].team.logo} className="w-3 h-3 object-contain" alt="" />
                      <span className="text-[10px] text-gray-500 font-bold uppercase truncate">{s.statistics[0].team.name}</span>
                    </div>
                  </div>
                  <div className="text-lg font-black text-white tabular-nums">{s.statistics[0].goals.assists || 0}</div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
