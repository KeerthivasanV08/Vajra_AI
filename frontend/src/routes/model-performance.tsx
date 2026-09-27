import { createFileRoute } from '@tanstack/react-router';
import React, { useState, useEffect } from 'react';
import { fetchModelRegistryMetrics } from '@/services/api';
import type { ModelMetricsResponse } from '@/types/vajra';
import { Cpu, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/model-performance')({
  component: ModelPerformancePage,
});

function ModelPerformancePage() {
  const [modelData, setModelData] = useState<ModelMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetchModelRegistryMetrics();
      setModelData(res);
    } catch (err: any) {
      toast.error(`Failed to load model registry metrics: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 p-4 space-y-4 overflow-y-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <Cpu className="w-6 h-6 text-emerald-400" />
          <div>
            <h1 className="text-sm font-bold text-white font-mono tracking-wider">
              VAJRA ML MODEL REGISTRY & PERFORMANCE SUITE
            </h1>
            <p className="text-xs text-slate-400">Audited Evaluation Metrics & Prototype Warning Notes for Models 1–8</p>
          </div>
        </div>

        <span className="text-xs px-3 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
          8 / 8 MODELS TRAINED
        </span>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {modelData &&
          Object.entries(modelData.models || {}).map(([key, model]) => {
            // Backend returns { model_info: {...}, metrics: {...}, audit_warning }
            // Flatten: support both shapes (nested model_info or flat)
            const info = (model as any).model_info ?? model;
            const rawMetrics = (model as any).metrics ?? (info as any).metrics ?? {};
            const warningNotes: string[] = (model as any).audit_warning
              ? [(model as any).audit_warning]
              : Array.isArray((info as any).warning_notes)
              ? (info as any).warning_notes
              : [];

            return (
            <div
              key={key}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400">{key.toUpperCase()}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800 font-mono">
                    {(info as any).version || 'v1.0'}
                  </span>
                </div>

                <h3 className="text-xs font-semibold text-white">{(info as any).name ?? key}</h3>
                <p className="text-[11px] text-slate-400 leading-tight">{(info as any).purpose ?? (info as any).description ?? '—'}</p>
                <div className="text-[10px] font-mono text-slate-500 pt-1">Alg: {(info as any).algorithm ?? '—'}</div>
              </div>

              {/* Metrics */}
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1 text-[11px] font-mono">
                {Object.entries(rawMetrics).map(([mKey, mVal]) => (
                  <div key={mKey} className="flex justify-between">
                    <span className="text-slate-400">{mKey}:</span>
                    <span className="text-slate-200 font-bold">
                      {typeof mVal === 'number' ? mVal.toFixed(4) : String(mVal)}
                    </span>
                  </div>
                ))}
                {Object.keys(rawMetrics).length === 0 && (
                  <div className="text-slate-600 text-[10px]">No metrics available</div>
                )}
              </div>

              {/* Warning Notes */}
              {warningNotes.length > 0 && (
                <div className="p-2 rounded bg-amber-950/40 border border-amber-800/60 text-[10px] text-amber-300 font-mono space-y-0.5">
                  <div className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span>SYNTHETIC PROTOTYPE NOTE</span>
                  </div>
                  <div>{warningNotes[0]}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
