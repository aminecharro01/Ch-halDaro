'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { Tv, ArrowLeft } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function TVPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [country, setCountry] = useState('');

  const query = country
    ? `/api/tv?country=${encodeURIComponent(country)}`
    : `/api/tv?date=${date}`;

  const { data, isLoading, error } = useSWR(query, fetcher);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-up">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-white">
        <ArrowLeft className="w-4 h-4" /> Home
      </Link>

      <div className="flex items-center gap-3">
        <Tv className="w-8 h-8 text-green-400" />
        <h1 className="text-3xl font-black text-white">TV Guide</h1>
      </div>

      <div className="flex flex-wrap gap-4">
        <input
          type="date"
          value={date}
          onChange={(e) => {
            setCountry('');
            setDate(e.target.value);
          }}
          className="bg-gray-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
        />
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="bg-gray-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
        >
          <option value="">All countries (by date)</option>
          <option value="Morocco">Morocco</option>
          <option value="France">France</option>
          <option value="England">England</option>
          <option value="Spain">Spain</option>
        </select>
      </div>

      {isLoading && <p className="text-gray-500 animate-pulse">Loading listings…</p>}
      {error && <p className="text-red-400">Failed to load TV data.</p>}

      <ul className="space-y-3">
        {(data?.listings || []).map((item: Record<string, string>, i: number) => (
          <li
            key={i}
            className="bg-gray-900/50 border border-white/5 rounded-2xl p-4 flex flex-wrap justify-between gap-2"
          >
            <div>
              <p className="font-bold text-white">{item.strEvent || item.strMatch || 'Match'}</p>
              <p className="text-xs text-gray-500">{item.strTime || item.strTimeLocal || ''}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-green-400">{item.strChannel || item.strTV || '—'}</p>
              <p className="text-[10px] text-gray-500 uppercase">{item.strCountry || ''}</p>
            </div>
          </li>
        ))}
      </ul>

      {!isLoading && !data?.listings?.length && (
        <p className="text-gray-500 text-center py-12">No broadcasts listed for this selection.</p>
      )}
    </div>
  );
}
