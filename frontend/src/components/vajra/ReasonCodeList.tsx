import React from 'react';
import { Tag } from 'lucide-react';

interface ReasonCodeListProps {
  reasons?: string[];
  className?: string;
}

export function ReasonCodeList({ reasons = [], className = '' }: ReasonCodeListProps) {
  if (!reasons.length) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {reasons.map((reason, idx) => {
        let style = 'bg-slate-900 text-slate-300 border-slate-800';
        if (reason.includes('HIGH') || reason.includes('SUSPICIOUS')) {
          style = 'bg-rose-950/60 text-rose-300 border-rose-800/60';
        } else if (reason.includes('GEO') || reason.includes('CELL')) {
          style = 'bg-blue-950/60 text-blue-300 border-blue-800/60';
        } else if (reason.includes('OVERSEAS') || reason.includes('VPN')) {
          style = 'bg-purple-950/60 text-purple-300 border-purple-800/60';
        }

        return (
          <span
            key={idx}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border ${style}`}
          >
            <Tag className="w-2.5 h-2.5 opacity-60" />
            <span>{reason.replace(/_/g, ' ')}</span>
          </span>
        );
      })}
    </div>
  );
}
