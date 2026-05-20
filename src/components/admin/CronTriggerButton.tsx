'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function CronTriggerButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function runCron() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/cron', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setResult(`Error: ${data.error || res.statusText}`);
      } else {
        setResult(JSON.stringify(data, null, 2));
      }
    } catch (e) {
      setResult(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={runCron}
        disabled={loading}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold text-sm transition-colors"
      >
        {loading ? <LoadingSpinner size="sm" /> : <Play className="w-4 h-4" />}
        Run notify cron now
      </button>
      {result && (
        <pre className="text-xs bg-black/40 border border-white/10 rounded-xl p-4 text-gray-300 overflow-x-auto whitespace-pre-wrap">
          {result}
        </pre>
      )}
    </div>
  );
}
