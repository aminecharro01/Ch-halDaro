'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { pickLoadingMessage, type LoadingContext } from '@/lib/loading-messages';

type ChhalDaroLoaderProps = {
  message?: string;
  context?: LoadingContext;
  compact?: boolean;
};

export function ChhalDaroLoader({ message, context, compact = false }: ChhalDaroLoaderProps) {
  const [displayMessage, setDisplayMessage] = useState<string | undefined>(message);

  useEffect(() => {
    if (message) {
      setDisplayMessage(message);
      return;
    }
    if (context) {
      setDisplayMessage(pickLoadingMessage(context));
    }
  }, [message, context]);

  const ballVariants = {
    bounce: {
      y: [0, -60, 0],
      scaleY: [1, 0.85, 1.05, 1],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
  };

  const shadowVariants = {
    bounce: {
      scale: [1, 0.4, 1],
      opacity: [0.6, 0.2, 0.6],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
  };

  return (
    <div
      className={`flex flex-col items-center justify-center overflow-hidden select-none animate-fade-up ${
        compact ? 'py-12' : 'py-20 min-h-[50vh]'
      }`}
      role="status"
      aria-label={displayMessage || 'Loading'}
    >
      <div className="relative mb-10 text-center drop-shadow-[0_10px_10px_rgba(0,0,0,0.25)]">
        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase select-none">
          <span className="relative text-white inline-block">
            Ch&apos;hal
            <span className="absolute top-[3px] left-[3px] text-gray-600 -z-10 select-none opacity-40">
              Ch&apos;hal
            </span>
          </span>
          <span className="mx-2" />
          <span className="relative text-[#53FC18] inline-block">
            Daro
            <span className="absolute top-[3px] left-[3px] text-[#36b30f] -z-10 select-none opacity-50">
              Daro
            </span>
          </span>
        </h1>
        <p className="mt-2 text-xs md:text-sm font-bold tracking-[0.3em] text-gray-500 uppercase italic pl-[0.3em]">
          Livescoring
        </p>
      </div>

      <div className="relative flex flex-col items-center justify-center h-24 w-24">
        <motion.div
          variants={ballVariants}
          animate="bounce"
          className="w-14 h-14 z-10 select-none pointer-events-none"
        >
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-[0_8px_4px_rgba(0,0,0,0.3)]"
            aria-hidden
          >
            <circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#121212" strokeWidth="4" />
            <polygon points="50,35 64,45 59,62 41,62 36,45" fill="#121212" />
            <line x1="50" y1="2" x2="50" y2="35" stroke="#121212" strokeWidth="4" />
            <line x1="2" y1="34" x2="36" y2="45" stroke="#121212" strokeWidth="4" />
            <line x1="98" y1="34" x2="64" y2="45" stroke="#121212" strokeWidth="4" />
            <line x1="18" y1="90" x2="41" y2="62" stroke="#121212" strokeWidth="4" />
            <line x1="82" y1="90" x2="59" y2="62" stroke="#121212" strokeWidth="4" />
            <polygon points="50,2 35,15 65,15" fill="#53FC18" opacity="0.15" />
          </svg>
        </motion.div>

        <motion.div
          variants={shadowVariants}
          animate="bounce"
          className="absolute bottom-1 w-12 h-2 bg-gradient-to-r from-[#53FC18] to-emerald-500 rounded-full blur-[2px]"
        />

        <motion.div
          animate={{
            scale: [0.5, 1.8, 0.5],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: 'easeInOut' as const,
          }}
          className="absolute bottom-0 w-12 h-3 border-2 border-[#53FC18] rounded-full blur-[1px]"
        />
      </div>

      {displayMessage && (
        <p className="mt-8 text-xs font-bold uppercase tracking-widest text-gray-500 italic">
          {displayMessage}
        </p>
      )}
    </div>
  );
}
