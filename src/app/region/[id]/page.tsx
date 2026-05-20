"use client";

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Globe, ChevronRight } from 'lucide-react';
import useSWR from 'swr';
import Image from 'next/image';
import { PageLoader } from '@/components/ui/PageLoader';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function RegionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error, isLoading } = useSWR(`/api/region/${id}`, fetcher);

  if (isLoading) return <PageLoader context="region" compact />;
  if (error || !data) return <div className="text-red-500">Error loading region data.</div>;

  const leagues = data.leagues || [];

  return (
    <div className="animate-fade-up max-w-6xl mx-auto space-y-6 sm:space-y-8 min-w-0">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-green-400 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to feed
      </Link>

      <div className="glass-card rounded-3xl p-6 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 p-6 sm:p-10 opacity-5 pointer-events-none">
          <Globe className="w-32 h-32 sm:w-48 sm:h-48" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white mb-2 capitalize relative z-10">{id.replace('-', ' ')}</h1>
        <p className="text-gray-400 relative z-10 text-sm sm:text-base">Explore the top competitions and regional fixtures.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {leagues.length === 0 ? (
          <p className="text-gray-500 col-span-full">No leagues configured for this region.</p>
        ) : (
          leagues.map((item: { league: { id: number; name: string; logo?: string; country?: string } }) => (
            <Link
              key={item.league.id}
              href={`/league/${item.league.id}`}
              className="group glass-card rounded-2xl p-5 sm:p-6 hover:border-green-500/30 transition-all"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="bg-white/5 p-3 rounded-xl w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
                  {item.league.logo ? (
                    <Image src={item.league.logo} width={48} height={48} className="w-10 h-10 sm:w-12 sm:h-12 object-contain" alt="" />
                  ) : (
                    <Globe className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white group-hover:text-green-400 transition-colors truncate">
                    {item.league.name}
                  </h3>
                  <span className="text-xs text-gray-500 font-medium">
                    {item.league.country || 'International'}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:translate-x-1 transition-transform shrink-0" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
