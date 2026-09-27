import { createFileRoute } from '@tanstack/react-router';
import React, { useState, useEffect } from 'react';
import { evaluateSOP } from '@/services/api';
import type { SOPEvaluationResponse } from '@/types/vajra';
import { Cpu, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { SOPFusionStepper } from '@/components/vajra/SOPFusionStepper';
import { SOPTierBadge } from '@/components/vajra/SOPTierBadge';
import { toast } from 'sonner';

export const Route = createFileRoute('/sop-triage')({
  component: SOPTriagePage,
});

function SOPTriagePage() {
  const [digitalScore, setDigitalScore] = useState(0.75);
  const [physicalScore, setPhysicalScore] = useState(0.68);
  const [contextScore, setContextScore] = useState(0.50);
  const [imminentOverseas, setImminentOverseas] = useState(false);
  const [sopResult, setSopResult] = useState<SOPEvaluationResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const runEvaluation = async () => {
    setLoading(true);
    try {
      const res = await evaluateSOP({
        digital_risk_score: digitalScore,
        physical_prediction_score: physicalScore,
        context_score: contextScore,
        imminent_overseas_shift: imminentOverseas,
      });
      setSopResult(res);
    } catch (err: any) {
      toast.error(`SOP Evaluation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runEvaluation();
  }, [digitalScore, physicalScore, contextScore, imminentOverseas]);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 p-4 space-y-4 overflow-y-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <Cpu className="w-6 h-6 text-rose-500" />
          <div>
            <h1 className="text-sm font-bold text-white font-mono tracking-wider">
              MODEL 6 SOP TRIAGE & ISOTONIC CALIBRATION CONSOLE
            </h1>
            <p className="text-xs text-slate-400">Operational Action Tier Calibration & Disparate Impact Evaluation</p>
          </div>
        </div>

        {sopResult && <SOPTierBadge tier={sopResult.sop_tier} className="text-xs py-1 px-3" />}
      </div>

      {/* Interactive Controls & Calibration Inputs */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h2 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
          Risk Signal Sliders & Controls
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          {/* Digital Risk */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between font-mono">
              <span className="text-slate-400">Digital Risk (45%)</span>
              <span className="text-blue-400 font-bold">{(digitalScore * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={digitalScore}
              onChange={(e) => setDigitalScore(parseFloat(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          {/* Physical Risk */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between font-mono">
              <span className="text-slate-400">Physical Prediction (35%)</span>
              <span className="text-amber-400 font-bold">{(physicalScore * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={physicalScore}
              onChange={(e) => setPhysicalScore(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Context Risk */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between font-mono">
              <span className="text-slate-400">Context Risk (20%)</span>
              <span className="text-slate-300 font-bold">{(contextScore * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={contextScore}
              onChange={(e) => setContextScore(parseFloat(e.target.value))}
              className="w-full accent-slate-500 cursor-pointer"
            />
          </div>

          {/* Cross Border Override Checkbox */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-purple-300 font-mono font-medium block">Cross-Border Shift</span>
              <span className="text-[10px] text-slate-500">Imminent Overseas Override</span>
            </div>
            <input
              type="checkbox"
              checked={imminentOverseas}
              onChange={(e) => setImminentOverseas(e.target.checked)}
              className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* SOP Fusion Stepper */}
      <SOPFusionStepper
        sop={sopResult}
        digitalScore={digitalScore}
        physicalScore={physicalScore}
        contextScore={contextScore}
      />

      {/* Explanations & Action Description */}
      {sopResult && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
          <div className="font-mono text-slate-400 font-semibold uppercase tracking-wider">Action Description</div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono">
            {sopResult.action_description}
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed pt-1">
            {sopResult.legal_authority_disclaimer}
          </p>
        </div>
      )}
    </div>
  );
}
