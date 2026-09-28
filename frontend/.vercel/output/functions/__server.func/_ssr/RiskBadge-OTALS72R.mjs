import { j as jsxRuntimeExports } from "../_libs/react.mjs";
function RiskBadge({ score, level, className = "" }) {
  let computedLevel = level;
  if (!computedLevel && score !== void 0) {
    if (score >= 0.85) computedLevel = "IMMINENT";
    else if (score >= 0.7) computedLevel = "CRITICAL";
    else if (score >= 0.5) computedLevel = "WATCHLIST";
    else computedLevel = "NORMAL";
  }
  const normalized = String(computedLevel || "NORMAL").toUpperCase();
  let colorClasses = "bg-slate-800 text-slate-300 border-slate-700";
  if (normalized === "IMMINENT") {
    colorClasses = "bg-rose-950 text-rose-300 border-rose-700 font-bold animate-pulse";
  } else if (normalized === "CRITICAL") {
    colorClasses = "bg-rose-950/70 text-rose-400 border-rose-800";
  } else if (normalized === "WATCHLIST") {
    colorClasses = "bg-amber-950/60 text-amber-400 border-amber-800/60";
  } else if (normalized === "NORMAL") {
    colorClasses = "bg-emerald-950/60 text-emerald-400 border-emerald-800/60";
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "span",
    {
      className: `inline-flex items-center gap-1 px-2.5 py-1 rounded vajra-status font-mono border ${colorClasses} ${className}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: normalized }),
        score !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs opacity-90", children: [
          "(",
          (score * 100).toFixed(0),
          "%)"
        ] })
      ]
    }
  );
}
export {
  RiskBadge as R
};
