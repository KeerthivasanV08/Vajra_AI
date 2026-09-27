import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { Download, FileText, Gavel, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  fetchLegalDossier,
  fetchLegalDossiers,
  fetchOfficerCases,
  generateLegalDossier,
  verifyLegalDossier,
} from "@/services/api";
import { API_BASE } from "@/services/api/client";
import type { AmlCase } from "@/types/api";
import type { DossierVerificationResult, LegalDossierResponse } from "@/types/vajra";
import { EvidenceHashBox } from "@/components/vajra/EvidenceHashBox";

export const Route = createFileRoute("/legal-dossier-vault")({
  validateSearch: (search: Record<string, unknown>) => ({
    caseId:
      typeof search.caseId === "string"
        ? search.caseId
        : typeof search.case_id === "string"
          ? search.case_id
          : undefined,
    dossierId:
      typeof search.dossierId === "string"
        ? search.dossierId
        : typeof search.dossier_id === "string"
          ? search.dossier_id
          : undefined,
  }),
  component: LegalDossierVaultPage,
});

function JsonSection({ title, value }: { title: string; value?: Record<string, unknown> }) {
  return (
    <section className="space-y-2 rounded-xl border border-slate-800 bg-slate-900 p-4">
      <h2 className="vajra-section-title uppercase tracking-wider">{title}</h2>
      {value && Object.keys(value).length ? (
        <pre className="max-h-80 overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm leading-relaxed text-slate-300">
          {JSON.stringify(value, null, 2)}
        </pre>
      ) : (
        <p className="vajra-body-small text-slate-400">Not available in source data.</p>
      )}
    </section>
  );
}

