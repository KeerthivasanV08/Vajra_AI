import { createFileRoute } from '@tanstack/react-router';
import React, { useState } from 'react';
import { generateLegalDossier } from '@/services/api';
import { API_BASE } from '@/services/api/client';
import type { LegalDossierResponse } from '@/types/vajra';
import { Gavel, Download, CheckCircle2, ShieldCheck, FileText } from 'lucide-react';
import { EvidenceHashBox } from '@/components/vajra/EvidenceHashBox';
import { toast } from 'sonner';

export const Route = createFileRoute('/legal-dossier-vault')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      caseId: typeof search.caseId === 'string' ? search.caseId : undefined,
    };
  },
  component: LegalDossierVaultPage,
});

function LegalDossierVaultPage() {
  const search = Route.useSearch();
  const [caseId, setCaseId] = useState(search.caseId || 'CASE_VAJRA_1001');
  const [dossier, setDossier] = useState<LegalDossierResponse | null>(null);
  const [recentDossiers, setRecentDossiers] = useState<Array<{ id: string; date: string; data?: LegalDossierResponse }>>([
    { id: 'DOSSIER_CASE_VAJRA_1001', date: 'Sept 27, 2026' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (targetCaseId?: string) => {
    const idToUse = targetCaseId || caseId;
    setLoading(true);
    try {
      const res = await generateLegalDossier({
        case_id: idToUse,
        prediction_data: { prediction_id: 'PRED_1001', score: 0.88 },
        sop_data: { sop_tier: 'ESCALATE_FREEZE' },
      });
      setDossier(res);
      setRecentDossiers(prev => {
        const filtered = prev.filter(d => d.id !== res.dossier_id);
        return [{ id: res.dossier_id, date: new Date(res.created_at).toLocaleDateString(), data: res }, ...filtered];
      });
      toast.success('Court-Ready Legal Dossier PDF Generated!');
    } catch (err: any) {
      toast.error(`Generation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!dossier) return;
    const base = API_BASE.replace(/\/$/, '');
    const url = `${base}/api/v1/legal-dossier/${encodeURIComponent(dossier.dossier_id)}/pdf`;
    window.open(url, '_blank');
    toast.info(`Downloading PDF for Dossier ${dossier.dossier_id}`);
  };

  return (
    <div className="flex h-full w-full bg-slate-950 text-slate-200 overflow-hidden select-none">
      {/* Left List Pane */}
      <div className="w-80 shrink-0 border-r border-slate-800 p-4 space-y-4 bg-slate-900/40 flex flex-col">
        <div className="flex items-center gap-2">
          <Gavel className="w-5 h-5 text-rose-500" />
          <h1 className="text-sm font-bold text-white font-mono tracking-wider">
            LEGAL DOSSIER VAULT
          </h1>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-slate-400 font-mono">Case Reference</label>
          <input
            type="text"
            value={caseId}
            onChange={(e) => setCaseId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
          />
        </div>

        <button
          onClick={() => handleGenerate()}
          disabled={loading}
          className="w-full py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50 disabled:opacity-50"
        >
          <FileText className="w-4 h-4" />
          {loading ? 'Generating PDF...' : 'Generate New Dossier'}
        </button>

        <div className="border-t border-slate-800 pt-3 text-[11px] text-slate-500 space-y-2 font-mono flex-1 overflow-y-auto">
          <div className="text-slate-400 font-sans font-medium">Recent Dossiers</div>
          {recentDossiers.map((d) => (
            <div
              key={d.id}
              onClick={() => {
                if (d.data) {
                  setDossier(d.data);
                } else {
                  handleGenerate(d.id.replace('DOSSIER_', ''));
                }
              }}
              className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
            >
              <div className="font-bold text-slate-200 truncate">{d.id}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Created: {d.date}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Complete Detail Workspace */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {dossier ? (
          <>
            {/* Action Banner */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-400">{dossier.dossier_id}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                    COURT-READY VERIFIED
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Issuing Officer: {dossier.issuing_officer} • Created: {new Date(dossier.created_at).toLocaleString()}
                </div>
              </div>

              <button
                onClick={handleDownloadPdf}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-lg shadow-emerald-950/50"
              >
                <Download className="w-4 h-4" />
                Download PDF Package
              </button>
            </div>

            {/* Evidence Hash Container */}
            <EvidenceHashBox
              hash={dossier.evidence_sha256}
              verified={dossier.integrity_verified}
            />

            {/* Section Breakdown */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <h3 className="text-xs font-mono font-semibold text-slate-300 uppercase">
                  SECTION A — COMPLAINT & INITIAL DETECTION
                </h3>
                <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono overflow-x-auto">
                  {JSON.stringify(dossier.sections?.complaint, null, 2)}
                </pre>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <h3 className="text-xs font-mono font-semibold text-slate-300 uppercase">
                  SECTION B — PHYSICAL PREDICTION & CANDIDATE RANKINGS
                </h3>
                <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono overflow-x-auto">
                  {JSON.stringify(dossier.sections?.prediction, null, 2)}
                </pre>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <h3 className="text-xs font-mono font-semibold text-slate-300 uppercase">
                  SECTION C — PRESERVATION DIRECTIVES & LEGAL NOTICES
                </h3>
                <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono overflow-x-auto">
                  {JSON.stringify(dossier.sections?.preservation_directives, null, 2)}
                </pre>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs">
            <Gavel className="w-12 h-12 text-slate-700 mb-3 stroke-[1.5]" />
            <p className="font-semibold text-slate-300 text-sm">Legal Dossier Vault Ready</p>
            <p className="text-slate-500 mt-1">Select or generate a dossier to view compiled court evidence and download PDF.</p>
          </div>
        )}
      </div>
    </div>
  );
}
