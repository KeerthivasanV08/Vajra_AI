import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { P as Panel } from "./Panel-CZ70JnZT.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { a0 as SlidersVertical } from "../_libs/lucide-react.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
function SettingsPage() {
  const [t1, setT1] = reactExports.useState(70);
  const [t2, setT2] = reactExports.useState(85);
  const [autoEsc, setAutoEsc] = reactExports.useState(true);
  const [realtime, setRealtime] = reactExports.useState(true);
  const [sound, setSound] = reactExports.useState(false);
  const [dark, setDark] = reactExports.useState(true);
  const [queue, setQueue] = reactExports.useState("FIFO");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-3 max-w-5xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-semibold tracking-tight", children: "Settings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Console preferences · risk thresholds · queue behavior" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Risk Thresholds", subtitle: "Decisioning model bands", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Slider, { label: "Review threshold", value: t1, onChange: setT1, hint: "Scores ≥ value trigger REVIEW queue routing" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Slider, { label: "Block threshold", value: t2, onChange: setT2, hint: "Scores ≥ value hard-block + P1 escalation" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-warning/30 bg-warning/5 p-2.5 text-warning text-[11px] flex items-start gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SlidersVertical, { className: "h-3.5 w-3.5 mt-0.5 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Threshold changes apply to scoring engine v3.7 with 5min propagation." })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Auto-Escalation", subtitle: "Routing & SLA behavior", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Auto-escalate on SLA breach", value: autoEsc, onChange: setAutoEsc }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Auto-create case from P1 alert", value: true, onChange: () => {
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Auto-assign to least-loaded officer", value: true, onChange: () => {
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5", children: "Queue ordering" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1", children: ["FIFO", "RISK_DESC", "SLA_ASC"].map((q) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setQueue(q), className: `h-8 px-3 mono text-[11px] rounded border ${queue === q ? "bg-primary text-primary-foreground border-primary" : "border-border"}`, children: q }, q)) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Realtime Preferences", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Stream live transactions", value: realtime, onChange: setRealtime }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Sound on P1 alerts", value: sound, onChange: setSound }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Animated graph propagation", value: true, onChange: () => {
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Compact density mode", value: false, onChange: () => {
        } })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Notifications", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Desktop notifications", value: true, onChange: () => {
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Email digest (daily)", value: true, onChange: () => {
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Slack #aml-warroom", value: false, onChange: () => {
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "PagerDuty on SLA breach", value: true, onChange: () => {
        } })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Appearance", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Dark mode (recommended)", value: dark, onChange: setDark }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "High-contrast borders", value: false, onChange: () => {
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Reduced motion", value: false, onChange: () => {
        } })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Session", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Officer", v: "A. Khan · L2 Analyst" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Role", v: "aml.investigator + sar.author" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Session id", v: "sess-7ac1f29b" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Last login", v: (/* @__PURE__ */ new Date()).toUTCString() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toast("Settings saved"), className: "w-full h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium", children: "Save Settings" })
      ] }) })
    ] })
  ] });
}
function Toggle({
  label,
  value,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between cursor-pointer", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onChange(!value), className: `relative h-5 w-9 rounded-full transition-colors ${value ? "bg-primary" : "bg-muted"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `absolute top-0.5 h-4 w-4 rounded-full bg-background transition-transform ${value ? "translate-x-4" : "translate-x-0.5"}` }) })
  ] });
}
function Slider({
  label,
  value,
  onChange,
  hint
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mono", children: value })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "range", min: 0, max: 100, value, onChange: (e) => onChange(+e.target.value), className: "w-full accent-primary" }),
    hint && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground mt-1", children: hint })
  ] });
}
function Row({
  k,
  v
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: k }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mono", children: v })
  ] });
}
export {
  SettingsPage as component
};
