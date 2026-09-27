import { createFileRoute } from '@tanstack/react-router';
import React, { useState, useEffect } from 'react';
import { OperationsMapCanvas } from '@/components/vajra/OperationsMapCanvas';
import { TacticalBrief } from '@/components/vajra/TacticalBrief';
import { fetchWithdrawalNode, fetchWithdrawalNodes, fetchCorridors } from '@/services/api';
import type { WithdrawalNode, HighRiskCorridor } from '@/types/vajra';
import { Map, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/heatmap')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      caseId: typeof search.caseId === 'string' ? search.caseId : undefined,
      nodeId: typeof search.nodeId === 'string' ? search.nodeId : undefined,
    };
  },
  component: OperationsMapPage,
});

function OperationsMapPage() {
  const search = Route.useSearch();
  const [nodes, setNodes] = useState<WithdrawalNode[]>([]);
  const [corridors, setCorridors] = useState<HighRiskCorridor[]>([]);
  const [selectedNode, setSelectedNode] = useState<WithdrawalNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'IMMINENT' | 'WATCHLIST' | 'NORMAL'>('ALL');

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [nodeRes, corrRes, requestedNode] = await Promise.all([
        fetchWithdrawalNodes({ page: 1, page_size: 50 }),
        fetchCorridors(),
        search.nodeId ? fetchWithdrawalNode(search.nodeId) : Promise.resolve(null),
      ]);
      const listedItems = nodeRes.items || [];
      const items = requestedNode
        ? [requestedNode, ...listedItems.filter((node) => node.node_id !== requestedNode.node_id)]
        : listedItems;
      setNodes(items);
      setCorridors(corrRes || []);
      if (items.length > 0) {
        const initial = requestedNode || items[0];
        setSelectedNode(initial);
      } else {
        setSelectedNode(null);
      }
    } catch (err: any) {
      setLoadError(err instanceof Error ? err.message : 'Unable to load operations map data.');
      toast.error(`Failed to load operations map data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredNodes = nodes.filter((node) => {
    if (riskFilter === 'ALL') return true;
    const vuln = node.vulnerability_score_reference ?? node.node_vulnerability_score ?? 0.35;
    if (riskFilter === 'IMMINENT') return vuln >= 0.70;
    if (riskFilter === 'WATCHLIST') return vuln >= 0.50 && vuln < 0.70;
    if (riskFilter === 'NORMAL') return vuln < 0.50;
    return true;
  });

  return (
    <div className="flex min-h-full w-full flex-col bg-slate-950 text-slate-200 overflow-y-auto select-none lg:flex-row lg:overflow-hidden">
      {/* Left / Center Map Section */}
      <div className="flex min-h-[36rem] min-w-0 flex-1 flex-col lg:min-h-0">
        {/* Top Control Filter Bar */}
        <div className="p-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <Map className="w-5 h-5 text-rose-500" />
            <h1 className="text-base font-bold text-white font-mono tracking-wider">
              VAJRA GIS OPERATIONS MAP
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              {filteredNodes.length} NODES MONITORED
            </span>
          </div>

          {/* Risk Tier Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-sm">
            {(['ALL', 'IMMINENT', 'WATCHLIST', 'NORMAL'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setRiskFilter(tab)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors ${
                  riskFilter === tab
                    ? 'bg-slate-800 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={loadData}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh Map Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Map Canvas */}
        <div className="relative flex-1 min-h-0 p-3">
          {loading ? (
            <div className="flex h-full min-h-[30rem] items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-sm text-slate-300">
              Loading operations map data...
            </div>
          ) : loadError ? (
            <div className="flex h-full min-h-[30rem] flex-col items-center justify-center gap-3 rounded-xl border border-rose-900/70 bg-slate-900 px-6 text-center">
              <p className="text-sm font-medium text-rose-200">Unable to load operations map data</p>
              <p className="max-w-md text-xs text-slate-400">{loadError}</p>
              <button onClick={loadData} className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">Retry</button>
            </div>
          ) : filteredNodes.length === 0 ? (
            <div className="flex h-full min-h-[30rem] items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-sm text-slate-300">
              No nodes available for this filter.
            </div>
          ) : (
            <OperationsMapCanvas
              nodes={filteredNodes}
              corridors={corridors}
              selectedNode={selectedNode}
              onSelectNode={(node) => setSelectedNode(node)}
            />
          )}
        </div>
      </div>

      {/* Right Persistent ATM Tactical Brief Panel (Split-Pane Architecture) */}
      <div className="h-[28rem] w-full shrink-0 border-t border-slate-800 lg:h-full lg:w-[min(24rem,34vw)] lg:min-w-[20rem] lg:border-l lg:border-t-0">
        {(() => {
          const vuln = selectedNode ? (selectedNode.vulnerability_score_reference ?? selectedNode.node_vulnerability_score ?? 0.35) : 0;
          const dynamicSopTier = vuln >= 0.70 ? 'ESCALATE_FREEZE' : vuln >= 0.50 ? 'RECOMMEND-HOLD' : 'MONITOR';
          const dynamicCaseId = search.caseId || (selectedNode ? `CASE_NODE_${selectedNode.node_id.replace(/^NODE0*/, '')}` : 'CASE_VAJRA_1001');

          return (
            <TacticalBrief
              node={selectedNode}
              caseId={dynamicCaseId}
              sopTier={dynamicSopTier}
            />
          );
        })()}
      </div>
    </div>
  );
}
