import { r as reactExports, R as React, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { S as SOPTierBadge } from "./SOPTierBadge-DkteLLAU.mjs";
import { R as RiskBadge } from "./RiskBadge-OTALS72R.mjs";
import { u as generateLegalDossier, c as dispatchPCRPatrol, d as dispatchBankStepUp } from "./api-03VgCQYK.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { i as Building2, H as MapPin, T as Radio, O as OctagonAlert, l as CircleCheck, a5 as TriangleAlert, ad as X, $ as ShieldCheck } from "../_libs/lucide-react.mjs";
function ConfidenceGauge({ value, label = "Confidence", className = "" }) {
  const normValue = value > 1 ? value / 100 : value;
  const pct = Math.min(100, Math.max(0, Math.round(normValue * 100)));
  let colorClass = "text-emerald-400 bg-emerald-500";
  if (pct >= 80) colorClass = "text-rose-400 bg-rose-500";
  else if (pct >= 60) colorClass = "text-amber-400 bg-amber-500";
  else if (pct >= 40) colorClass = "text-blue-400 bg-blue-500";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-2 ${className}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `h-full transition-all duration-500 ${colorClass.split(" ")[1]}`,
        style: { width: `${pct}%` }
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 font-mono text-sm whitespace-nowrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-slate-300", children: [
        label,
        ":"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-semibold ${colorClass.split(" ")[0]}`, children: [
        pct,
        "%"
      ] })
    ] })
  ] });
}
function ConfirmActionDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm Action",
  variant = "warning",
  isSubmitting = false
}) {
  if (!isOpen) return null;
  let btnColor = "bg-amber-600 hover:bg-amber-500 text-white";
  if (variant === "danger") btnColor = "bg-rose-600 hover:bg-rose-500 text-white";
  else if (variant === "info") btnColor = "bg-blue-600 hover:bg-blue-500 text-white";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `p-2 rounded-lg ${variant === "danger" ? "bg-rose-950 text-rose-400" : "bg-amber-950 text-amber-400"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-5 h-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-slate-100", children: title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-400 mt-0.5", children: description })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "text-slate-500 hover:text-slate-300 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed font-sans", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-amber-400", children: "Operational Disclaimer:" }),
      " Seizure, freezing, or physical dispatch requests are recorded in the cryptographic audit chain with your Officer ID."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2.5 pt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onClose,
          disabled: isSubmitting,
          className: "px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50",
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: onConfirm,
          disabled: isSubmitting,
          className: `px-4 py-1.5 rounded-lg text-xs font-semibold shadow-lg transition-colors flex items-center gap-1.5 ${btnColor} disabled:opacity-50`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-3.5 h-3.5" }),
            isSubmitting ? "Processing..." : confirmLabel
          ]
        }
      )
    ] })
  ] }) });
}
function TacticalBrief({
  node,
  caseId: initialCaseId = "",
  accountId: initialAccountId = "",
  sopTier = "RECOMMEND-HOLD",
  onClose,
  className = ""
}) {
  const [caseId, setCaseId] = reactExports.useState(initialCaseId);
  const [accountId, setAccountId] = reactExports.useState(initialAccountId);
  const [confirmDialog, setConfirmDialog] = reactExports.useState({
    isOpen: false,
    action: null
  });
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  React.useEffect(() => {
    if (initialCaseId) setCaseId(initialCaseId);
  }, [initialCaseId]);
  React.useEffect(() => {
    if (initialAccountId) setAccountId(initialAccountId);
  }, [initialAccountId]);
  if (!node) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-6 text-center text-slate-500 text-xs flex flex-col items-center justify-center h-full border-l border-slate-800 ${className}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-8 h-8 text-slate-700 mb-2 stroke-[1.5]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-slate-400", children: "No Withdrawal Node Selected" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500 mt-1 max-w-[220px]", children: "Select an ATM, Micro-ATM, or AePS CSP node from the list or map to view tactical intelligence." })
    ] });
  }
  const vulnScore = node.vulnerability_score_reference ?? node.node_vulnerability_score ?? 0.35;
  const rankerScore = node.ranker_score ?? 0.65;
  const effectiveCaseId = caseId.trim();
  const effectiveAccountId = accountId.trim();
  const handleDispatchPCR = async () => {
    if (!effectiveCaseId) {
      toast.error("A Case reference is required for PCR Patrol dispatch.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await dispatchPCRPatrol({
        case_id: effectiveCaseId,
        target_node_id: node.node_id,
        target_lat: node.latitude,
        target_lon: node.longitude
      });
      toast.success(`PCR Patrol Dispatched! Dispatch ID: ${res.dispatch_id}`);
      setConfirmDialog({ isOpen: false, action: null });
    } catch (err) {
      toast.error(`PCR Dispatch failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDispatchBank = async () => {
    if (!effectiveCaseId) {
      toast.error("A Case reference is required for Bank Step-Up Auth.");
      return;
    }
    if (!effectiveAccountId) {
      toast.error("Target Account ID is required for Bank Step-Up Auth.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await dispatchBankStepUp({
        account_id: effectiveAccountId,
        case_id: effectiveCaseId
      });
      toast.success(`Bank Step-Up Triggered! Dispatch ID: ${res.dispatch_id}`);
      setConfirmDialog({ isOpen: false, action: null });
    } catch (err) {
      toast.error(`Bank Step-Up failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleGenerateDossier = async () => {
    if (!effectiveCaseId) {
      toast.error("A Case reference is required to generate a Legal Dossier.");
      return;
    }
    try {
      const res = await generateLegalDossier({
        case_id: effectiveCaseId,
        prediction_data: { prediction_id: `PRED_${node.node_id}`, top_prediction: node },
        sop_data: { sop_tier: sopTier }
      });
      toast.success(`Legal Dossier Generated! SHA-256: ${res.document_hash.slice(0, 16)}...`);
    } catch (err) {
      toast.error(`Legal Dossier failed: ${err.message}`);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex flex-col h-full bg-slate-950 border-l border-slate-800 text-slate-200 overflow-y-auto ${className}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 border-b border-slate-800 bg-slate-900/60 sticky top-0 backdrop-blur z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-mono text-emerald-400 font-bold tracking-wider", children: node.node_id }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono uppercase", children: node.node_type })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-white mt-1", children: node.bank_name || "Fino Payments Bank" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-slate-400 flex items-center gap-1 mt-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-3 h-3 text-rose-400 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            node.district || "New Delhi",
            ", ",
            node.state || "Delhi",
            " (",
            node.pincode || 110001,
            ")"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(RiskBadge, { score: vulnScore })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-4 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-300 font-semibold", children: "SOP Recommended Tier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SOPTierBadge, { tier: sopTier })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ConfidenceGauge, { value: rankerScore, label: "Prediction Ranker Prob" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ConfidenceGauge, { value: vulnScore, label: "Node Vulnerability" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-mono uppercase text-slate-300 tracking-wider", children: "Node Intelligence Profile" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2.5 rounded bg-slate-900/70 border border-slate-800", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-400 font-mono", children: "Daily Cash Limit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-semibold text-slate-100 mt-0.5", children: node.cash_limit_daily !== void 0 ? `₹${node.cash_limit_daily.toLocaleString("en-IN")}` : "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2.5 rounded bg-slate-900/70 border border-slate-800", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-400 font-mono", children: "Historical Volume" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-semibold text-slate-100 mt-0.5", children: node.historical_txn_volume !== void 0 ? `${node.historical_txn_volume.toLocaleString()} txns` : "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2.5 rounded bg-slate-900/70 border border-slate-800", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-400 font-mono", children: "Off-Hour Ratio" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-semibold text-amber-400 mt-0.5", children: node.off_hour_withdrawal_ratio !== void 0 ? `${(node.off_hour_withdrawal_ratio * 100).toFixed(1)}%` : "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2.5 rounded bg-slate-900/70 border border-slate-800", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-400 font-mono", children: "Corridor Distance" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-semibold text-emerald-400 mt-0.5", children: node.distance_to_known_corridor_km !== void 0 ? `${node.distance_to_known_corridor_km.toFixed(1)} km` : "—" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2.5 rounded bg-slate-900/70 border border-slate-800 text-xs font-mono space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-400 font-sans", children: "Geographic Coordinates" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-slate-300 flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Lat: ",
            node.latitude?.toFixed(6),
            " | Lon: ",
            node.longitude?.toFixed(6)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "a",
            {
              href: `https://www.google.com/maps/search/?api=1&query=${node.latitude},${node.longitude}`,
              target: "_blank",
              rel: "noreferrer",
              className: "text-blue-400 hover:underline text-xs font-sans whitespace-nowrap",
              children: "Google Maps ↗"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono uppercase text-slate-400 font-semibold tracking-wider", children: "Operational Context" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] text-slate-400 block mb-0.5", children: "Linked Case ID" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: caseId,
                onChange: (e) => setCaseId(e.target.value),
                placeholder: "e.g. CASE_20474C9A",
                className: "w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 font-mono text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-rose-500"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] text-slate-400 block mb-0.5", children: "Target Account ID" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: accountId,
                onChange: (e) => setAccountId(e.target.value),
                placeholder: "e.g. ACC_4821",
                className: "w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 font-mono text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 pt-2 border-t border-slate-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => {
              if (!effectiveCaseId) {
                toast.error("Please enter or select a Case ID before PCR Patrol dispatch.");
                return;
              }
              setConfirmDialog({ isOpen: true, action: "pcr" });
            },
            className: "w-full min-h-10 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "w-3.5 h-3.5" }),
              "Dispatch Nearest PCR Patrol"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => {
              if (!effectiveCaseId) {
                toast.error("Please enter or select a Case ID before Bank Step-Up.");
                return;
              }
              if (!effectiveAccountId) {
                toast.error("Please enter a Target Account ID for Bank Step-Up.");
                return;
              }
              setConfirmDialog({ isOpen: true, action: "bank" });
            },
            className: "w-full min-h-10 py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(OctagonAlert, { className: "w-3.5 h-3.5" }),
              "Trigger Bank Step-Up Auth"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: handleGenerateDossier,
            className: "w-full min-h-10 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-colors flex items-center justify-center gap-2 border border-slate-700",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3.5 h-3.5 text-blue-400" }),
              "Generate Legal Dossier PDF"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmActionDialog,
      {
        isOpen: confirmDialog.isOpen,
        onClose: () => setConfirmDialog({ isOpen: false, action: null }),
        onConfirm: confirmDialog.action === "pcr" ? handleDispatchPCR : handleDispatchBank,
        title: confirmDialog.action === "pcr" ? "Dispatch PCR Patrol Unit?" : "Trigger Bank Step-Up Authentication?",
        description: confirmDialog.action === "pcr" ? `Issue immediate patrol dispatch to node ${node.node_id} (${node.district || "New Delhi"}) for case ${effectiveCaseId}.` : `Require biometric/OTP step-up verification for account ${effectiveAccountId || "target mule"} at target node ${node.node_id}.`,
        confirmLabel: confirmDialog.action === "pcr" ? "Confirm PCR Dispatch" : "Confirm Step-Up",
        variant: confirmDialog.action === "pcr" ? "danger" : "warning",
        isSubmitting
      }
    )
  ] });
}
export {
  TacticalBrief as T
};
