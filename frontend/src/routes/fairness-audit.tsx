import { createFileRoute } from '@tanstack/react-router';
import React, { useState, useEffect } from 'react';
import { fetchFairnessAudit } from '@/services/api';
import type { FairnessSummary } from '@/types/vajra';
import { Scale, ShieldCheck, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/fairness-audit')({
  component: FairnessAuditPage,
});

function FairnessAuditPage() {
  const [fairness, setFairness] = useState<FairnessSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadFairness = async () => {
    setLoading(true);
    try {
      const res = await fetchFairnessAudit();
      setFairness(res);
    } catch (err: any) {
      toast.error(`Failed to load fairness audit: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFairness();
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 p-4 space-y-4 overflow-y-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <Scale className="w-6 h-6 text-purple-400" />
          <div>
            <h1 className="text-sm font-bold text-white font-mono tracking-wider">
              MODEL 7 FAIRNESS AUDIT & GOVERNANCE CONSOLE
            </h1>
            <p className="text-xs text-slate-400">Non-Scoring Regional Disparate Impact Evaluation Layer</p>
          </div>
        </div>

        <span className="text-xs px-3 py-1 rounded bg-purple-950 text-purple-300 border border-purple-800 font-mono">
          NON-SCORING LAYER
        </span>
      </div>

      {/* Governance Disclaimer */}
      {fairness?.disparate_impact_disclaimer && (
        <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/60 text-xs text-purple-300 flex items-start gap-2 leading-relaxed">
          <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div>{fairness.disparate_impact_disclaimer}</div>
        </div>
      )}

      {/* Main Groups Disparate Impact Table */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <h2 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
          Regional Demographic Group Analysis ({fairness?.analyzed_groups_count || 0} Groups)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase font-mono">
                <th className="py-2.5 px-3">Regional Group</th>
                <th className="py-2.5 px-3">Predicted High Risk %</th>
                <th className="py-2.5 px-3">Confirmed Fraud %</th>
                <th className="py-2.5 px-3">Disparate Impact Ratio (DIR)</th>
                <th className="py-2.5 px-3 text-right">Governance Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {fairness?.groups?.map((grp, idx) => {
                let badgeStyle = 'bg-emerald-950 text-emerald-400 border-emerald-800';
                if (grp.status === 'REQUIRES INVESTIGATION') {
                  badgeStyle = 'bg-rose-950 text-rose-400 border-rose-800';
                } else if (grp.status === 'REVIEW') {
                  badgeStyle = 'bg-amber-950 text-amber-400 border-amber-800';
                }

                return (
                  <tr key={idx} className="hover:bg-slate-950/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-slate-200">{grp.group_name}</td>
                    <td className="py-3 px-3 font-mono text-slate-300">{(grp.predicted_high_risk_pct * 100).toFixed(1)}%</td>
                    <td className="py-3 px-3 font-mono text-slate-300">{(grp.confirmed_fraud_pct * 100).toFixed(1)}%</td>
                    <td className="py-3 px-3 font-mono font-bold text-purple-400">{grp.disparate_impact_ratio.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right font-mono">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] border ${badgeStyle}`}>
                        {grp.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
