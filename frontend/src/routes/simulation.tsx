import { createFileRoute } from '@tanstack/react-router';
import React, { useState } from 'react';
import { runLiveAttackSimulation } from '@/services/api';
import type { SimulationResult } from '@/types/vajra';
import { Zap, Play, CheckCircle2, ArrowRight, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/simulation')({
  component: SimulationPage,
});

function SimulationPage() {
  const [victimId, setVictimId] = useState('ACC_VICTIM_999');
  const [stolenAmount, setStolenAmount] = useState(250000);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRunSim = async () => {
    setLoading(true);
    try {
      const res = await runLiveAttackSimulation({
        victim_account_id: victimId.trim() || undefined,
        initial_amount_inr: Number(stolenAmount) || 250000,
      });
      setSimResult(res);
      toast.success('Live Multi-Hop Fraud Simulation Complete!');
    } catch (err: any) {
      toast.error(`Simulation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 p-4 space-y-4 overflow-y-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <Zap className="w-6 h-6 text-amber-400" />
          <div>
            <h1 className="text-sm font-bold text-white font-mono tracking-wider">
              LIVE MULTI-HOP FRAUD ATTACK SIMULATOR
            </h1>
            <p className="text-xs text-slate-400">Simulate Real-Time Victim-to-Mule Layering & Predicted Physical Cash-Out Interception</p>
          </div>
        </div>

        <button
          onClick={handleRunSim}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-lg shadow-amber-950/50 disabled:opacity-50 font-mono"
        >
          <Play className="w-4 h-4 fill-current" />
          {loading ? 'Simulating Attack Stream...' : 'TRIGGER LIVE FRAUD ATTACK SIMULATION'}
        </button>
      </div>

      {/* Input Form */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="space-y-1">
            <span className="text-slate-400">Victim Account ID</span>
            <input
              type="text"
              value={victimId}
              onChange={(e) => setVictimId(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-3 py-1 text-slate-200"
            />
          </div>
          <div className="space-y-1">
            <span className="text-slate-400">Stolen Amount (INR)</span>
            <input
              type="number"
              min={1000}
              step={10000}
              value={stolenAmount}
              onChange={(e) => setStolenAmount(Number(e.target.value) || 0)}
              className="bg-slate-950 border border-slate-800 rounded px-3 py-1 text-emerald-400 font-bold w-36"
            />
          </div>
        </div>
      </div>

      {/* Simulation Stream Output */}
      {simResult && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-xs font-mono font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Simulated Event Telemetry Stream
            </h3>

            <div className="space-y-2 font-mono text-xs">
              {simResult.events?.map((ev, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[10px]">Step {ev.step}</span>
                    <span className="text-slate-300 font-bold">{ev.from_account}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-slate-300 font-bold">{ev.to_account}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold">₹{ev.amount?.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800">
                      {ev.risk_tier}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
