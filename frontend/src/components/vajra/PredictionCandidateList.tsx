import React from 'react';
import type { WithdrawalNode } from '@/types/vajra';
import { MapPin, Building2, ChevronRight } from 'lucide-react';
import { ConfidenceGauge } from './ConfidenceGauge';

interface PredictionCandidateListProps {
  candidates?: WithdrawalNode[];
  onSelectNode?: (node: WithdrawalNode) => void;
  className?: string;
}

export function PredictionCandidateList({ candidates = [], onSelectNode, className = '' }: PredictionCandidateListProps) {
  if (!candidates.length) {
    return <div className="text-xs text-slate-500 py-3 text-center">No candidate nodes calculated</div>;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {candidates.slice(0, 3).map((node, index) => {
        const prob = node.ranker_score ?? node.vulnerability_score_reference ?? 0.50;
        const rank = node.final_rank ?? (index + 1);

        return (
          <div
            key={node.node_id || index}
            onClick={() => onSelectNode?.(node)}
            className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-mono text-[10px] text-slate-400 font-bold shrink-0">
                #{rank}
              </span>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 truncate">
                  <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">{node.node_id}</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 uppercase font-mono">
                    {node.node_type}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 truncate font-sans">
                  <span>{node.bank_name || 'Bank Aggregator'}</span>
                  <span>•</span>
                  <span>{node.district || node.city || 'Delhi NCR'}</span>
                  {node.candidate_distance_km !== undefined && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-400 font-mono text-[10px]">
                        {node.candidate_distance_km.toFixed(1)} km
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="w-28 text-right">
                <ConfidenceGauge value={prob} label="Prob" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
