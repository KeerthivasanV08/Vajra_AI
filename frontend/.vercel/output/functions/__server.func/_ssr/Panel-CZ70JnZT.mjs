import { j as jsxRuntimeExports } from "../_libs/react.mjs";
function Panel({
  title,
  subtitle,
  children,
  action,
  className = "",
  dense = false
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: `glass-panel rounded-lg overflow-hidden flex flex-col ${className}`, children: [
    (title || action) && /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between px-3 py-2 border-b border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        title && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "vajra-card-title uppercase tracking-[0.1em] truncate", children: title }),
        subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "vajra-body-small text-slate-300 mt-0.5", children: subtitle })
      ] }),
      action
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex-1 min-h-0 ${dense ? "" : "p-3"}`, children })
  ] });
}
function StatCard({
  label,
  value,
  sub,
  tone = "default",
  icon,
  trend
}) {
  const toneCls = {
    default: "border-border",
    critical: "border-critical/40 glow-red",
    warning: "border-warning/40",
    success: "border-success/40",
    primary: "border-primary/40 glow-blue"
  }[tone];
  const valTone = {
    default: "text-foreground",
    critical: "text-critical",
    warning: "text-warning",
    success: "text-success",
    primary: "text-primary"
  }[tone];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative overflow-hidden rounded-lg bg-card/60 border ${toneCls} p-3`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 grid-bg opacity-[0.05]" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "vajra-label uppercase tracking-[0.1em]", children: label }),
        icon
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mt-1 vajra-kpi mono ${valTone}`, children: value }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex items-center gap-2 vajra-body-small text-slate-300", children: [
        sub,
        trend && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `mono ${trend.dir === "up" ? "text-success" : "text-critical"}`, children: [
          trend.dir === "up" ? "▲" : "▼",
          " ",
          trend.value
        ] })
      ] })
    ] })
  ] });
}
export {
  Panel as P,
  StatCard as S
};
