'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const LIMIT = 320;

export function ExpandableDescription({ text, title = 'Description' }: { text?: string | null; title?: string }) {
  const [expanded, setExpanded] = useState(false);

  if (!text?.trim()) {
    return <p className="text-sm text-gray-500">No description available.</p>;
  }

  const needsToggle = text.length > LIMIT;
  const display = expanded || !needsToggle ? text : `${text.slice(0, LIMIT).trim()}…`;

  return (
    <div className="space-y-2">
      {title ? (
        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{title}</h3>
      ) : null}
      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{display}</p>
      {needsToggle ? (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="inline-flex items-center gap-1 text-xs font-bold text-green-400 hover:text-green-300"
        >
          {expanded ? (
            <>
              Show less <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              Read more <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      ) : null}
    </div>
  );
}
