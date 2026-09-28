import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as fetchAuditChain, x as reverifyAuditChain } from "./api-03VgCQYK.mjs";
import { E as EvidenceHashBox } from "./EvidenceHashBox-D_8wdgxo.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { F as FileCheck, $ as ShieldCheck, U as RefreshCw } from "../_libs/lucide-react.mjs";
import "./caseNormalizer-BzVobBFG.mjs";
import "./router-DXMls9-H.mjs";
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
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
function AuditComplianceLedgerPage() {
  const [chain, setChain] = reactExports.useState([]);
  const [reverifyResult, setReverifyResult] = reactExports.useState(null);
  const [selectedEvent, setSelectedEvent] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [verifying, setVerifying] = reactExports.useState(false);
  const loadChain = async () => {
    setLoading(true);
    try {
      const res = await fetchAuditChain();
      setChain(res.chain || []);
      if (res.chain?.length > 0) {
        setSelectedEvent(res.chain[0]);
      }
    } catch (err) {
      toast.error(`Failed to load audit chain: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  const handleReverify = async () => {
    setVerifying(true);
    try {
      const res = await reverifyAuditChain();
      setReverifyResult(res);
      if (res.verified) {
        toast.success(`Audit Chain Verified! Checked ${res.events_checked} events.`);
      } else {
        toast.error(`Audit Verification Failed: ${res.failure_reason}`);
      }
    } catch (err) {
      toast.error(`Reverification error: ${err.message}`);
    } finally {
      setVerifying(false);
    }
  };
  reactExports.useEffect(() => {
    loadChain();
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full w-full bg-slate-950 text-slate-200 overflow-hidden select-none", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between gap-4 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileCheck, { className: "w-5 h-5 text-emerald-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-sm font-bold text-white font-mono tracking-wider", children: "CRYPTOGRAPHIC AUDIT LEDGER" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono", children: [
            chain.length,
            " EVENTS LOGGED"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleReverify, disabled: verifying, className: "px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 disabled:opacity-50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-3.5 h-3.5" }),
            verifying ? "Verifying Chain..." : "Re-verify Hash Chain"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: loadChain, className: "p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `w-3.5 h-3.5 ${loading ? "animate-spin" : ""}` }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto p-3 scrollbar-thin space-y-2", children: chain.map((event, idx) => {
        const isSelected = selectedEvent?.event_id === event.event_id;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => setSelectedEvent(event), className: `min-h-12 p-3 rounded-xl border transition-colors cursor-pointer flex items-center justify-between gap-4 ${isSelected ? "bg-slate-900 border-slate-700 shadow-md" : "bg-slate-950/70 border-slate-800/80 hover:border-slate-700"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "w-6 h-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-mono text-[10px] text-slate-400 shrink-0", children: [
              "#",
              idx + 1
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-mono font-bold text-white truncate", children: event.action_type }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-emerald-400 font-mono", children: event.event_id })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-slate-300 font-mono truncate mt-0.5", children: [
                "Target: ",
                event.target_entity,
                " • Officer: ",
                event.officer_id
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-mono text-slate-300", children: new Date(event.timestamp).toLocaleTimeString() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono", children: "SHA-256 LINKED" })
          ] })
        ] }, event.event_id || idx);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-96 shrink-0 h-full border-l border-slate-800 p-4 space-y-4 overflow-y-auto bg-slate-950", children: selectedEvent ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-slate-800 pb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-mono text-emerald-400 uppercase font-bold", children: selectedEvent.event_id }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-white font-mono mt-0.5", children: selectedEvent.action_type }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-slate-400 mt-1 font-mono", children: [
          "Timestamp: ",
          new Date(selectedEvent.timestamp).toLocaleString()
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(EvidenceHashBox, { label: "Event Cryptographic Signature", hash: selectedEvent.event_hash, verified: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-xs font-mono", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-slate-500 block", children: "Payload Hash" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-300 break-all text-[11px]", children: selectedEvent.payload_hash })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-slate-500 block", children: "Previous Chain Hash" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-300 break-all text-[11px]", children: selectedEvent.previous_hash })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-slate-500 block", children: "Issuing Officer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-200 font-bold", children: selectedEvent.officer_id })
        ] })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-500 text-center py-6", children: "Select an event to view hashes" }) })
  ] });
}
export {
  AuditComplianceLedgerPage as component
};
