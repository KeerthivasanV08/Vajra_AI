import { j as jsxRuntimeExports } from "../_libs/react.mjs";
function PriorityBadge({ p }) {
  const cls = p === "P1" ? "bg-critical/15 text-critical border-critical/40 pulse-critical" : p === "P2" ? "bg-warning/15 text-warning border-warning/40" : p === "INFO" ? "bg-info/10 text-info border-info/30" : "bg-muted text-muted-foreground border-border";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-1.5 h-5 rounded text-[10px] font-bold mono border ${cls}`, children: p });
}
function RiskScoreBadge({ score }) {
  const tone = score > 85 ? "critical" : score > 65 ? "warning" : score > 40 ? "info" : "success";
  const cls = {
    critical: "text-critical bg-critical/10 border-critical/40",
    warning: "text-warning bg-warning/10 border-warning/40",
    info: "text-info bg-info/10 border-info/40",
    success: "text-success bg-success/10 border-success/40"
  }[tone];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 px-1.5 h-5 rounded text-[10px] mono border ${cls}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: score }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-60", children: "/100" })
  ] });
}
function StatusBadge({ status }) {
  const t = {
    OPEN: "bg-info/10 text-info border-info/30",
    UNDER_REVIEW: "bg-info/10 text-info border-info/30",
    ACKNOWLEDGED: "bg-muted text-muted-foreground border-border",
    ESCALATED: "bg-warning/10 text-warning border-warning/40",
    CLOSED: "bg-success/10 text-success border-success/30",
    EDD_REQUESTED: "bg-warning/10 text-warning border-warning/40",
    ACCOUNT_FROZEN: "bg-critical/10 text-critical border-critical/40",
    SAR_GENERATED: "bg-primary/10 text-primary border-primary/40",
    SLA_BREACHED: "bg-critical/10 text-critical border-critical/40"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-1.5 h-5 rounded text-[10px] mono border ${t[status] ?? t.OPEN}`, children: status });
}
function DecisionBadge({ d }) {
  const cls = d === "BLOCK" ? "bg-critical/15 text-critical border-critical/40" : d === "REVIEW" ? "bg-warning/15 text-warning border-warning/40" : "bg-success/15 text-success border-success/30";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-1.5 h-5 rounded text-[10px] font-semibold mono border ${cls}`, children: d });
}
export {
  DecisionBadge as D,
  PriorityBadge as P,
  RiskScoreBadge as R,
  StatusBadge as S
};
