"use client";

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Globe, ChevronRight } from 'lucide-react';
import useSWR from 'swr';
import Image from 'next/image';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function RegionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error, isLoading } = useSWR(`/api/region/${id}`, fetcher);

  if (isLoading) return <div className="animate-pulse h-64 bg-gray-900/50 rounded-3xl p-12"></div>;
  if (error || !data) return <div className="text-red-500">Error loading region data.</div>;

  const leagues = data.leagues || [];

  return (
    <div className="animate-fade-up max-w-6xl mx-auto p-4 space-y-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-green-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to feed
      </Link>

      <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-md shadow-xl border border-white/60 dark:border-white/10 rounded-3xl p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 p-10 opacity-5">
          <Globe className="w-48 h-48" />
        </div>
        <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-2 capitalize relative z-10">{id.replace('-', ' ')}</h1>
        <p className="text-slate-500 dark:text-gray-400 relative z-10">Explore the top competitions and regional fixtures.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leagues.length === 0 ? (
          <p className="text-gray-500 col-span-full">No leagues configured for this region.</p>
        ) : (
          leagues.map((item: { league: { id: number; name: string; logo?: string; country?: string } }) => (
            <Link
              key={item.league.id}
              href={`/league/${item.league.id}`}
              className="group bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border border-white/60 dark:border-white/10 rounded-2xl p-6 hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white dark:bg-black/20 p-3 rounded-xl shadow-inner w-16 h-16 flex items-center justify-center">
                  {item.league.logo ? (
                    <Image src={item.league.logo} width={48} height={48} className="w-12 h-12 object-contain" alt="" />
                  ) : (
                    <Globe className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-green-600 transition-colors truncate">
                    {item.league.name}
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-gray-500 font-medium">
                    {item.league.country || 'International'}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform shrink-0" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
