"use client";

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, Users, MapPin, Calendar, Activity, Globe, Info, Shirt, ExternalLink } from "lucide-react";
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { FormGuide } from '@/components/team/FormGuide';
import { ExpandableDescription } from '@/components/ui/ExpandableDescription';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: teamData, error: teamError } = useSWR(`/api/match/team-info?id=${id}`, fetcher);
  const { data: resultsData, error: resultsError } = useSWR(`/api/match/team-results?id=${id}`, fetcher);
  const { data: squadData, error: squadError } = useSWR(`/api/match/team-squad?id=${id}`, fetcher);

  const team = teamData?.[0]?.team;
  const recentResults = Array.isArray(resultsData) ? resultsData : [];
  const squad = squadData?.[0]?.players || [];

  const { data: leagueData } = useSWR(
    team?.leagueId ? `/api/league/${team.leagueId}?season=2025-2026` : null,
    fetcher
  );
  const teamStanding = leagueData?.standings?.find((s: any) => s.team.id === parseInt(id));

  if (teamError || resultsError || squadError) return <div className="text-center p-20 text-red-500 font-bold">Failed to load team data</div>;
  if (!teamData || !squadData || !team) return (
    <div className="max-w-6xl mx-auto p-4 space-y-8 animate-pulse">
      <div className="h-64 bg-gray-900/50 rounded-3xl border border-gray-800"></div>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 h-96 bg-gray-900/50 rounded-3xl border border-gray-800"></div>
        <div className="h-96 bg-gray-900/50 rounded-3xl border border-gray-800"></div>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-up max-w-7xl mx-auto p-4 space-y-8 pb-20">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-green-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to feed
      </Link>

      {/* Hero Header */}
      <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-gray-950">
        {/* Banner Background */}
        <div className="absolute inset-0 z-0">
          {team.banner ? (
            <>
              <img src={team.banner} alt="" className="w-full h-full object-cover opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent"></div>
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-900/20 to-gray-950"></div>
          )}
        </div>

        <div className="relative z-10 p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="relative group">
              <div className="absolute -inset-4 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all"></div>
              {team.logo && (
                <img 
                  src={team.logo} 
                  alt={team.name} 
                  className="w-40 h-40 md:w-56 md:h-56 object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-transform duration-500 hover:scale-105" 
                />
              )}
            </div>

            <div className="flex-1 text-center md:text-left space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none">
                    {team.name}
                  </h1>
                  <FavoriteButton itemId={id} itemType="team" itemName={team?.name} itemLogo={team?.logo} className="scale-150" />
                </div>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-green-500" /> {team.country}</span>
                  <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-500" /> Est. {team.founded}</span>
                  <div className="flex items-center gap-3 bg-white/5 px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/5">
                    <span className="text-[10px] text-gray-500">Form:</span>
                    <FormGuide teamId={id} />
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center justify-center md:justify-start gap-4">
                {team.social?.website && (
                  <a href={`https://${team.social.website}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 border border-white/5 transition-all text-white">
                    <Globe className="w-5 h-5" />
                  </a>
                )}
                {team.social?.facebook && (
                  <a href={`https://${team.social.facebook}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 border border-white/5 transition-all text-white">
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
                {team.social?.twitter && (
                  <a href={`https://${team.social.twitter}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 border border-white/5 transition-all text-white">
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
                {team.social?.instagram && (
                  <a href={`https://${team.social.instagram}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 border border-white/5 transition-all text-white">
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* About Section */}
          {team.description && (
            <div className="space-y-6 animate-fade-up">
              <h3 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
                <Info className="w-6 h-6 text-indigo-500" /> CLUB PROFILE
              </h3>
              <div className="bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-[2rem] p-8">
                <ExpandableDescription text={team.description} title="" />
              </div>
            </div>
          )}

          {/* Recent Results */}
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
              <Activity className="w-6 h-6 text-green-500" /> RECENT RESULTS
            </h3>
            <div className="grid gap-4">
              {recentResults.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No finished matches for 2025-2026 yet.</p>
              ) : (
                recentResults.slice(0, 5).map((f: any) => (
                <div key={f.fixture.id} className="group bg-gray-900/30 backdrop-blur border border-white/5 rounded-[1.5rem] p-5 flex items-center justify-between hover:bg-gray-800/40 hover:border-white/10 transition-all duration-300">
                  <div className="flex items-center gap-4 flex-1">
                    <img src={f.teams.home.logo} className="w-8 h-8 object-contain" alt="" />
                    <span className={`text-sm font-black tracking-tight ${f.teams.home.id === parseInt(id) ? 'text-white underline decoration-green-500 decoration-2 underline-offset-4' : 'text-gray-400'}`}>
                      {f.teams.home.name}
                    </span>
                  </div>
                  <div className="px-8 flex flex-col items-center">
                    <div className="text-2xl font-black text-white tracking-tighter tabular-nums">
                      {f.goals.home} - {f.goals.away}
                    </div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                      {new Date(f.fixture.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-1 justify-end text-right">
                    <span className={`text-sm font-black tracking-tight ${f.teams.away.id === parseInt(id) ? 'text-white underline decoration-green-500 decoration-2 underline-offset-4' : 'text-gray-400'}`}>
                      {f.teams.away.name}
                    </span>
                    <img src={f.teams.away.logo} className="w-8 h-8 object-contain" alt="" />
                  </div>
                </div>
              ))
              )}
            </div>
          </div>

          {/* Squad */}
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
              <Users className="w-6 h-6 text-blue-500" /> THE SQUAD
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {squad.map((player: any) => (
                <div key={player.id} className="group bg-gray-900/30 backdrop-blur border border-white/5 rounded-2xl p-4 text-center hover:bg-gray-800/40 hover:border-white/10 transition-all duration-300">
                  <div className="relative w-20 h-20 mx-auto mb-3">
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl group-hover:bg-indigo-500/40 transition-all"></div>
                    {player.photo ? (
                      <img src={player.photo} alt={player.name} className="relative w-full h-full rounded-full object-cover border-2 border-gray-800 group-hover:border-indigo-500/50 transition-all" />
                    ) : (
                      <div className="relative w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                        <Users className="w-8 h-8 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-black text-white truncate mb-0.5">{player.name}</div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{player.position}</div>
                  {player.number && (
                    <div className="mt-2 inline-block px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 text-[10px] font-black">
                      #{player.number}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Season Standing */}
          <div className="space-y-6">
            <h3 className="text-xl font-black text-white flex items-center gap-3 tracking-tight">
              <Trophy className="w-5 h-5 text-yellow-500" /> 2025-2026 SEASON
            </h3>
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-950 border border-white/10 rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
               {/* Decorative Trophy Icon */}
               <Trophy className="absolute -bottom-4 -right-4 w-24 h-24 text-white/5 -rotate-12" />
               
               {teamStanding ? (
                 <div className="relative z-10 space-y-6">
                    <div className="flex items-end justify-between">
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Current Rank</div>
                        <div className="text-6xl font-black text-white tracking-tighter tabular-nums leading-none">
                          #{teamStanding.rank}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Points</div>
                        <div className="text-3xl font-black text-green-500 tracking-tighter tabular-nums leading-none">
                          {teamStanding.points}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 py-4 border-y border-white/5">
                      <div className="text-center">
                        <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">P</div>
                        <div className="font-black text-white text-sm">{teamStanding.all.played}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] font-bold text-gray-500 uppercase mb-1 text-green-500">W</div>
                        <div className="font-black text-white text-sm">{teamStanding.all.win}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] font-bold text-gray-500 uppercase mb-1 text-gray-400">D</div>
                        <div className="font-black text-white text-sm">{teamStanding.all.draw}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] font-bold text-gray-500 uppercase mb-1 text-red-500">L</div>
                        <div className="font-black text-white text-sm">{teamStanding.all.loss}</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center bg-white/5 rounded-xl p-3">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Goal Difference</span>
                      <span className={`text-sm font-black ${teamStanding.goalsDiff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {teamStanding.goalsDiff > 0 ? '+' : ''}{teamStanding.goalsDiff}
                      </span>
                    </div>
                 </div>
               ) : (
                 <div className="text-center py-10 space-y-4">
                   <Activity className="w-10 h-10 text-gray-700 mx-auto animate-pulse" />
                   <p className="text-xs font-bold text-gray-600 uppercase tracking-[0.2em]">Data Synchronizing...</p>
                 </div>
               )}
            </div>
          </div>

          {/* Venue Section */}
          <div className="bg-gray-900/40 backdrop-blur-md border border-white/10 rounded-[2rem] p-6 space-y-6 shadow-lg">
            <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-500" /> THE FORTRESS
            </h4>
            <div className="space-y-4">
               {team.venue.image && (
                <div className="relative group overflow-hidden rounded-2xl">
                  <img 
                    src={team.venue.image} 
                    alt={team.venue.name} 
                    className="w-full h-44 object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 to-transparent opacity-60"></div>
                  <div className="absolute bottom-3 left-3">
                    <div className="text-xs font-black text-white uppercase tracking-tight">{team.venue.name}</div>
                  </div>
                </div>
              )}
              
              <div className="grid gap-3">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Capacity</span>
                  <span className="text-xs font-black text-white">{team.venue.capacity?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">City</span>
                  <span className="text-xs font-black text-white">{team.venue.city || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Jersey / Equipment */}
          {team.equipment && (
            <div className="bg-gray-900/40 backdrop-blur-md border border-white/10 rounded-[2rem] p-6 space-y-4 shadow-lg text-center">
              <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center justify-center gap-2 mb-4">
                <Shirt className="w-4 h-4 text-blue-400" /> OFFICIAL COLORS
              </h4>
              <div className="relative group">
                <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
                <img src={team.equipment} alt="Team Jersey" className="relative h-48 mx-auto object-contain drop-shadow-2xl transition-transform duration-500 group-hover:rotate-12" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
