import React from 'react';
import type { SOPTier } from '@/types/vajra';

interface SOPTierBadgeProps {
  tier?: SOPTier | string;
  className?: string;
  override?: boolean;
}

export function SOPTierBadge({ tier = 'MONITOR', className = '', override = false }: SOPTierBadgeProps) {
  const normalized = String(tier).toUpperCase();

  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';
  let label = normalized;

  if (override) {
    colorClasses = 'bg-rose-950/70 text-rose-300 border-rose-700/80 font-bold animate-pulse';
    label = 'ESCALATE-FREEZE (OVERRIDE)';
  } else if (normalized === 'MONITOR') {
    colorClasses = 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60';
    label = 'MONITOR';
  } else if (normalized === 'SOFT-ALERT' || normalized === 'SOFT_ALERT') {
    colorClasses = 'bg-amber-950/60 text-amber-400 border-amber-800/60';
    label = 'SOFT-ALERT';
  } else if (normalized === 'RECOMMEND-HOLD' || normalized === 'RECOMMEND_HOLD') {
    colorClasses = 'bg-orange-950/60 text-orange-400 border-orange-800/60';
    label = 'RECOMMEND-HOLD';
  } else if (normalized === 'ESCALATE-FREEZE' || normalized === 'ESCALATE_FREEZE') {
    colorClasses = 'bg-rose-950/70 text-rose-400 border-rose-800/80 animate-pulse';
    label = 'ESCALATE-FREEZE';
  } else if (normalized.includes('OVERRIDE') || normalized.includes('INTERNATIONAL')) {
    colorClasses = 'bg-purple-950/70 text-purple-300 border-purple-800/80 font-bold';
    label = 'CROSS-BORDER OVERRIDE';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded vajra-status font-mono border ${colorClasses} ${className}`}
    >
      {label}
    </span>
  );
}
