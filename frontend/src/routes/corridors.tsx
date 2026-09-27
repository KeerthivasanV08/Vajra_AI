import { createFileRoute } from '@tanstack/react-router';
import React, { useState, useEffect } from 'react';
import { fetchCorridorNodes, fetchCorridors } from '@/services/api';
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
  const [selected, setSelected] = useState<HighRiskCorridor | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<any[]>([]);
  const [stateFilter, setStateFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'risk' | 'nodes'>('risk');

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

  const selectCorridor = async (corridor: HighRiskCorridor) => {
    setSelected(corridor);
    try { const result = await fetchCorridorNodes(corridor.corridor_id); setSelectedNodes(result.nodes || []); } catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to load corridor nodes.'); }
  };

  const visibleCorridors = corridors.filter((corridor) => stateFilter === 'ALL' || corridor.state === stateFilter).sort((a, b) => sortBy === 'nodes' ? b.primary_nodes_count - a.primary_nodes_count : b.risk_score - a.risk_score);

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

      <div className="flex flex-wrap items-center gap-2"><select value={stateFilter} onChange={(event) => setStateFilter(event.target.value)} className="rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300"><option value="ALL">ALL STATES</option>{Array.from(new Set(corridors.map((corridor) => corridor.state))).map((state) => <option key={state} value={state}>{state}</option>)}</select><select value={sortBy} onChange={(event) => setSortBy(event.target.value as 'risk' | 'nodes')} className="rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300"><option value="risk">SORT: INTENSITY</option><option value="nodes">SORT: NODE COUNT</option></select></div>

      {/* Grid of Corridors */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {loading ? <div className="p-6 text-sm text-slate-400">Loading corridor intelligence...</div> : !visibleCorridors.length ? <div className="p-6 text-sm text-slate-400">No corridors available for this filter.</div> : visibleCorridors.map((corr, idx) => (
          <button key={`corridor-card-${corr.corridor_id || 'item'}-${idx}`} onClick={() => void selectCorridor(corr)} className={`p-4 rounded-xl bg-slate-900 border text-left space-y-3 ${selected?.corridor_id === corr.corridor_id ? 'border-rose-600' : 'border-slate-800'}`}>
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
          </button>
        ))}
      </div>
      {selected && <section className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-3"><div className="flex items-center justify-between"><div><h2 className="text-base font-semibold text-white">{selected.corridor_name}</h2><p className="text-xs text-slate-400">{selected.district}, {selected.state} · {selectedNodes.length} nodes in corridor</p></div><a href={`/heatmap?corridorId=${encodeURIComponent(selected.corridor_id)}`} className="rounded-md bg-slate-800 px-3 py-2 text-xs text-cyan-300">View on Operations Map</a></div><div className="grid grid-cols-1 gap-2 md:grid-cols-3">{selectedNodes.slice(0, 6).map((node) => <div key={node.node_id} className="rounded-md border border-slate-800 bg-slate-950 p-3 text-xs"><div className="font-mono text-slate-200">{node.node_id}</div><div className="mt-1 text-slate-500">{node.node_type} · {node.district || 'District unavailable'}</div></div>)}</div></section>}
    </div>
  );
}
