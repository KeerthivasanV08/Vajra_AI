import React from 'react';
import { Clock } from 'lucide-react';

interface LeadTimeBadgeProps {
  mins?: number;
  label?: string;
  className?: string;
}

export function LeadTimeBadge({ mins = 30, label = 'Lead Time', className = '' }: LeadTimeBadgeProps) {
  let color = 'bg-blue-950/60 text-blue-400 border-blue-800/60';
  if (mins <= 15) color = 'bg-rose-950/80 text-rose-300 border-rose-700 animate-pulse';
  else if (mins <= 30) color = 'bg-amber-950/60 text-amber-400 border-amber-800/60';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium border ${color} ${className}`}>
      <Clock className="w-3 h-3 shrink-0" />
      <span>{label}: {mins} mins</span>
    </span>
  );
}
