import React, { useState } from 'react';
import type { WithdrawalNode, SOPTier } from '@/types/vajra';
import { Building2, MapPin, ShieldAlert, Radio, AlertOctagon, CheckCircle2, Copy } from 'lucide-react';
import { SOPTierBadge } from './SOPTierBadge';
import { RiskBadge } from './RiskBadge';
import { ConfidenceGauge } from './ConfidenceGauge';
import { ConfirmActionDialog } from './ConfirmActionDialog';
import { dispatchPCRPatrol, dispatchBankStepUp, generateLegalDossier } from '@/services/api';
import { toast } from 'sonner';

interface TacticalBriefProps {
  node: WithdrawalNode | null;
  caseId?: string;
  accountId?: string;
  sopTier?: SOPTier | string;
  onClose?: () => void;
  className?: string;
}

export function TacticalBrief({
  node,
  caseId: initialCaseId = '',
  accountId: initialAccountId = '',
  sopTier = 'RECOMMEND-HOLD',
  onClose,
  className = '',
}: TacticalBriefProps) {
  const [caseId, setCaseId] = useState(initialCaseId);
  const [accountId, setAccountId] = useState(initialAccountId);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; action: 'pcr' | 'bank' | null }>({
    isOpen: false,
    action: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state if props change
  React.useEffect(() => {
    if (initialCaseId) setCaseId(initialCaseId);
  }, [initialCaseId]);
  React.useEffect(() => {
    if (initialAccountId) setAccountId(initialAccountId);
  }, [initialAccountId]);

  if (!node) {
    return (
      <div className={`p-6 text-center text-slate-500 text-xs flex flex-col items-center justify-center h-full border-l border-slate-800 ${className}`}>
        <Building2 className="w-8 h-8 text-slate-700 mb-2 stroke-[1.5]" />
        <p className="font-medium text-slate-400">No Withdrawal Node Selected</p>
        <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
          Select an ATM, Micro-ATM, or AePS CSP node from the list or map to view tactical intelligence.
        </p>
      </div>
    );
  }

  const vulnScore = node.vulnerability_score_reference ?? node.node_vulnerability_score ?? 0.35;
  const rankerScore = node.ranker_score ?? 0.65;
  const effectiveCaseId = caseId.trim();
  const effectiveAccountId = accountId.trim();

  const handleDispatchPCR = async () => {
    if (!effectiveCaseId) {
      toast.error('A Case reference is required for PCR Patrol dispatch.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await dispatchPCRPatrol({
        case_id: effectiveCaseId,
        target_node_id: node.node_id,
        target_lat: node.latitude,
        target_lon: node.longitude,
      });
      toast.success(`PCR Patrol Dispatched! Dispatch ID: ${res.dispatch_id}`);
      setConfirmDialog({ isOpen: false, action: null });
    } catch (err: any) {
      toast.error(`PCR Dispatch failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDispatchBank = async () => {
    if (!effectiveCaseId) {
      toast.error('A Case reference is required for Bank Step-Up Auth.');
      return;
    }
    if (!effectiveAccountId) {
      toast.error('Target Account ID is required for Bank Step-Up Auth.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await dispatchBankStepUp({
        account_id: effectiveAccountId,
        case_id: effectiveCaseId,
      });
      toast.success(`Bank Step-Up Triggered! Dispatch ID: ${res.dispatch_id}`);
      setConfirmDialog({ isOpen: false, action: null });
    } catch (err: any) {
      toast.error(`Bank Step-Up failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateDossier = async () => {
    if (!effectiveCaseId) {
      toast.error('A Case reference is required to generate a Legal Dossier.');
      return;
    }
    try {
      const res = await generateLegalDossier({
        case_id: effectiveCaseId,
        prediction_data: { prediction_id: `PRED_${node.node_id}`, top_prediction: node },
        sop_data: { sop_tier: sopTier },
      });
      toast.success(`Legal Dossier Generated! SHA-256: ${res.document_hash.slice(0, 16)}...`);
    } catch (err: any) {
      toast.error(`Legal Dossier failed: ${err.message}`);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-slate-950 border-l border-slate-800 text-slate-200 overflow-y-auto ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 sticky top-0 backdrop-blur z-10">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-400 font-bold tracking-wider">{node.node_id}</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono uppercase">
                {node.node_type}
              </span>
            </div>
            <h2 className="text-sm font-semibold text-white mt-1">{node.bank_name || 'Fino Payments Bank'}</h2>
            <p className="text-sm text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
              <span>{node.district || 'New Delhi'}, {node.state || 'Delhi'} ({node.pincode || 110001})</span>
            </p>
          </div>
          <RiskBadge score={vulnScore} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 flex-1">
        {/* Prediction Metrics */}
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-slate-300 font-semibold">SOP Recommended Tier</span>
            <SOPTierBadge tier={sopTier} />
          </div>

          <ConfidenceGauge value={rankerScore} label="Prediction Ranker Prob" />
          <ConfidenceGauge value={vulnScore} label="Node Vulnerability" />
        </div>

        {/* Operational Intelligence Specifications */}
        <div className="space-y-2">
          <h3 className="text-sm font-mono uppercase text-slate-300 tracking-wider">Node Intelligence Profile</h3>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded bg-slate-900/70 border border-slate-800">
              <div className="text-xs text-slate-400 font-mono">Daily Cash Limit</div>
              <div className="text-lg font-semibold text-slate-100 mt-0.5">
                {node.cash_limit_daily !== undefined ? `₹${node.cash_limit_daily.toLocaleString('en-IN')}` : '—'}
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-900/70 border border-slate-800">
              <div className="text-xs text-slate-400 font-mono">Historical Volume</div>
              <div className="text-lg font-semibold text-slate-100 mt-0.5">
                {node.historical_txn_volume !== undefined ? `${node.historical_txn_volume.toLocaleString()} txns` : '—'}
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-900/70 border border-slate-800">
              <div className="text-xs text-slate-400 font-mono">Off-Hour Ratio</div>
              <div className="text-lg font-semibold text-amber-400 mt-0.5">
                {node.off_hour_withdrawal_ratio !== undefined ? `${(node.off_hour_withdrawal_ratio * 100).toFixed(1)}%` : '—'}
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-900/70 border border-slate-800">
              <div className="text-xs text-slate-400 font-mono">Corridor Distance</div>
              <div className="text-lg font-semibold text-emerald-400 mt-0.5">
                {node.distance_to_known_corridor_km !== undefined ? `${node.distance_to_known_corridor_km.toFixed(1)} km` : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Geographic Coordinates */}
        <div className="p-2.5 rounded bg-slate-900/70 border border-slate-800 text-xs font-mono space-y-1">
          <div className="text-xs text-slate-400 font-sans">Geographic Coordinates</div>
          <div className="text-sm text-slate-300 flex items-center justify-between gap-3">
            <span>Lat: {node.latitude?.toFixed(6)} | Lon: {node.longitude?.toFixed(6)}</span>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${node.latitude},${node.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:underline text-xs font-sans whitespace-nowrap"
            >
              Google Maps ↗
            </a>
          </div>
        </div>

        {/* Case & Account Context */}
        <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-xs">
          <div className="font-mono uppercase text-slate-400 font-semibold tracking-wider">
            Operational Context
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Linked Case ID</label>
              <input
                type="text"
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                placeholder="e.g. CASE_20474C9A"
                className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 font-mono text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Target Account ID</label>
              <input
                type="text"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="e.g. ACC_4821"
                className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 font-mono text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <button
            onClick={() => {
              if (!effectiveCaseId) {
                toast.error('Please enter or select a Case ID before PCR Patrol dispatch.');
                return;
              }
              setConfirmDialog({ isOpen: true, action: 'pcr' });
            }}
            className="w-full min-h-10 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50"
          >
            <Radio className="w-3.5 h-3.5" />
            Dispatch Nearest PCR Patrol
          </button>

          <button
            onClick={() => {
              if (!effectiveCaseId) {
                toast.error('Please enter or select a Case ID before Bank Step-Up.');
                return;
              }
              if (!effectiveAccountId) {
                toast.error('Please enter a Target Account ID for Bank Step-Up.');
                return;
              }
              setConfirmDialog({ isOpen: true, action: 'bank' });
            }}
            className="w-full min-h-10 py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            Trigger Bank Step-Up Auth
          </button>

          <button
            onClick={handleGenerateDossier}
            className="w-full min-h-10 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-colors flex items-center justify-center gap-2 border border-slate-700"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            Generate Legal Dossier PDF
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmActionDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, action: null })}
        onConfirm={confirmDialog.action === 'pcr' ? handleDispatchPCR : handleDispatchBank}
        title={confirmDialog.action === 'pcr' ? 'Dispatch PCR Patrol Unit?' : 'Trigger Bank Step-Up Authentication?'}
        description={
          confirmDialog.action === 'pcr'
            ? `Issue immediate patrol dispatch to node ${node.node_id} (${node.district || 'New Delhi'}) for case ${effectiveCaseId}.`
            : `Require biometric/OTP step-up verification for account ${effectiveAccountId || 'target mule'} at target node ${node.node_id}.`
        }
        confirmLabel={confirmDialog.action === 'pcr' ? 'Confirm PCR Dispatch' : 'Confirm Step-Up'}
        variant={confirmDialog.action === 'pcr' ? 'danger' : 'warning'}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
