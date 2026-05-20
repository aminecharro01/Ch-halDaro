'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

type SearchResult = { id: string; name: string; logo?: string; photo?: string; type: string };

type SearchResponse = { teams: SearchResult[]; leagues: SearchResult[]; players: SearchResult[] };

export function SearchBar() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const fetchResults = useCallback(async (query: string) => {
    if (query.length < 2) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Search failed');
        setResults({ teams: [], leagues: [], players: [] });
      } else {
        setResults(data);
      }
      setOpen(true);
    } catch {
      setError('Network error');
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (q.length < 2) {
      setResults(null);
      setOpen(false);
      setError(null);
      return;
    }
    const t = setTimeout(() => void fetchResults(q), 300);
    return () => clearTimeout(t);
  }, [q, fetchResults]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const href = (item: SearchResult) => {
    if (item.type === 'team') return `/team/${item.id}`;
    if (item.type === 'league') return `/league/${item.id}`;
    return `/player/${item.id}`;
  };

  const displayResults = q.length >= 2 ? results : null;
  const hasResults =
    displayResults &&
    (displayResults.teams.length > 0 ||
      displayResults.leagues.length > 0 ||
      displayResults.players.length > 0);

  return (
    <div ref={ref} className="relative w-full max-w-[14rem] sm:max-w-xs md:max-w-sm lg:w-64">
      {loading ? (
        <LoadingSpinner size="sm" className="absolute left-3 top-1/2 -translate-y-1/2" />
      ) : (
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
      )}
      <input
        type="search"
        placeholder="Search teams, leagues…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => q.length >= 2 && results && setOpen(true)}
        className="w-full pl-9 pr-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-green-500/50"
      />
      {open && q.length >= 2 && (
        <div className="absolute top-full mt-2 w-72 sm:w-80 bg-gray-950 border border-white/10 rounded-2xl shadow-xl z-[100] max-h-80 overflow-y-auto right-0 md:right-auto md:left-0">
          {error && <p className="p-3 text-xs text-red-400">{error}</p>}
          {!loading && !hasResults && !error && (
            <p className="p-4 text-sm text-gray-500 text-center">No results for &quot;{q}&quot;</p>
          )}
          {hasResults && displayResults && (
            <>
              {(['teams', 'leagues', 'players'] as const).map((group) => {
                const items = displayResults[group] || [];
                if (!items.length) return null;
                const label =
                  group === 'teams' ? 'Teams' : group === 'leagues' ? 'Leagues' : 'Players';
                return (
                  <div key={group} className="p-2">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2 py-1">
                      {label}
                    </p>
                    {items.map((item) => (
                      <Link
                        key={`${group}-${item.id}`}
                        href={href(item)}
                        onClick={() => {
                          setOpen(false);
                          setQ('');
                          setResults(null);
                        }}
                        className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/5 text-sm text-white"
                      >
                        {(item.logo || item.photo) && (
                          <img
                            src={item.logo || item.photo}
                            alt=""
                            className="w-6 h-6 object-contain shrink-0"
                          />
                        )}
                        <span className="truncate">{item.name}</span>
                      </Link>
                    ))}
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
