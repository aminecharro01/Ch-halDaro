"use client";
import { useState } from 'react';
import useSWR from 'swr';
import { usePathname, useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (res.status === 401) return { unauthorized: true, items: [] };
  if (!res.ok) throw new Error('Failed to load favorites');
  const data = await res.json();
  return { unauthorized: false, items: Array.isArray(data) ? data : [] };
};

interface FavoriteButtonProps {
  itemId: string | number;
  itemType: 'team' | 'league' | 'match';
  itemName?: string;
  itemLogo?: string;
  className?: string;
}

export function FavoriteButton({ itemId, itemType, itemName, itemLogo, className = '' }: FavoriteButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data, mutate } = useSWR('/api/favorites', fetcher, { shouldRetryOnError: false });
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const idStr = itemId.toString();
  const isLoggedIn = data && !data.unauthorized;
  const favorites = data?.items ?? [];
  const isFavorited =
    isLoggedIn && favorites.some((f: { item_id: string; item_type: string }) => f.item_id === idStr && f.item_type === itemType);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUpdating) return;

    if (!isLoggedIn) {
      const pending = { itemId: idStr, itemType, itemName, itemLogo };
      sessionStorage.setItem('pending_favorite', JSON.stringify(pending));
      const next = encodeURIComponent(pathname || '/');
      router.push(`/login?next=${next}`);
      return;
    }

    setIsUpdating(true);
    setError(null);
    const method = isFavorited ? 'DELETE' : 'POST';

    try {
      const res = await fetch('/api/favorites', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: idStr, itemType, itemName, itemLogo }),
      });

      if (res.status === 401) {
        sessionStorage.setItem(
          'pending_favorite',
          JSON.stringify({ itemId: idStr, itemType, itemName, itemLogo })
        );
        router.push(`/login?next=${encodeURIComponent(pathname || '/')}`);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to ${method === 'POST' ? 'add' : 'remove'} favorite`);
      }

      await mutate();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update favorite';
      console.error('Failed to toggle favorite', err);
      setError(message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={toggleFavorite}
        disabled={isUpdating}
        className={`p-2 rounded-full transition-all hover:scale-110 active:scale-95 ${
          isFavorited
            ? 'bg-red-500/20 text-red-500 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
            : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:bg-gray-700'
        } ${className} ${isUpdating ? 'opacity-50 cursor-wait' : ''}`}
        aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
      </button>
      {error && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-red-900 text-red-200 text-xs rounded-lg whitespace-nowrap shadow-lg border border-red-700 z-50">
          {error}
        </div>
      )}
    </div>
  );
}
