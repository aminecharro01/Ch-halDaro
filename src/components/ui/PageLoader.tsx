import { ChhalDaroLoader } from './ChhalDaroLoader';
import type { LoadingContext } from '@/lib/loading-messages';

type PageLoaderProps = {
  message?: string;
  context?: LoadingContext;
  compact?: boolean;
};

export function PageLoader({ message, context, compact = false }: PageLoaderProps) {
  return <ChhalDaroLoader message={message} context={context} compact={compact} />;
}

type LoadingSkeletonProps = {
  className?: string;
};

export function LoadingSkeleton({ className = '' }: LoadingSkeletonProps) {
  return <div className={`animate-shimmer rounded-2xl bg-white/5 ${className}`} aria-hidden />;
}
