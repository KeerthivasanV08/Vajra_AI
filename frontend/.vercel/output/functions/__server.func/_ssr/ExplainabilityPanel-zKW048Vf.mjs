import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { $ as ShieldCheck, J as Network, w as GitBranch, g as Brain } from "../_libs/lucide-react.mjs";
const ICONS = {
  Behavioral: Brain,
  Sequence: GitBranch,
  Graph: Network,
  Rules: ShieldCheck
};
const TONES = {
  Behavioral: "primary",
  Sequence: "info",
  Graph: "warning",
  Rules: "success"
};
function ExplainabilityPanel({
  contributions = defaultContribs,
  finalScore = 87,
  decision = "BLOCK"
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-[0.18em] text-muted-foreground", children: "Final Risk Decision" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-3 mt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-3xl font-bold mono text-critical", children: finalScore }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs mono px-2 py-0.5 rounded bg-critical/15 text-critical border border-critical/40", children: decision })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right text-[10px] text-muted-foreground mono", children: [
        "model-stack v3.7",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        "latency 18ms"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: contributions.map((c) => {
      const Icon = ICONS[c.model];
      const tone = TONES[c.model];
      const toneBar = {
        primary: "bg-primary",
        info: "bg-info",
        warning: "bg-warning",
        success: "bg-success"
      }[tone];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-card/40 p-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: c.model === "Graph" ? "Neo4j Graph" : `${c.model} Model` })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mono font-semibold", children: [
            Math.round(c.weight * 100),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-full ${toneBar}`, style: { width: `${c.weight * 100}%` } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex flex-wrap gap-1", children: c.signals.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border", children: s }, s)) })
      ] }, c.model);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5", children: "Decision Timeline" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "relative border-l border-border pl-4 space-y-2 text-xs", children: [
        { t: "T+0ms", e: "Transaction ingested" },
        { t: "T+4ms", e: "Behavioral model scored 0.82" },
        { t: "T+9ms", e: "Sequence model flagged drift" },
        { t: "T+13ms", e: "Neo4j cluster CL-77 matched" },
        { t: "T+16ms", e: "Rule R-441 triggered (sub-threshold)" },
        { t: "T+18ms", e: "Decision: BLOCK → routed to P1 queue" }
      ].map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -left-[19px] top-1 h-2 w-2 rounded-full bg-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mono text-[10px] text-muted-foreground mr-2", children: s.t }),
        s.e
      ] }, i)) })
    ] })
  ] });
}
const defaultContribs = [
  { model: "Behavioral", weight: 0.34, signals: ["VELOCITY_SPIKE", "BEHAVIORAL_DRIFT"] },
  { model: "Sequence", weight: 0.27, signals: ["NEW_BENEFICIARY", "ROUND_AMOUNT"] },
  { model: "Graph", weight: 0.24, signals: ["NEO4J_PROXIMITY", "MULE_RING"] },
  { model: "Rules", weight: 0.15, signals: ["HIGH_RISK_CORRIDOR", "VPN_DETECTED"] }
];
export {
  ExplainabilityPanel as E
};
