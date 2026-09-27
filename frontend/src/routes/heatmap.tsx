import { createFileRoute } from '@tanstack/react-router';
import React, { useState, useEffect } from 'react';
import { OperationsMapCanvas } from '@/components/vajra/OperationsMapCanvas';
import { TacticalBrief } from '@/components/vajra/TacticalBrief';
import { fetchWithdrawalNodes, fetchCorridors } from '@/services/api';
import type { WithdrawalNode, HighRiskCorridor } from '@/types/vajra';
import { Map, Filter, RefreshCw, Building2 } from 'lucide-react';
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
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'IMMINENT' | 'WATCHLIST' | 'NORMAL'>('ALL');

  const loadData = async () => {
    setLoading(true);
    try {
      const [nodeRes, corrRes] = await Promise.all([
        fetchWithdrawalNodes({ page: 1, page_size: 50 }),
        fetchCorridors(),
      ]);
      const items = nodeRes.items || [];
      setNodes(items);
      setCorridors(corrRes || []);
      if (items.length > 0) {
        const initial = search.nodeId ? items.find(n => n.node_id === search.nodeId) || items[0] : items[0];
        setSelectedNode(initial);
      }
    } catch (err: any) {
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
    <div className="flex h-full w-full bg-slate-950 text-slate-200 overflow-hidden select-none">
      {/* Left / Center Map Section */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Control Filter Bar */}
        <div className="p-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <Map className="w-5 h-5 text-rose-500" />
            <h1 className="text-sm font-bold text-white font-mono tracking-wider">
              VAJRA GIS OPERATIONS MAP
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              {filteredNodes.length} NODES MONITORED
            </span>
          </div>

          {/* Risk Tier Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            {(['ALL', 'IMMINENT', 'WATCHLIST', 'NORMAL'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setRiskFilter(tab)}
                className={`px-3 py-1 rounded-md text-[11px] font-mono font-medium transition-colors ${
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
        <div className="flex-1 p-3 min-h-0 relative">
          <OperationsMapCanvas
            nodes={filteredNodes}
            corridors={corridors}
            selectedNode={selectedNode}
            onSelectNode={(node) => setSelectedNode(node)}
          />
        </div>
      </div>

      {/* Right Persistent ATM Tactical Brief Panel (Split-Pane Architecture) */}
      <div className="w-96 shrink-0 h-full border-l border-slate-800">
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