function LegalDossierVaultPage() {
  const search = Route.useSearch();
  const [caseId, setCaseId] = useState(search.caseId || "");
  const [dossier, setDossier] = useState<LegalDossierResponse | null>(null);
  const [dossiers, setDossiers] = useState<LegalDossierResponse[]>([]);
  const [cases, setCases] = useState<AmlCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [verification, setVerification] = useState<DossierVerificationResult | null>(null);
  const normalizedCaseId = typeof caseId === "string" ? caseId.trim() : "";

  const loadDossiers = async () => {
    setLoadingList(true);
    try {
      setDossiers((await fetchLegalDossiers(caseId || undefined)).items);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load dossier vault.");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    void loadDossiers();
    if (!caseId)
      void fetchOfficerCases()
        .then(setCases)
        .catch(() => setCases([]));
    if (search.dossierId)
      void fetchLegalDossier(search.dossierId)
        .then(setDossier)
        .catch(() => toast.error("Dossier not found."));
  }, []);

  const generate = async () => {
    if (!normalizedCaseId) {
      toast.error("Select a real case before generating.");
      return;
    }
    setLoading(true);
    setVerification(null);
    try {
      const result = await generateLegalDossier({ case_id: normalizedCaseId });
      setDossier(result);
      await loadDossiers();
      toast.success("Investigative dossier generated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Dossier generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const selectDossier = async (dossierId: string) => {
    try {
      setDossier(await fetchLegalDossier(dossierId));
      setVerification(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load dossier.");
    }
  };

  const verify = async () => {
    if (!dossier) return;
    try {
      const result = await verifyLegalDossier(dossier.dossier_id);
      setVerification(result);
      toast[result.verified ? "success" : "error"](
        result.verified ? "Integrity verified." : "Integrity check failed.",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Integrity verification failed.");
    }
  };

  const downloadUrl = dossier
    ? `${API_BASE.replace(/\/$/, "")}/api/v1/legal-dossier/${encodeURIComponent(dossier.dossier_id)}/pdf`
    : "";

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden bg-slate-950 text-slate-200">
      <aside className="flex w-80 shrink-0 flex-col gap-4 overflow-y-auto border-r border-slate-800 bg-slate-900/40 p-4">
        <div className="flex items-center gap-2">
          <Gavel className="h-6 w-6 text-rose-500" />
          <h1 className="vajra-page-title font-mono uppercase tracking-wider">
            Legal Dossier Vault
          </h1>
        </div>
        <div className="space-y-2">
          <label className="vajra-label uppercase">Select Case</label>
          <input
            value={caseId || ""}
            onChange={(event) => setCaseId(event.target.value)}
            placeholder="Search Case ID / Account / Alert"
            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-sm text-slate-100 placeholder:text-slate-400"
          />
          {!caseId &&
            cases.slice(0, 8).map((item, index) => {
              const rawCase = item as AmlCase & { case_id?: string };
              const id = item.caseId || rawCase.case_id || item.id || "";
              return (
                <button
                  key={id || `case-${index}`}
                  onClick={() => setCaseId(id)}
                  className="block w-full rounded border border-slate-800 bg-slate-950 px-3 py-2 text-left text-sm hover:bg-slate-800"
                >
                  <span className="font-mono text-slate-100">{id || "Case ID unavailable"}</span>
                  <span className="ml-2 text-slate-400">{item.status}</span>
                </button>
              );
            })}
        </div>
        <button
          onClick={() => void generate()}
          disabled={loading || !normalizedCaseId}
          className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FileText className="h-4 w-4" />
          {loading ? "Generating dossier..." : "Generate New Dossier"}
        </button>
        <div className="flex-1 border-t border-slate-800 pt-4">
          <h2 className="vajra-card-title mb-3">Recent Dossiers</h2>
          {loadingList ? (
            <p className="vajra-body-small text-slate-400">Loading dossier vault...</p>
          ) : dossiers.length ? (
            <div className="space-y-2">
              {dossiers.map((item, index) => (
                <button
                  key={item.dossier_id || item.case_id || `dossier-${index}`}
                  onClick={() => void selectDossier(item.dossier_id)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-left hover:border-slate-600"
                >
                  <div className="break-all font-mono text-sm font-semibold text-slate-100">
                    {item.dossier_id}
                  </div>
                  <div className="mt-1 vajra-body-small">
                    Case {item.case_id} · v{item.version} · {item.status}
                  </div>
                  <div className="vajra-micro mt-1">
                    {new Date(item.generated_at).toLocaleString()}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="vajra-body-small text-slate-400">No generated dossiers found.</p>
          )}
        </div>
      </aside>
      <main className="min-w-0 flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-5xl space-y-5">
          {dossier ? (
            <>
              <header className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4">
                <div>
                  <div className="font-mono text-sm font-bold text-emerald-300">
                    {dossier.dossier_id}
                  </div>
                  <h2 className="mt-1 vajra-section-title">
                    Case {dossier.case_id} · Version {dossier.version}
                  </h2>
                  <p className="mt-1 vajra-body-small">
                    Generated by {dossier.officer_id} ·{" "}
                    {new Date(dossier.generated_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white"
                  >
                    <Download className="h-4 w-4" /> Download PDF
                  </a>
                  <button
                    onClick={() => void verify()}
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-cyan-700 bg-cyan-950/60 px-4 text-sm font-semibold text-cyan-200"
                  >
                    <ShieldCheck className="h-4 w-4" /> Verify Integrity
                  </button>
                </div>
              </header>
              <div className="rounded-xl border border-amber-800/70 bg-amber-950/30 p-4 text-sm text-amber-200">
                System-generated investigative dossier. This document is not a court filing, legal
                notice, warrant, or certification.
              </div>
              <EvidenceHashBox
                hash={dossier.document_hash}
                verified={verification?.verified ?? dossier.integrity_status === "VERIFIED"}
                label="Generated PDF SHA-256"
              />
              {verification && (
                <div
                  className={`rounded-lg border p-3 text-sm ${verification.verified ? "border-emerald-800 bg-emerald-950/40 text-emerald-200" : "border-rose-800 bg-rose-950/40 text-rose-200"}`}
                >
                  {verification.verified ? "INTEGRITY VERIFIED" : "INTEGRITY CHECK FAILED"} · Stored
                  hash: {verification.stored_hash || "Unavailable"} · Current hash:{" "}
                  {verification.actual_hash || "Unavailable"}
                </div>
              )}
              <JsonSection title="Case Summary" value={dossier.case_summary} />
              <JsonSection title="Observed Complaint / Case Evidence" value={dossier.complaint} />
              <JsonSection title="Model Prediction Context" value={dossier.prediction} />
              <JsonSection title="SOP Decision Context" value={dossier.sop_decision} />
              <JsonSection title="Data Provenance" value={dossier.data_provenance} />
              <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <h2 className="vajra-section-title">Audit Reference</h2>
                <p className="mt-2 vajra-body-small">
                  Audit event:{" "}
                  <span className="font-mono text-cyan-300">{dossier.audit_event_id}</span>
                </p>
              </section>
            </>
          ) : (
            <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
              <Gavel className="mb-4 h-12 w-12 text-slate-700" />
              <h2 className="vajra-page-title">Legal Dossier Vault</h2>
              <p className="mt-2 vajra-body max-w-md">
                Select a real case or an existing dossier to compile and inspect an
                integrity-verifiable investigative report.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
