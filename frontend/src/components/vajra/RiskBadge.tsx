import React from 'react';

interface RiskBadgeProps {
  score?: number;
  level?: 'IMMINENT' | 'CRITICAL' | 'WATCHLIST' | 'NORMAL' | string;
  className?: string;
}

export function RiskBadge({ score, level, className = '' }: RiskBadgeProps) {
  let computedLevel = level;
  if (!computedLevel && score !== undefined) {
    if (score >= 0.85) computedLevel = 'IMMINENT';
    else if (score >= 0.70) computedLevel = 'CRITICAL';
    else if (score >= 0.50) computedLevel = 'WATCHLIST';
    else computedLevel = 'NORMAL';
  }

  const normalized = String(computedLevel || 'NORMAL').toUpperCase();

  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';

  if (normalized === 'IMMINENT') {
    colorClasses = 'bg-rose-950 text-rose-300 border-rose-700 font-bold animate-pulse';
  } else if (normalized === 'CRITICAL') {
    colorClasses = 'bg-rose-950/70 text-rose-400 border-rose-800';
  } else if (normalized === 'WATCHLIST') {
    colorClasses = 'bg-amber-950/60 text-amber-400 border-amber-800/60';
  } else if (normalized === 'NORMAL') {
    colorClasses = 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60';
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${colorClasses} ${className}`}
    >
      <span>{normalized}</span>
      {score !== undefined && (
        <span className="text-[10px] opacity-80">({(score * 100).toFixed(0)}%)</span>
      )}
    </span>
  );
}
