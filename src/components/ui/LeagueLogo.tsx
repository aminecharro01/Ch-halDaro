'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Trophy } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function LeagueLogo({
  leagueId,
  name,
  className = 'w-5 h-5 object-contain',
}: {
  leagueId: string;
  name: string;
  className?: string;
}) {
  const { data } = useSWR(`/api/league/${leagueId}`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 86400000,
  });
  const [imgError, setImgError] = useState(false);

  const src = data?.league?.logo;

  if (!src || imgError) {
    return <Trophy className={`${className} text-indigo-400 opacity-70`} aria-hidden />;
  }

  return (
    <img
      src={src}
      alt={name}
      className={className}
      onError={() => setImgError(true)}
    />
  );
}
