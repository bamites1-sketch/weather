import { memo } from 'react';

// ── Single shimmer block ──────────────────────────────────────────────────────
const S = ({ className = '' }) => (
  <div className={`rounded-xl shimmer ${className}`} aria-hidden="true" />
);

// ── WeatherCard skeleton ──────────────────────────────────────────────────────
const WeatherCardSkeleton = () => (
  <div className="space-y-3">
    <div className="glass-card rounded-3xl p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2.5">
          <S className="h-3 w-28" />
          <S className="h-2 w-20" />
          <S className="h-16 w-36 rounded-2xl" />
          <S className="h-3 w-32" />
          <S className="h-2.5 w-24" />
        </div>
        <S className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl flex-shrink-0" />
      </div>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
      {[0,1,2,3].map(i => (
        <div key={i} className="glass-card rounded-2xl p-3 sm:p-4 space-y-2">
          <S className="h-2 w-14" />
          <S className="h-5 w-16 rounded-lg" />
          <S className="h-2 w-10" />
        </div>
      ))}
    </div>
    <div className="glass-card rounded-2xl p-3 sm:p-4 flex justify-around">
      {[0,1,2].map(i => (
        <div key={i} className="flex flex-col items-center gap-1.5">
          <S className="w-7 h-7 rounded-full" />
          <S className="h-2 w-10" />
          <S className="h-2.5 w-12" />
        </div>
      ))}
    </div>
  </div>
);

// ── Hourly skeleton ───────────────────────────────────────────────────────────
const HourlySkeleton = () => (
  <div className="glass-card rounded-3xl p-4 sm:p-5">
    <S className="h-2 w-24 mb-3" />
    <div className="flex gap-2 overflow-hidden">
      {[0,1,2,3,4,5].map(i => (
        <div key={i} className="flex flex-col items-center gap-2 min-w-[70px] flex-shrink-0">
          <S className="h-2 w-8" />
          <S className="w-8 h-8 rounded-xl" />
          <S className="h-3 w-7" />
        </div>
      ))}
    </div>
  </div>
);

// ── Daily skeleton ────────────────────────────────────────────────────────────
const DailySkeleton = () => (
  <div className="glass-card rounded-3xl p-4 sm:p-5">
    <S className="h-2 w-20 mb-3" />
    <div className="space-y-0.5">
      {[0,1,2,3,4,5,6].map(i => (
        <div key={i} className="flex items-center gap-2 px-2 py-2.5">
          <S className="h-3 w-14" />
          <S className="w-7 h-7 rounded-xl flex-shrink-0" />
          <S className="h-1.5 flex-1 rounded-full" />
          <S className="h-1.5 w-20 rounded-full flex-shrink-0" />
        </div>
      ))}
    </div>
  </div>
);

// ── Full skeleton ─────────────────────────────────────────────────────────────
export const SkeletonUI = memo(() => (
  <div
    className="space-y-3 w-full"
    aria-busy="true"
    aria-label="Loading weather data"
    role="status"
  >
    <WeatherCardSkeleton />
    <HourlySkeleton />
    <DailySkeleton />
  </div>
));
SkeletonUI.displayName = 'SkeletonUI';

export default SkeletonUI;
