'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** After login, completes a favorite action stored in sessionStorage. */
export function PendingFavoriteResume() {
  const router = useRouter();

  useEffect(() => {
    const raw = sessionStorage.getItem('pending_favorite');
    if (!raw) return;

    (async () => {
      try {
        const pending = JSON.parse(raw);
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pending),
        });
        sessionStorage.removeItem('pending_favorite');
        if (res.ok) {
          router.refresh();
        }
      } catch {
        sessionStorage.removeItem('pending_favorite');
      }
    })();
  }, [router]);

  return null;
}
