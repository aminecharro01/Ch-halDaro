"use client";
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Heart } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface FavoriteButtonProps {
  itemId: string | number;
  itemType: 'team' | 'league' | 'match';
  itemName?: string;
  itemLogo?: string;
  className?: string;
}

export function FavoriteButton({ itemId, itemType, itemName, itemLogo, className = "" }: FavoriteButtonProps) {
  const { data: favorites, mutate } = useSWR('/api/favorites', fetcher);
  const [isUpdating, setIsUpdating] = useState(false);

  const idStr = itemId.toString();
  const isFavorited = Array.isArray(favorites) && favorites.some(
    (f: any) => f.item_id === idStr && f.item_type === itemType
  );

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUpdating) return;

    setIsUpdating(true);
    const method = isFavorited ? 'DELETE' : 'POST';

    try {
      const res = await fetch('/api/favorites', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: idStr, itemType, itemName, itemLogo }),
      });

      if (res.ok) {
        mutate();
      }
    } catch (err) {
      console.error("Failed to toggle favorite", err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={isUpdating}
      className={`p-2 rounded-full transition-all hover:scale-110 active:scale-95 ${
        isFavorited 
          ? 'bg-red-500/20 text-red-500 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
          : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:bg-gray-700'
      } ${className} ${isUpdating ? 'opacity-50 cursor-wait' : ''}`}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
    </button>
  );
}
