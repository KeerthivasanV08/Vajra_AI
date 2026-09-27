import React from 'react';

interface ConfidenceGaugeProps {
  value: number; // 0.0 to 1.0 or 0 to 100
  label?: string;
  className?: string;
}

export function ConfidenceGauge({ value, label = 'Confidence', className = '' }: ConfidenceGaugeProps) {
  const normValue = value > 1.0 ? value / 100 : value;
  const pct = Math.min(100, Math.max(0, Math.round(normValue * 100)));

  let colorClass = 'text-emerald-400 bg-emerald-500';
  if (pct >= 80) colorClass = 'text-rose-400 bg-rose-500';
  else if (pct >= 60) colorClass = 'text-amber-400 bg-amber-500';
  else if (pct >= 40) colorClass = 'text-blue-400 bg-blue-500';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${colorClass.split(' ')[1]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center gap-1 font-mono text-[11px] whitespace-nowrap">
        <span className="text-slate-400">{label}:</span>
        <span className={`font-semibold ${colorClass.split(' ')[0]}`}>{pct}%</span>
      </div>
    </div>
  );
}
