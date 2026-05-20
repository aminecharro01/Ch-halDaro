'use client';

import { use } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, User } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error, isLoading } = useSWR(`/api/player/${id}`, fetcher);

  if (isLoading) {
    return <div className="py-20 text-center text-gray-500 animate-pulse">Loading player…</div>;
  }

  if (error || !data?.player) {
    return <div className="py-20 text-center text-red-400">Player not found.</div>;
  }

  const p = data.player;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-up">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-white">
        <ArrowLeft className="w-4 h-4" /> Home
      </Link>

      <div className="flex flex-col md:flex-row items-center gap-8 bg-gray-900/40 border border-white/10 rounded-3xl p-8">
        {p.strCutout || p.strThumb ? (
          <Image
            src={p.strCutout || p.strThumb}
            alt={p.strPlayer}
            width={160}
            height={160}
            className="object-contain"
          />
        ) : (
          <div className="w-40 h-40 rounded-full bg-gray-800 flex items-center justify-center">
            <User className="w-16 h-16 text-gray-600" />
          </div>
        )}
        <div className="text-center md:text-left space-y-2">
          <h1 className="text-3xl font-black text-white">{p.strPlayer}</h1>
          <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">
            {p.strPosition} {p.strNumber ? `· #${p.strNumber}` : ''}
          </p>
          {p.strTeam && (
            <p className="text-green-400 font-bold">{p.strTeam}</p>
          )}
          {p.strNationality && (
            <p className="text-sm text-gray-500">{p.strNationality}</p>
          )}
        </div>
      </div>

      {p.strDescriptionEN && (
        <div className="prose prose-invert prose-sm max-w-none bg-gray-900/30 border border-white/5 rounded-2xl p-6">
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{p.strDescriptionEN}</p>
        </div>
      )}
    </div>
  );
}
