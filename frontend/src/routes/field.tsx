import { createFileRoute } from '@tanstack/react-router';
import React, { useState, useEffect } from 'react';
import { Smartphone, Radio, Navigation, CheckCircle2, ShieldAlert, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '@/store/realtime';
import { fetchWithdrawalNodes } from '@/services/api';
import type { WithdrawalNode } from '@/types/vajra';

export const Route = createFileRoute('/field')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      nodeId: typeof search.nodeId === 'string' ? search.nodeId : undefined,
      caseId: typeof search.caseId === 'string' ? search.caseId : undefined,
    };
  },
  component: BeatOfficerFieldPage,
});

function BeatOfficerFieldPage() {
  const search = Route.useSearch();
  const [acknowledged, setAcknowledged] = useState(false);
  const [node, setNode] = useState<WithdrawalNode | null>(null);
  const alerts = useStore((s) => s.alerts);
  const activeCritical = alerts.find((a) => a.priority === 'P1') || alerts[0];

  useEffect(() => {
    fetchWithdrawalNodes({ page: 1, page_size: 20 })
      .then((res) => {
        const items = res.items || [];
        if (items.length > 0) {
          const matched = search.nodeId ? items.find((n) => n.node_id === search.nodeId) : null;
          setNode(matched || items[0]);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch field node data:', err);
      });
  }, [search.nodeId]);

  const targetNodeId = node?.node_id || (activeCritical?.userId ? `NODE-${activeCritical.userId.slice(0, 8)}` : 'NODE010308');
  const targetNode = `ATM NODE ${targetNodeId}`;
  const bankName = node?.bank_name || 'Fino Payments Bank';
  const districtName = node?.district || 'New Delhi District';
  const riskScore = node?.vulnerability_score_reference
    ? Math.round(node.vulnerability_score_reference * 100)
    : activeCritical?.riskScore
    ? Math.round(activeCritical.riskScore)
    : 88;
  const leadTime = '25 mins';
  const targetLat = node?.latitude ?? 28.6139;
  const targetLon = node?.longitude ?? 77.2090;
  const distanceKm = node?.candidate_distance_km ? `${node.candidate_distance_km.toFixed(1)} km` : '1.2 km';

  const handleAcknowledge = () => {
    setAcknowledged(true);
    toast.success(`Patrol Unit Dispatch Acknowledged for ${targetNode}!`);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-4 space-y-4 overflow-y-auto select-none max-w-lg mx-auto">
      {/* Top Field Mode Banner */}
      <div className="p-4 rounded-2xl bg-rose-950 border-2 border-rose-600 text-rose-100 space-y-2 text-center shadow-2xl animate-pulse">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-900 border border-rose-500 text-xs font-mono font-bold tracking-wider">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          HIGH PRIORITY PATROL DISPATCH
        </div>
        <h1 className="text-xl font-extrabold text-white tracking-tight">{targetNode}</h1>
        <p className="text-xs text-rose-200 font-mono">{bankName} • {districtName}</p>
      </div>

      {/* Target Specs */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs">
        <div className="flex justify-between items-center py-1 border-b border-slate-800">
          <span className="text-slate-400">IMMINENT CASHOUT PROB:</span>
          <span className="text-rose-400 font-bold text-sm">{riskScore}%</span>
        </div>

        <div className="flex justify-between items-center py-1 border-b border-slate-800">
          <span className="text-slate-400">PROACTIVE LEAD TIME:</span>
          <span className="text-amber-400 font-bold text-sm">{leadTime}</span>
        </div>

        <div className="flex justify-between items-center py-1 border-b border-slate-800">
          <span className="text-slate-400">NEAREST BEAT PATROL:</span>
          <span className="text-slate-200 font-bold">{districtName} PCR Unit-822</span>
        </div>

        <div className="flex justify-between items-center py-1">
          <span className="text-slate-400">DISTANCE TO ATM:</span>
          <span className="text-emerald-400 font-bold">{distanceKm}</span>
        </div>
      </div>

      {activeCritical && (
        <div className="p-3 bg-slate-900/80 border border-amber-500/30 rounded-xl text-xs space-y-1">
          <div className="flex items-center gap-2 text-amber-400 font-semibold">
            <AlertTriangle className="w-4 h-4" />
            Active Realtime Signal
          </div>
          <p className="text-slate-300 font-sans">{activeCritical.summary || activeCritical.type}</p>
        </div>
      )}

      {/* Touch Action Buttons */}
      <div className="space-y-3 pt-2">
        <button
          onClick={handleAcknowledge}
          disabled={acknowledged}
          className={`w-full py-4 rounded-2xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-xl ${
            acknowledged
              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950'
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
          {acknowledged ? 'PATROL DISPATCH ACKNOWLEDGED' : 'ACKNOWLEDGE PATROL DISPATCH'}
        </button>

        <a
          href={`https://www.google.com/maps/search/?api=1&query=${targetLat},${targetLon}`}
          target="_blank"
          rel="noreferrer"
          className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm transition-colors flex items-center justify-center gap-2 shadow-xl shadow-blue-950"
        >
          <Navigation className="w-5 h-5" />
          START GOOGLE MAPS NAVIGATION ↗
        </a>
      </div>
    </div>
  );
}

