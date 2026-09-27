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
  sopTier?: SOPTier | string;
  onClose?: () => void;
  className?: string;
}

export function TacticalBrief({ node, caseId = 'CASE_VAJRA_1001', sopTier = 'RECOMMEND-HOLD', onClose, className = '' }: TacticalBriefProps) {
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; action: 'pcr' | 'bank' | null }>({
    isOpen: false,
    action: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!node) {
    return (
      <div className={`p-6 text-center text-slate-500 text-xs flex flex-col items-center justify-center h-full border-l border-slate-800 ${className}`}>
        <Building2 className="w-8 h-8 text-slate-700 mb-2 stroke-[1.5]" />
        <p className="font-medium text-slate-400">No Withdrawal Node Selected</p>
        <p className="text-[11px] text-slate-600 mt-1 max-w-[200px]">
          Select an ATM, Micro-ATM, or AePS CSP node from the list or map to view tactical intelligence.
        </p>
      </div>
    );
  }

  const vulnScore = node.vulnerability_score_reference ?? node.node_vulnerability_score ?? 0.35;
  const rankerScore = node.ranker_score ?? 0.65;

  const handleDispatchPCR = async () => {
    setIsSubmitting(true);
    try {
      const res = await dispatchPCRPatrol({
        case_id: caseId,
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
    setIsSubmitting(true);
    try {
      const res = await dispatchBankStepUp({
        account_id: 'ACC_1001_MULE',
        case_id: caseId,
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
    try {
      const res = await generateLegalDossier({
        case_id: caseId,
        prediction_data: { prediction_id: 'PRED_1001', top_prediction: node },
        sop_data: { sop_tier: sopTier },
      });
      toast.success(`Legal Dossier Generated! SHA-256: ${res.evidence_sha256.slice(0, 16)}...`);
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
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono uppercase">
                {node.node_type}
              </span>
            </div>
            <h2 className="text-sm font-semibold text-white mt-1">{node.bank_name || 'Fino Payments Bank'}</h2>
            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
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
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">SOP Recommended Tier</span>
            <SOPTierBadge tier={sopTier} />
          </div>

          <ConfidenceGauge value={rankerScore} label="Prediction Ranker Prob" />
          <ConfidenceGauge value={vulnScore} label="Node Vulnerability" />
        </div>

        {/* Operational Intelligence Specifications */}
        <div className="space-y-2">
          <h3 className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">Node Intelligence Profile</h3>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded bg-slate-900/70 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-mono">Daily Cash Limit</div>
              <div className="font-semibold text-slate-200 mt-0.5">
                ₹{(node.cash_limit_daily || 100000).toLocaleString('en-IN')}
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-900/70 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-mono">Historical Volume</div>
              <div className="font-semibold text-slate-200 mt-0.5">
                {(node.historical_txn_volume || 15420).toLocaleString()} txns
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-900/70 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-mono">Off-Hour Ratio</div>
              <div className="font-semibold text-amber-400 mt-0.5">
                {((node.off_hour_withdrawal_ratio || 0.14) * 100).toFixed(1)}%
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-900/70 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-mono">Corridor Distance</div>
              <div className="font-semibold text-emerald-400 mt-0.5">
                {(node.distance_to_known_corridor_km || 1.8).toFixed(1)} km
              </div>
            </div>
          </div>
        </div>

        {/* Geographic Coordinates */}
        <div className="p-2.5 rounded bg-slate-900/70 border border-slate-800 text-xs font-mono space-y-1">
          <div className="text-[10px] text-slate-400 font-sans">Geographic Coordinates</div>
          <div className="text-slate-300 flex items-center justify-between">
            <span>Lat: {node.latitude?.toFixed(6)} | Lon: {node.longitude?.toFixed(6)}</span>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${node.latitude},${node.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:underline text-[10px] font-sans"
            >
              Google Maps ↗
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <button
            onClick={() => setConfirmDialog({ isOpen: true, action: 'pcr' })}
            className="w-full py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50"
          >
            <Radio className="w-3.5 h-3.5" />
            Dispatch Nearest PCR Patrol
          </button>

          <button
            onClick={() => setConfirmDialog({ isOpen: true, action: 'bank' })}
            className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            Trigger Bank Step-Up Auth
          </button>

          <button
            onClick={handleGenerateDossier}
            className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors flex items-center justify-center gap-2 border border-slate-700"
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
            ? `Issue immediate patrol dispatch to node ${node.node_id} (${node.district || 'New Delhi'}).`
            : `Require biometric/OTP step-up verification for account ACC_1001_MULE at target ATM.`
        }
        confirmLabel={confirmDialog.action === 'pcr' ? 'Confirm PCR Dispatch' : 'Confirm Step-Up'}
        variant={confirmDialog.action === 'pcr' ? 'danger' : 'warning'}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
