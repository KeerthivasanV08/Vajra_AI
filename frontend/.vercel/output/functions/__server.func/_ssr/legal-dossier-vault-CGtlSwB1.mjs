import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { r as fetchOfficerCases, l as fetchLegalDossier, m as fetchLegalDossiers, u as generateLegalDossier, D as verifyLegalDossier } from "./api-03VgCQYK.mjs";
import { Route$1 as Route$b, API_BASE } from "./router-DXMls9-H.mjs";
import { E as EvidenceHashBox } from "./EvidenceHashBox-D_8wdgxo.mjs";
import { G as Gavel, u as FileText, D as Download, $ as ShieldCheck } from "../_libs/lucide-react.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./caseNormalizer-BzVobBFG.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
function JsonSection({
  title,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-2 rounded-xl border border-slate-800 bg-slate-900 p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "vajra-section-title uppercase tracking-wider", children: title }),
    value && Object.keys(value).length ? /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "max-h-80 overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm leading-relaxed text-slate-300", children: JSON.stringify(value, null, 2) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "vajra-body-small text-slate-400", children: "Not available in source data." })
  ] });
}
function LegalDossierVaultPage() {
  const search = Route$b.useSearch();
  const [caseId, setCaseId] = reactExports.useState(search.caseId || "");
  const [dossier, setDossier] = reactExports.useState(null);
  const [dossiers, setDossiers] = reactExports.useState([]);
  const [cases, setCases] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [loadingList, setLoadingList] = reactExports.useState(true);
  const [verification, setVerification] = reactExports.useState(null);
  const normalizedCaseId = typeof caseId === "string" ? caseId.trim() : "";
  const loadDossiers = async () => {
    setLoadingList(true);
    try {
      setDossiers((await fetchLegalDossiers(caseId || void 0)).items);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load dossier vault.");
    } finally {
      setLoadingList(false);
    }
  };
  reactExports.useEffect(() => {
    void loadDossiers();
    if (!caseId) void fetchOfficerCases().then(setCases).catch(() => setCases([]));
    if (search.dossierId) void fetchLegalDossier(search.dossierId).then(setDossier).catch(() => toast.error("Dossier not found."));
  }, []);
  const generate = async () => {
    if (!normalizedCaseId) {
      toast.error("Select a real case before generating.");
      return;
    }
    setLoading(true);
    setVerification(null);
    try {
      const result = await generateLegalDossier({
        case_id: normalizedCaseId
      });
      setDossier(result);
      await loadDossiers();
      toast.success("Investigative dossier generated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Dossier generation failed.");
    } finally {
      setLoading(false);
    }
  };
  const selectDossier = async (dossierId) => {
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
      toast[result.verified ? "success" : "error"](result.verified ? "Integrity verified." : "Integrity check failed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Integrity verification failed.");
    }
  };
  const downloadUrl = dossier ? `${API_BASE.replace(/\/$/, "")}/api/v1/legal-dossier/${encodeURIComponent(dossier.dossier_id)}/pdf` : "";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full min-h-0 w-full overflow-hidden bg-slate-950 text-slate-200", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "flex w-80 shrink-0 flex-col gap-4 overflow-y-auto border-r border-slate-800 bg-slate-900/40 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Gavel, { className: "h-6 w-6 text-rose-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "vajra-page-title font-mono uppercase tracking-wider", children: "Legal Dossier Vault" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "vajra-label uppercase", children: "Select Case" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: caseId || "", onChange: (event) => setCaseId(event.target.value), placeholder: "Search Case ID / Account / Alert", className: "w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-sm text-slate-100 placeholder:text-slate-400" }),
        !caseId && cases.slice(0, 8).map((item, index) => {
          const rawCase = item;
          const id = item.caseId || rawCase.case_id || item.id || "";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setCaseId(id), className: "block w-full rounded border border-slate-800 bg-slate-950 px-3 py-2 text-left text-sm hover:bg-slate-800", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-slate-100", children: id || "Case ID unavailable" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-slate-400", children: item.status })
          ] }, id || `case-${index}`);
        })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => void generate(), disabled: loading || !normalizedCaseId, className: "flex min-h-12 items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4" }),
        loading ? "Generating dossier..." : "Generate New Dossier"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 border-t border-slate-800 pt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "vajra-card-title mb-3", children: "Recent Dossiers" }),
        loadingList ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "vajra-body-small text-slate-400", children: "Loading dossier vault..." }) : dossiers.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: dossiers.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => void selectDossier(item.dossier_id), className: "w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-left hover:border-slate-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "break-all font-mono text-sm font-semibold text-slate-100", children: item.dossier_id }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 vajra-body-small", children: [
            "Case ",
            item.case_id,
            " · v",
            item.version,
            " · ",
            item.status
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "vajra-micro mt-1", children: new Date(item.generated_at).toLocaleString() })
        ] }, item.dossier_id || item.case_id || `dossier-${index}`)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "vajra-body-small text-slate-400", children: "No generated dossiers found." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "min-w-0 flex-1 overflow-y-auto p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-5xl space-y-5", children: dossier ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-sm font-bold text-emerald-300", children: dossier.dossier_id }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mt-1 vajra-section-title", children: [
            "Case ",
            dossier.case_id,
            " · Version ",
            dossier.version
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 vajra-body-small", children: [
            "Generated by ",
            dossier.officer_id,
            " ·",
            " ",
            new Date(dossier.generated_at).toLocaleString()
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: downloadUrl, target: "_blank", rel: "noreferrer", className: "inline-flex min-h-11 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }),
            " Download PDF"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => void verify(), className: "inline-flex min-h-11 items-center gap-2 rounded-lg border border-cyan-700 bg-cyan-950/60 px-4 text-sm font-semibold text-cyan-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4" }),
            " Verify Integrity"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-amber-800/70 bg-amber-950/30 p-4 text-sm text-amber-200", children: "System-generated investigative dossier. This document is not a court filing, legal notice, warrant, or certification." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(EvidenceHashBox, { hash: dossier.document_hash, verified: verification?.verified ?? dossier.integrity_status === "VERIFIED", label: "Generated PDF SHA-256" }),
      verification && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg border p-3 text-sm ${verification.verified ? "border-emerald-800 bg-emerald-950/40 text-emerald-200" : "border-rose-800 bg-rose-950/40 text-rose-200"}`, children: [
        verification.verified ? "INTEGRITY VERIFIED" : "INTEGRITY CHECK FAILED",
        " · Stored hash: ",
        verification.stored_hash || "Unavailable",
        " · Current hash:",
        " ",
        verification.actual_hash || "Unavailable"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(JsonSection, { title: "Case Summary", value: dossier.case_summary }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(JsonSection, { title: "Observed Complaint / Case Evidence", value: dossier.complaint }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(JsonSection, { title: "Model Prediction Context", value: dossier.prediction }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(JsonSection, { title: "SOP Decision Context", value: dossier.sop_decision }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(JsonSection, { title: "Data Provenance", value: dossier.data_provenance }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-xl border border-slate-800 bg-slate-900 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "vajra-section-title", children: "Audit Reference" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 vajra-body-small", children: [
          "Audit event:",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-cyan-300", children: dossier.audit_event_id })
        ] })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-[60vh] flex-col items-center justify-center text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Gavel, { className: "mb-4 h-12 w-12 text-slate-700" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "vajra-page-title", children: "Legal Dossier Vault" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 vajra-body max-w-md", children: "Select a real case or an existing dossier to compile and inspect an integrity-verifiable investigative report." })
    ] }) }) })
  ] });
}
export {
  LegalDossierVaultPage as component
};
