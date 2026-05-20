type LoadingSpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeMap = {
  sm: 'w-5 h-5',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
};

/** Live-broadcast style ring spinner in brand green */
export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  return (
    <div
      className={`relative ${sizeMap[size]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="absolute inset-0 rounded-full border-2 border-live-green/15" />
      <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-live-green animate-spin" />
      <span className="absolute inset-[38%] rounded-full bg-live-green animate-pulse-dot" />
    </div>
  );
}

type LoadingDotsProps = {
  className?: string;
};

/** Three bouncing dots for inline / compact waits */
export function LoadingDots({ className = '' }: LoadingDotsProps) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`} role="status" aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-live-green animate-loading-dot"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}
