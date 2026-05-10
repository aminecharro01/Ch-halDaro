"use client";

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, Users, MapPin, Calendar, Activity } from 'lucide-react';
import { FavoriteButton } from '@/components/FavoriteButton';
import { FormGuide } from '@/components/FormGuide';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: teamData, error: teamError } = useSWR(`/api/match/team-info?id=${id}`, fetcher);
  const { data: matchesData, error: matchesError } = useSWR(`/api/match/team-fixtures?id=${id}`, fetcher);
  const { data: squadData, error: squadError } = useSWR(`/api/match/team-squad?id=${id}`, fetcher);

  const team = teamData?.[0];
  const fixtures = matchesData || [];
  const squad = squadData?.[0]?.players || [];

  if (teamError || matchesError || squadError) return <div className="text-center p-20 text-red-500 font-bold">Failed to load team data</div>;
  if (!teamData || !squadData) return (
    <div className="max-w-6xl mx-auto p-4 space-y-8 animate-pulse">
      <div className="h-48 bg-gray-900/50 rounded-3xl border border-gray-800"></div>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 h-96 bg-gray-900/50 rounded-3xl border border-gray-800"></div>
        <div className="h-96 bg-gray-900/50 rounded-3xl border border-gray-800"></div>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-up max-w-6xl mx-auto p-4 space-y-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-green-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to feed
      </Link>

      {/* Team Header */}
      <div className="bg-gray-900/40 backdrop-blur-md shadow-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5">
          {team.team.logo && (
            <img src={team.team.logo} alt="" className="w-64 h-64 grayscale" />
          )}
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          {team.team.logo && (
            <img src={team.team.logo} alt={team.team.name} className="w-32 h-32 object-contain drop-shadow-2xl" />
          )}
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-1 uppercase">
                  {team.team.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-green-500" /> {team.team.country}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-blue-500" /> Founded {team.team.founded}</span>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-[10px] text-gray-600">Form:</span>
                    <FormGuide teamId={id} />
                  </div>
                </div>
              </div>
              <FavoriteButton itemId={id} itemType="team" itemName={team?.team?.name} itemLogo={team?.team?.logo} className="scale-125" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Results */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" /> Recent Results
            </h3>
            <div className="space-y-4">
              {fixtures.map((f: any) => (
                <div key={f.fixture.id} className="bg-gray-900/30 backdrop-blur border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:bg-gray-800/40 transition-all">
                  <div className="flex items-center gap-3 flex-1">
                    {f.teams.home.logo && (
                      <img src={f.teams.home.logo} className="w-6 h-6 object-contain" alt="" />
                    )}
                    <span className={`text-sm font-bold truncate ${f.teams.home.id === team.team.id ? 'text-green-500' : 'text-gray-300'}`}>
                      {f.teams.home.name}
                    </span>
                  </div>
                  <div className="px-4 flex flex-col items-center">
                    <span className="text-lg font-black text-white">{f.goals.home} - {f.goals.away}</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                      {new Date(f.fixture.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-1 justify-end">
                    <span className={`text-sm font-bold truncate ${f.teams.away.id === team.team.id ? 'text-green-500' : 'text-gray-300'}`}>
                      {f.teams.away.name}
                    </span>
                    {f.teams.away.logo && (
                      <img src={f.teams.away.logo} className="w-6 h-6 object-contain" alt="" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Squad */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" /> Squad
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {squad.map((player: any) => (
                <div key={player.id} className="bg-gray-900/30 backdrop-blur border border-white/5 rounded-xl p-3 text-center hover:bg-gray-800/40 transition-all">
                  {player.photo && (
                    <img src={player.photo} alt={player.name} className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-gray-800" />
                  )}
                  <div className="text-sm font-bold text-gray-100 truncate">{player.name}</div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{player.position}</div>
                  {player.number && <div className="mt-1 text-xs font-black text-blue-500">#{player.number}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" /> Season Stats
            </h3>
            <div className="bg-gray-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-6">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase">
                  <span>Avg Goals Scored</span>
                  <span>1.8</span>
                </div>
                <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full w-[70%]"></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase">
                  <span>Avg Goals Conceded</span>
                  <span>0.9</span>
                </div>
                <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full w-[40%]"></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase">
                  <span>Clean Sheets</span>
                  <span>12</span>
                </div>
                <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div className="bg-yellow-500 h-full w-[60%]"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-widest border-b border-gray-800 pb-2">Venue Details</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-medium">Stadium</span>
                <span className="text-white font-bold">{team.venue.name}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-medium">Capacity</span>
                <span className="text-white font-bold">{team.venue.capacity.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-medium">City</span>
                <span className="text-white font-bold">{team.venue.city}</span>
              </div>
              {team.venue.image && (
                <img src={team.venue.image} alt={team.venue.name} className="w-full h-32 object-cover rounded-xl mt-2 border border-gray-800 shadow-inner" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
