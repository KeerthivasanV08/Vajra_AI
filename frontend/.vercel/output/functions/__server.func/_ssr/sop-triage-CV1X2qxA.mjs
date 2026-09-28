import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { g as fetchCaseSOPFusion, a as applyCaseSOPSimulation, A as simulateSOP } from "./api-03VgCQYK.mjs";
import { f as fetchCases } from "./cases-CBs17Qbj.mjs";
import { S as SOPTierBadge } from "./SOPTierBadge-DkteLLAU.mjs";
import { r as Cpu, _ as ShieldAlert, Y as Search, V as RotateCcw, W as Save, m as CircleQuestionMark, y as Globe } from "../_libs/lucide-react.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
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
import "../_libs/isbot.mjs";
const SOP_ZONES = [
  { label: "MONITOR", start: 0, end: 0.5, color: "bg-slate-600" },
  { label: "SOFT-ALERT", start: 0.5, end: 0.7, color: "bg-amber-500" },
  { label: "RECOMMEND-HOLD", start: 0.7, end: 0.85, color: "bg-orange-500" },
  { label: "ESCALATE-FREEZE", start: 0.85, end: 1, color: "bg-rose-600" }
];
function scoreToThresholdPosition(score) {
  const bounded = Math.min(1, Math.max(0, score));
  const zone = SOP_ZONES.find((item) => bounded <= item.end) ?? SOP_ZONES[SOP_ZONES.length - 1];
  const priorWidth = SOP_ZONES.filter((item) => item.end <= zone.start).reduce((total, item) => total + (item.end - item.start), 0);
  const fractionOfZone = (bounded - zone.start) / (zone.end - zone.start);
  return (priorWidth + fractionOfZone * (zone.end - zone.start)) * 100;
}
function thresholdZoneWidth(start, end) {
  return scoreToThresholdPosition(end) - scoreToThresholdPosition(start);
}
const softAlertMarkerRegressionPasses = (() => {
  const marker = scoreToThresholdPosition(0.55);
  return marker > scoreToThresholdPosition(0.5) && marker < scoreToThresholdPosition(0.7);
})();
function SOPFusionStepper({ sop, digitalScore = 0.75, physicalScore = 0.68, contextScore = 0.5, className = "" }) {
  const fusion = sop?.fusion_weights || { digital: 0.45, physical: 0.35, context: 0.2 };
  const rawScore = sop?.raw_fusion_score ?? digitalScore * 0.45 + physicalScore * 0.35 + contextScore * 0.2;
  const calibratedScore = sop?.calibrated_score ?? rawScore;
  const isOverride = sop?.cross_border_override ?? false;
  const calibrationTrained = sop?.calibration_trained ?? false;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4 ${className}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "w-4 h-4 text-blue-400" }),
      "Model 6 Weighted SOP Fusion Engine"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-5 gap-2 items-center text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-1 ${isOverride ? "opacity-40" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-slate-400 font-mono", children: "Digital Risk (45%)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-bold text-blue-400 font-mono", children: [
          (digitalScore * 100).toFixed(0),
          "%"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-slate-500 font-mono", children: [
          "Contrib: ",
          (digitalScore * fusion.digital).toFixed(3),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { title: `Contribution = weight × signal value (${fusion.digital.toFixed(2)} × ${(digitalScore * 100).toFixed(0)}% = ${(digitalScore * fusion.digital).toFixed(3)})`, className: "cursor-help text-slate-300", "aria-label": "Contribution calculation help", children: "?" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:flex justify-center text-slate-600", children: "+" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-1 ${isOverride ? "opacity-40" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-slate-400 font-mono", children: "Physical Risk (35%)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-bold text-amber-400 font-mono", children: [
          (physicalScore * 100).toFixed(0),
          "%"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-slate-500 font-mono", children: [
          "Contrib: ",
          (physicalScore * fusion.physical).toFixed(3),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { title: `Contribution = weight × signal value (${fusion.physical.toFixed(2)} × ${(physicalScore * 100).toFixed(0)}% = ${(physicalScore * fusion.physical).toFixed(3)})`, className: "cursor-help text-slate-300", "aria-label": "Contribution calculation help", children: "?" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:flex justify-center text-slate-600", children: "+" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-1 ${isOverride ? "opacity-40" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-slate-400 font-mono", children: "Context Signal (20%)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-bold text-slate-300 font-mono", children: [
          (contextScore * 100).toFixed(0),
          "%"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-slate-500 font-mono", children: [
          "Contrib: ",
          (contextScore * fusion.context).toFixed(3),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { title: `Contribution = weight × signal value (${fusion.context.toFixed(2)} × ${(contextScore * 100).toFixed(0)}% = ${(contextScore * fusion.context).toFixed(3)})`, className: "cursor-help text-slate-300", "aria-label": "Contribution calculation help", children: "?" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative h-3 text-[10px] font-mono text-slate-500", children: [0, 0.5, 0.7, 0.85, 1].map((boundary) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -translate-x-1/2", style: { left: `${scoreToThresholdPosition(boundary)}%` }, children: boundary.toFixed(2) }, boundary)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex h-3 overflow-visible rounded-full", children: [
        SOP_ZONES.map((zone) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: zone.color, style: { width: `${thresholdZoneWidth(zone.start, zone.end)}%` } }, zone.label)),
        [0.5, 0.7, 0.85].map((boundary) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 z-10 h-3 w-px bg-slate-950/80", style: { left: `${scoreToThresholdPosition(boundary)}%` } }, boundary)),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-testid": "sop-score-marker", "data-zone": SOP_ZONES.find((zone) => calibratedScore >= zone.start && calibratedScore <= zone.end)?.label, "data-regression-soft-alert": softAlertMarkerRegressionPasses, className: "absolute -top-1 z-20 h-5 w-0.5 bg-white shadow-[0_0_0_2px_rgba(15,23,42,0.8)] transition-[left] duration-150", style: { left: `${scoreToThresholdPosition(calibratedScore)}%` }, "aria-label": `Current calibrated score ${(calibratedScore * 100).toFixed(1)} percent` })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-[10px] font-mono", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400", children: "MONITOR" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-400", children: "SOFT-ALERT" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-orange-400", children: "RECOMMEND-HOLD" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-rose-400", children: "ESCALATE-FREEZE" })
      ] })
    ] }),
    isOverride && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2 font-mono", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "w-4 h-4 text-purple-400 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "CROSS-BORDER OVERRIDE ACTIVE:" }),
        " Normal weighted fusion bypassed per cross-border detection policy."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400", children: "Raw Fusion Score: " }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-slate-200", children: rawScore.toFixed(4) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-slate-400", children: [
          "Isotonic Calibrated Score",
          calibrationTrained ? ": " : " (model not yet trained — showing raw score): "
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-emerald-400", children: calibratedScore.toFixed(4) })
      ] })
    ] })
  ] });
}
const initialScores = {
  digital: 0.75,
  physical: 0.68,
  context: 0.5
};
function localResult(scores, override) {
  const raw = 0.45 * scores.digital + 0.35 * scores.physical + 0.2 * scores.context;
  const tier = override ? "ESCALATE-FREEZE" : raw < 0.5 ? "MONITOR" : raw < 0.7 ? "SOFT-ALERT" : raw < 0.85 ? "RECOMMEND-HOLD" : "ESCALATE-FREEZE";
  return {
    raw_score: raw,
    calibrated_score: raw,
    tier,
    contributions: {
      digital: 0.45 * scores.digital,
      physical: 0.35 * scores.physical,
      context: 0.2 * scores.context
    },
    cross_border_override: override,
    calibration_trained: false,
    calibration_message: "Model not yet trained — showing raw score",
    action_description: override ? "Cross-border shift detected. Escalate for cross-border flight alert and swift-freeze coordination." : "Simulation result — no case changes saved"
  };
}
function SOPTriagePage() {
  const [scores, setScores] = reactExports.useState(initialScores);
  const [override, setOverride] = reactExports.useState(false);
  const [result, setResult] = reactExports.useState(() => localResult(initialScores, false));
  const [mode, setMode] = reactExports.useState("simulation");
  const [caseQuery, setCaseQuery] = reactExports.useState("");
  const [cases, setCases] = reactExports.useState([]);
  const [selectedCase, setSelectedCase] = reactExports.useState(null);
  const [saving, setSaving] = reactExports.useState(false);
  reactExports.useEffect(() => {
    fetchCases().then(setCases).catch(() => void 0);
  }, []);
  const filteredCases = reactExports.useMemo(() => {
    const query = caseQuery.trim().toLowerCase();
    return cases.filter((item) => !query || JSON.stringify(item).toLowerCase().includes(query)).slice(0, 6);
  }, [caseQuery, cases]);
  const payload = () => ({
    digital: scores.digital,
    physical: scores.physical,
    context: scores.context,
    cross_border_override: override
  });
  const loadCase = async (item) => {
    try {
      const fusion = await fetchCaseSOPFusion(item.id);
      setSelectedCase(item);
      setMode("case");
      setCaseQuery(item.caseId || item.id);
      setOverride(fusion.cross_border_override);
      setResult(fusion);
      setScores({
        digital: fusion.contributions.digital / 0.45,
        physical: fusion.contributions.physical / 0.35,
        context: fusion.contributions.context / 0.2
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Stored SOP values are unavailable for this case.");
    }
  };
  const simulate = (next, nextOverride) => {
    setResult(localResult(next, nextOverride));
    void simulateSOP({
      ...next,
      cross_border_override: nextOverride
    }).then(setResult).catch(() => void 0);
  };
  const changeScore = (key, value) => {
    if (mode === "case") return;
    const next = {
      ...scores,
      [key]: value
    };
    setScores(next);
    simulate(next, override);
  };
  const toggleOverride = (checked) => {
    if (mode === "case") return;
    setOverride(checked);
    simulate(scores, checked);
  };
  const resetSimulation = () => {
    setMode("simulation");
    setSelectedCase(null);
    setCaseQuery("");
    setOverride(false);
    setScores(initialScores);
    setResult(localResult(initialScores, false));
  };
  const resetToLiveValues = async () => {
    if (!selectedCase) return resetSimulation();
    await loadCase(selectedCase);
    toast.success("Live case values restored. Case Review is read-only.");
  };
  const applySimulation = async () => {
    if (!selectedCase) return;
    setSaving(true);
    try {
      setResult(await applyCaseSOPSimulation(selectedCase.id, payload()));
      setMode("case");
      toast.success("Simulation applied and audit event recorded. Case Review is now read-only.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to apply simulation.");
    } finally {
      setSaving(false);
    }
  };
  const slider = (key, label, weight, tone) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `space-y-2 rounded-lg border border-slate-800 bg-slate-950 p-3 ${mode === "case" || override ? "opacity-45" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between font-mono text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-slate-300", children: [
        label,
        " (",
        weight * 100,
        "%)"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `${tone} font-bold`, children: [
        Math.round(scores[key] * 100),
        "%"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { "aria-label": label, disabled: mode === "case", type: "range", min: "0", max: "1", step: "0.01", value: scores[key], onChange: (event) => changeScore(key, Number(event.target.value)), className: "w-full accent-blue-500 disabled:cursor-not-allowed" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-xs text-slate-500", children: [
      "Contribution: ",
      result.contributions[key].toFixed(3),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { title: `Contribution = weight × signal value (${weight.toFixed(2)} × ${Math.round(scores[key] * 100)}% = ${result.contributions[key].toFixed(3)})`, className: "cursor-help text-slate-300", "aria-label": "Contribution calculation help", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleQuestionMark, { className: "h-3 w-3" }) })
    ] })
  ] });
  const sop = {
    raw_fusion_score: result.raw_score,
    calibrated_score: result.calibrated_score,
    sop_tier: result.tier,
    action_description: result.action_description || "",
    cross_border_override: result.cross_border_override,
    fusion_weights: {
      digital: 0.45,
      physical: 0.35,
      context: 0.2
    },
    explanations: [],
    legal_authority_disclaimer: result.legal_authority_disclaimer || "",
    model_version: "Model 6",
    calibration_trained: result.calibration_trained,
    calibration_message: result.calibration_message
  };
  const reasonCodes = [{
    label: "Digital risk",
    value: scores.digital,
    contribution: result.contributions.digital
  }, {
    label: "Physical prediction confidence",
    value: scores.physical,
    contribution: result.contributions.physical
  }, {
    label: "Context risk",
    value: scores.context,
    contribution: result.contributions.context
  }].sort((a, b) => b.contribution - a.contribution).slice(0, 3);
  const tierMeaning = {
    MONITOR: "Monitor account activity under normal operating procedures. No account restriction is applied at this tier.",
    "SOFT-ALERT": "Notify the assigned officer and monitor account activity. No account restriction is applied at this tier.",
    "RECOMMEND-HOLD": "Recommend a temporary hold for authorized review before further cash-out activity.",
    "ESCALATE-FREEZE": "Escalate immediately for authorized freeze review and operational response."
  };
  const banner = mode === "simulation" ? "SIMULATION MODE — results are not saved" : mode === "case-simulation" ? `CASE SIMULATION MODE — ${selectedCase?.caseId || selectedCase?.id} is not yet changed` : `CASE REVIEW MODE — viewing ${selectedCase?.caseId || selectedCase?.id} (read-only)`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-full flex-col gap-4 overflow-y-auto bg-slate-950 p-4 text-slate-200 select-none", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "rounded-xl border border-slate-800 bg-slate-900 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Cpu, { className: "mt-1 h-6 w-6 text-rose-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-mono text-base font-bold tracking-wider text-white", children: "MODEL 6 SOP TRIAGE & ISOTONIC CALIBRATION CONSOLE" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-400", children: "Operational Action Tier Calibration & Disparate Impact Evaluation" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SOPTierBadge, { tier: result.tier, override: result.cross_border_override, className: "px-3 py-1 text-xs" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-mono ${mode === "simulation" ? "border-cyan-800 bg-cyan-950/40 text-cyan-200" : "border-amber-800 bg-amber-950/40 text-amber-200"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-3.5 w-3.5" }),
          banner
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4 text-slate-500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: caseQuery, onChange: (event) => {
            setCaseQuery(event.target.value);
            if (!event.target.value) resetSimulation();
          }, placeholder: "Search case ID or account ID", className: "w-64 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 pl-8 text-sm text-slate-200 placeholder:text-slate-500" }),
          caseQuery && mode === "simulation" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-0 top-10 z-10 w-64 rounded-md border border-slate-700 bg-slate-900 p-1 shadow-xl", children: [
            filteredCases.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => void loadCase(item), className: "block w-full rounded px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-800", children: [
              item.caseId || item.id,
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-slate-500", children: item.title })
            ] }, item.id)),
            !filteredCases.length && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-2 text-xs text-slate-500", children: "No matching cases" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-mono text-sm font-semibold uppercase tracking-wider text-slate-300", children: "Risk Signal Controls" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-4", children: [
        slider("digital", "Digital Risk", 0.45, "text-blue-400"),
        slider("physical", "Physical Prediction", 0.35, "text-amber-400"),
        slider("context", "Context Risk", 0.2, "text-slate-300"),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-3 ${mode === "case" ? "opacity-45" : ""}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block font-mono text-sm font-medium text-purple-300", children: "Cross-Border Shift" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-slate-500", children: "Force escalation override" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: override, disabled: mode === "case", onChange: (event) => toggleOverride(event.target.checked), className: "h-5 w-5 accent-purple-500" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SOPFusionStepper, { sop, digitalScore: scores.digital, physicalScore: scores.physical, contextScore: scores.context }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-sm font-semibold uppercase tracking-wider text-slate-300", children: "Action Description" }),
      result.cross_border_override ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-rose-800 bg-rose-950/40 p-3 text-sm text-rose-100", children: "Cross-border shift override is active. Normal tier guidance is bypassed: escalate for cross-border flight alert and authorized swift-freeze coordination." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm text-slate-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
            result.tier,
            ":"
          ] }),
          " ",
          tierMeaning[result.tier] || result.action_description
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-3 list-disc space-y-1 pl-5 text-xs text-slate-400", children: reasonCodes.map((reason) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          reason.label,
          " elevated (",
          Math.round(reason.value * 100),
          "%; contribution ",
          reason.contribution.toFixed(3),
          ")"
        ] }, reason.label)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 pt-2", children: [
        mode === "case" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setMode("case-simulation"), className: "inline-flex items-center gap-2 rounded-md bg-cyan-700 px-3 py-2 text-sm text-white hover:bg-cyan-600", children: "Simulate Against This Case" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: resetSimulation, className: "inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-4 w-4" }),
            " Return to Simulation"
          ] })
        ] }),
        mode === "case-simulation" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => void applySimulation(), disabled: saving, className: "inline-flex items-center gap-2 rounded-md bg-rose-700 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4" }),
            " Apply to Case"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => void resetToLiveValues(), className: "inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-4 w-4" }),
            " Reset to Live Values"
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  SOPTriagePage as component
};
