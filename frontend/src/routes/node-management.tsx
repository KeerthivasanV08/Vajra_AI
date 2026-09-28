import { createFileRoute } from '@tanstack/react-router';
import React, { useState, useEffect } from 'react';
import { bulkImportNodes, fetchWithdrawalNodes, recalculateNodeVulnerability } from '@/services/api';
import type { WithdrawalNode } from '@/types/vajra';
import { Building2, Search, Filter, RefreshCw, MapPin, List, Map, ChevronLeft, ChevronRight } from 'lucide-react';
import { OperationsMapCanvas } from '@/components/vajra/OperationsMapCanvas';
import { TacticalBrief } from '@/components/vajra/TacticalBrief';
import { RiskBadge } from '@/components/vajra/RiskBadge';
import { toast } from 'sonner';

export const Route = createFileRoute('/node-management')({
  component: NodeManagementPage,
});

function NodeManagementPage() {
  const [nodes, setNodes] = useState<WithdrawalNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<WithdrawalNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [nodeTypeFilter, setNodeTypeFilter] = useState<string>('ALL');
  const [riskBandFilter, setRiskBandFilter] = useState<string>('ALL');
  const [view, setView] = useState<'list' | 'map'>('list');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [totalNodes, setTotalNodes] = useState(0);

  const loadNodes = async (targetPage = page) => {
    setLoading(true);
    try {
      const res = await fetchWithdrawalNodes({
        page: targetPage,
        page_size: pageSize,
        search: search || undefined,
        node_type: nodeTypeFilter === 'ALL' ? undefined : nodeTypeFilter,
        risk_band: riskBandFilter === 'ALL' ? undefined : riskBandFilter,
      });
      setNodes(res.items || []);
      setTotalNodes(res.total || 0);
      if (res.items?.length > 0) {
        setSelectedNode(res.items[0]);
      } else {
        setSelectedNode(null);
      }
    } catch (err: any) {
      toast.error(`Failed to load withdrawal nodes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    loadNodes(1);
  }, [search, nodeTypeFilter, riskBandFilter]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadNodes(newPage);
  };

  const filteredNodes = nodes;

  return (
    <div className="flex h-full w-full bg-slate-950 text-slate-200 overflow-hidden select-none">
      {/* Left List Section */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Control Bar */}
        <div className="p-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <h1 className="text-sm font-bold text-white font-mono tracking-wider">
              WITHDRAWAL NODE REGISTRY
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              {filteredNodes.length} NODES
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Node ID, Bank, District..."
                className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-slate-700 w-48 font-sans"
              />
            </div>

            {/* Type Filter */}
            <select
              value={nodeTypeFilter}
              onChange={(e) => setNodeTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 font-mono focus:outline-none"
            >
              <option value="ALL">ALL TYPES</option>
              <option value="ATM">ATM</option>
              <option value="MICRO_ATM">MICRO ATM</option>
              <option value="AEPS_CSP">AePS CSP</option>
              <option value="POS">POS</option>
            </select>

            <select value={riskBandFilter} onChange={(e) => setRiskBandFilter(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 font-mono focus:outline-none">
              <option value="ALL">ALL RISK</option><option value="HIGH">HIGH</option><option value="MEDIUM">MEDIUM</option><option value="LOW">LOW</option>
            </select>

            <label className="cursor-pointer rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white">
              Bulk Import
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  try {
                    const result = await bulkImportNodes(file);
                    toast.success(`Imported ${result.rows_accepted ?? 0} nodes.`);
                    await loadNodes();
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : 'Node import failed.');
                  } finally {
                    event.target.value = '';
                  }
                }}
              />
            </label>

            <button
              onClick={loadNodes}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 border-b border-slate-800 px-3 py-2"><button onClick={() => setView('list')} className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs ${view === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}><List className="h-3.5 w-3.5" /> List</button><button onClick={() => setView('map')} className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs ${view === 'map' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}><Map className="h-3.5 w-3.5" /> Map</button></div>
        {/* Node Summary List / Map */}
        <div className="flex-1 overflow-y-auto p-3 scrollbar-thin space-y-2">
          {view === 'map' && filteredNodes.length > 0 && <OperationsMapCanvas nodes={filteredNodes} selectedNode={selectedNode} onSelectNode={setSelectedNode} className="mb-3 min-h-[28rem]" />}
          {view === 'list' && (loading ? <div className="p-6 text-center text-sm text-slate-400">Loading withdrawal nodes...</div> : !filteredNodes.length ? <div className="p-6 text-center text-sm text-slate-400">No withdrawal nodes match the current filters.</div> : filteredNodes.map((node) => {
            const isSelected = selectedNode?.node_id === node.node_id;
            const vuln = node.vulnerability_score_reference ?? node.node_vulnerability_score ?? 0.35;

            return (
              <div
                key={node.node_id}
                onClick={() => setSelectedNode(node)}
                className={`min-h-12 p-3 rounded-xl border transition-colors cursor-pointer flex items-center justify-between gap-4 ${
                  isSelected
                    ? 'bg-slate-900 border-slate-700 shadow-md'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 font-mono text-xs shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold text-white truncate">{node.node_id}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 font-mono uppercase">
                        {node.node_type}
                      </span>
                    </div>
                    <div className="text-sm text-slate-300 truncate mt-0.5">
                      {node.bank_name || 'Bank Aggregator'} • {node.district || 'Delhi NCR'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right text-sm font-mono">
                    <div className="text-[10px] text-slate-500">Daily Limit</div>
                    <div className="text-slate-300 font-medium">₹{(node.cash_limit_daily || 100000).toLocaleString('en-IN')}</div>
                  </div>

                  <RiskBadge score={vuln} />
                </div>
              </div>
            );
          }))}
        </div>

        {/* Pagination Bar */}
        <div className="p-2.5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400 font-mono shrink-0">
          <div>
            Page {page} of {Math.max(1, Math.ceil(totalNodes / pageSize))} ({totalNodes.toLocaleString()} nodes total)
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1 || loading}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-200">
              {page}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= Math.ceil(totalNodes / pageSize) || loading}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Persistent ATM Tactical Brief Drawer */}
      <div className="w-96 shrink-0 h-full border-l border-slate-800">
        <TacticalBrief node={selectedNode} />
        {selectedNode && <button onClick={async () => { try { await recalculateNodeVulnerability(selectedNode.node_id); toast.success('Node vulnerability recalculated.'); await loadNodes(); } catch (error) { toast.error(error instanceof Error ? error.message : 'Vulnerability recalculation failed.'); } }} className="m-4 w-[calc(100%-2rem)] rounded-md bg-amber-700 px-3 py-2 text-xs font-semibold text-white">Recalculate Vulnerability</button>}
      </div>
    </div>
  );
}
