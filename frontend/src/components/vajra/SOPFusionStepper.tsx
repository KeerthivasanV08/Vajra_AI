import React from 'react';
import type { SOPEvaluationResponse } from '@/types/vajra';
import { ArrowRight, ShieldAlert, Globe } from 'lucide-react';
import { SOPTierBadge } from './SOPTierBadge';

interface SOPFusionStepperProps {
  sop?: SOPEvaluationResponse | null;
  digitalScore?: number;
  physicalScore?: number;
  contextScore?: number;
  className?: string;
}

export function SOPFusionStepper({ sop, digitalScore = 0.75, physicalScore = 0.68, contextScore = 0.50, className = '' }: SOPFusionStepperProps) {
  const fusion = sop?.fusion_weights || { digital: 0.45, physical: 0.35, context: 0.20 };
  const rawScore = sop?.raw_fusion_score ?? (digitalScore * 0.45 + physicalScore * 0.35 + contextScore * 0.20);
  const calibratedScore = sop?.calibrated_score ?? rawScore;
  const isOverride = sop?.cross_border_override ?? false;
  const tier = sop?.sop_tier ?? 'RECOMMEND-HOLD';

  return (
    <div className={`p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-blue-400" />
          Model 6 Weighted SOP Fusion Engine
        </h3>
        <SOPTierBadge tier={tier} />
      </div>

      {/* Stepper Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center text-xs">
        {/* Step 1: Digital */}
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-1">
          <div className="text-[10px] text-slate-400 font-mono">Digital Risk (45%)</div>
          <div className="text-sm font-bold text-blue-400 font-mono">{(digitalScore * 100).toFixed(0)}%</div>
          <div className="text-[10px] text-slate-500 font-mono">Contrib: {(digitalScore * fusion.digital).toFixed(3)}</div>
        </div>

        <div className="hidden md:flex justify-center text-slate-600">+</div>

        {/* Step 2: Physical */}
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-1">
          <div className="text-[10px] text-slate-400 font-mono">Physical Risk (35%)</div>
          <div className="text-sm font-bold text-amber-400 font-mono">{(physicalScore * 100).toFixed(0)}%</div>
          <div className="text-[10px] text-slate-500 font-mono">Contrib: {(physicalScore * fusion.physical).toFixed(3)}</div>
        </div>

        <div className="hidden md:flex justify-center text-slate-600">+</div>

        {/* Step 3: Context */}
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-1">
          <div className="text-[10px] text-slate-400 font-mono">Context Signal (20%)</div>
          <div className="text-sm font-bold text-slate-300 font-mono">{(contextScore * 100).toFixed(0)}%</div>
          <div className="text-[10px] text-slate-500 font-mono">Contrib: {(contextScore * fusion.context).toFixed(3)}</div>
        </div>
      </div>

      {/* Cross Border Override Banner */}
      {isOverride && (
        <div className="p-2.5 rounded-lg bg-purple-950/80 border border-purple-800 text-purple-200 text-xs flex items-center gap-2 font-mono">
          <Globe className="w-4 h-4 text-purple-400 shrink-0" />
          <span>
            <strong>CROSS-BORDER OVERRIDE ACTIVE:</strong> Imminent overseas shift detected. SOP tier overridden to INTERNATIONAL_ALERT_OVERRIDE.
          </span>
        </div>
      )}

      {/* Output Scores */}
      <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
        <div>
          <span className="text-slate-400">Raw Fusion Score: </span>
          <span className="font-semibold text-slate-200">{rawScore.toFixed(4)}</span>
        </div>
        <div>
          <span className="text-slate-400">Isotonic Calibrated Score: </span>
          <span className="font-bold text-emerald-400">{calibratedScore.toFixed(4)}</span>
        </div>
      </div>
    </div>
  );
}
