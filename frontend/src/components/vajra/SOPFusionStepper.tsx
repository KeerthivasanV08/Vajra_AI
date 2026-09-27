import React from 'react';
import type { SOPEvaluationResponse } from '@/types/vajra';
import { ShieldAlert, Globe } from 'lucide-react';
import { SOP_ZONES, scoreToThresholdPosition, softAlertMarkerRegressionPasses, thresholdZoneWidth } from './sopThresholds';

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
  const calibrationTrained = sop?.calibration_trained ?? false;

  return (
    <div className={`p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-blue-400" />
          Model 6 Weighted SOP Fusion Engine
        </h3>
        {/* Tier is shown once in the page header to avoid duplicate status sources. */}
      </div>

      {/* Stepper Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center text-xs">
        {/* Step 1: Digital */}
        <div className={`p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-1 ${isOverride ? 'opacity-40' : ''}`}>
          <div className="text-[10px] text-slate-400 font-mono">Digital Risk (45%)</div>
          <div className="text-sm font-bold text-blue-400 font-mono">{(digitalScore * 100).toFixed(0)}%</div>
          <div className="text-[10px] text-slate-500 font-mono">Contrib: {(digitalScore * fusion.digital).toFixed(3)} <span title={`Contribution = weight × signal value (${fusion.digital.toFixed(2)} × ${(digitalScore * 100).toFixed(0)}% = ${(digitalScore * fusion.digital).toFixed(3)})`} className="cursor-help text-slate-300" aria-label="Contribution calculation help">?</span></div>
        </div>

        <div className="hidden md:flex justify-center text-slate-600">+</div>

        {/* Step 2: Physical */}
        <div className={`p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-1 ${isOverride ? 'opacity-40' : ''}`}>
          <div className="text-[10px] text-slate-400 font-mono">Physical Risk (35%)</div>
          <div className="text-sm font-bold text-amber-400 font-mono">{(physicalScore * 100).toFixed(0)}%</div>
          <div className="text-[10px] text-slate-500 font-mono">Contrib: {(physicalScore * fusion.physical).toFixed(3)} <span title={`Contribution = weight × signal value (${fusion.physical.toFixed(2)} × ${(physicalScore * 100).toFixed(0)}% = ${(physicalScore * fusion.physical).toFixed(3)})`} className="cursor-help text-slate-300" aria-label="Contribution calculation help">?</span></div>
        </div>

        <div className="hidden md:flex justify-center text-slate-600">+</div>

        {/* Step 3: Context */}
        <div className={`p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-1 ${isOverride ? 'opacity-40' : ''}`}>
          <div className="text-[10px] text-slate-400 font-mono">Context Signal (20%)</div>
          <div className="text-sm font-bold text-slate-300 font-mono">{(contextScore * 100).toFixed(0)}%</div>
          <div className="text-[10px] text-slate-500 font-mono">Contrib: {(contextScore * fusion.context).toFixed(3)} <span title={`Contribution = weight × signal value (${fusion.context.toFixed(2)} × ${(contextScore * 100).toFixed(0)}% = ${(contextScore * fusion.context).toFixed(3)})`} className="cursor-help text-slate-300" aria-label="Contribution calculation help">?</span></div>
        </div>
      </div>

      {/* Threshold visualization */}
      <div className="space-y-2">
        <div className="relative h-3 text-[10px] font-mono text-slate-500">{[0, 0.5, 0.7, 0.85, 1].map((boundary) => <span key={boundary} className="absolute -translate-x-1/2" style={{ left: `${scoreToThresholdPosition(boundary)}%` }}>{boundary.toFixed(2)}</span>)}</div>
        <div className="relative flex h-3 overflow-visible rounded-full">
          {SOP_ZONES.map((zone) => <div key={zone.label} className={zone.color} style={{ width: `${thresholdZoneWidth(zone.start, zone.end)}%` }} />)}
          {[0.5, 0.7, 0.85].map((boundary) => <div key={boundary} className="absolute top-0 z-10 h-3 w-px bg-slate-950/80" style={{ left: `${scoreToThresholdPosition(boundary)}%` }} />)}
          <div data-testid="sop-score-marker" data-zone={SOP_ZONES.find((zone) => calibratedScore >= zone.start && calibratedScore <= zone.end)?.label} data-regression-soft-alert={softAlertMarkerRegressionPasses} className="absolute -top-1 z-20 h-5 w-0.5 bg-white shadow-[0_0_0_2px_rgba(15,23,42,0.8)] transition-[left] duration-150" style={{ left: `${scoreToThresholdPosition(calibratedScore)}%` }} aria-label={`Current calibrated score ${(calibratedScore * 100).toFixed(1)} percent`} />
        </div>
        <div className="flex justify-between text-[10px] font-mono"><span className="text-slate-400">MONITOR</span><span className="text-amber-400">SOFT-ALERT</span><span className="text-orange-400">RECOMMEND-HOLD</span><span className="text-rose-400">ESCALATE-FREEZE</span></div>
      </div>

      {/* Cross Border Override Banner */}
      {isOverride && (
        <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2 font-mono">
          <Globe className="w-4 h-4 text-purple-400 shrink-0" />
          <span>
            <strong>CROSS-BORDER OVERRIDE ACTIVE:</strong> Normal weighted fusion bypassed per cross-border detection policy.
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
          <span className="text-slate-400">Isotonic Calibrated Score{calibrationTrained ? ': ' : ' (model not yet trained — showing raw score): '}</span>
          <span className="font-bold text-emerald-400">{calibratedScore.toFixed(4)}</span>
        </div>
      </div>
    </div>
  );
}
