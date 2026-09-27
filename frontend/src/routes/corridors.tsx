import { createFileRoute } from '@tanstack/react-router';
import React, { useState, useEffect } from 'react';
import { fetchCorridors } from '@/services/api';
import type { HighRiskCorridor } from '@/types/vajra';
import { Layers, RefreshCw } from 'lucide-react';
import { RiskBadge } from '@/components/vajra/RiskBadge';
import { toast } from 'sonner';

export const Route = createFileRoute('/corridors')({
  component: CorridorsPage,
});

function CorridorsPage() {
  const [corridors, setCorridors] = useState<HighRiskCorridor[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCorridors = async () => {
    setLoading(true);
    try {
      const res = await fetchCorridors();
      setCorridors(res || []);
    } catch (err: any) {
      toast.error(`Failed to load corridors: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCorridors();
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 p-4 space-y-4 overflow-y-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <Layers className="w-6 h-6 text-rose-500" />
          <div>
            <h1 className="text-sm font-bold text-white font-mono tracking-wider">
              MONITORED HIGH-RISK CASHOUT CORRIDORS
            </h1>
            <p className="text-xs text-slate-400">Dense Withdrawal Networks & Inter-District Cash-Out Vector Analytics</p>
          </div>
        </div>

        <button
          onClick={loadCorridors}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Grid of Corridors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {corridors.map((corr, idx) => (
          <div key={`corridor-card-${corr.corridor_id || 'item'}-${idx}`} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-rose-400">{corr.corridor_id}</span>
              <RiskBadge score={corr.risk_score} />
            </div>

            <h3 className="text-sm font-semibold text-white">{corr.corridor_name}</h3>
            <div className="text-xs text-slate-400 font-mono">
              District: {corr.district} • State: {corr.state}
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono flex items-center justify-between">
              <span className="text-slate-400">Primary Monitored Nodes:</span>
              <span className="text-emerald-400 font-bold">{corr.primary_nodes_count} Nodes</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
