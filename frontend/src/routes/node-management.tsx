import { createFileRoute } from '@tanstack/react-router';
import React, { useState, useEffect } from 'react';
import { fetchWithdrawalNodes } from '@/services/api';
import type { WithdrawalNode } from '@/types/vajra';
import { Building2, Search, Filter, RefreshCw, MapPin } from 'lucide-react';
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

  const loadNodes = async () => {
    setLoading(true);
    try {
      const res = await fetchWithdrawalNodes({ page: 1, page_size: 50 });
      setNodes(res.items || []);
      if (res.items?.length > 0) {
        setSelectedNode(res.items[0]);
      }
    } catch (err: any) {
      toast.error(`Failed to load withdrawal nodes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNodes();
  }, []);

  const filteredNodes = nodes.filter((node) => {
    if (nodeTypeFilter !== 'ALL' && node.node_type !== nodeTypeFilter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchId = node.node_id.toLowerCase().includes(q);
      const matchBank = (node.bank_name || '').toLowerCase().includes(q);
      const matchDist = (node.district || '').toLowerCase().includes(q);
      return matchId || matchBank || matchDist;
    }
    return true;
  });

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

            <button
              onClick={loadNodes}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Node Summary List (5-6 Default Columns) */}
        <div className="flex-1 overflow-y-auto p-3 scrollbar-thin space-y-2">
          {filteredNodes.map((node) => {
            const isSelected = selectedNode?.node_id === node.node_id;
            const vuln = node.vulnerability_score_reference ?? node.node_vulnerability_score ?? 0.35;

            return (
              <div
                key={node.node_id}
                onClick={() => setSelectedNode(node)}
                className={`p-3 rounded-xl border transition-colors cursor-pointer flex items-center justify-between gap-4 ${
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
                      <span className="text-xs font-mono font-bold text-white truncate">{node.node_id}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 font-mono uppercase">
                        {node.node_type}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {node.bank_name || 'Bank Aggregator'} • {node.district || 'Delhi NCR'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right text-xs font-mono">
                    <div className="text-[10px] text-slate-500">Daily Limit</div>
                    <div className="text-slate-300 font-medium">₹{(node.cash_limit_daily || 100000).toLocaleString('en-IN')}</div>
                  </div>

                  <RiskBadge score={vuln} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Persistent ATM Tactical Brief Drawer */}
      <div className="w-96 shrink-0 h-full border-l border-slate-800">
        <TacticalBrief node={selectedNode} />
      </div>
    </div>
  );
}
