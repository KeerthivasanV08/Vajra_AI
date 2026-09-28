import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { n as fetchModelRegistryMetrics } from "./api-03VgCQYK.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { r as Cpu, a5 as TriangleAlert } from "../_libs/lucide-react.mjs";
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
function ModelPerformancePage() {
  const [modelData, setModelData] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const loadMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetchModelRegistryMetrics();
      setModelData(res);
    } catch (err) {
      toast.error(`Failed to load model registry metrics: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    loadMetrics();
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full bg-slate-950 text-slate-200 p-4 space-y-4 overflow-y-auto select-none", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Cpu, { className: "w-6 h-6 text-emerald-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-sm font-bold text-white font-mono tracking-wider", children: "VAJRA ML MODEL REGISTRY & PERFORMANCE SUITE" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-400", children: "Audited Evaluation Metrics & Prototype Warning Notes for Models 1–8" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-3 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono", children: "8 / 8 MODELS TRAINED" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: modelData && Object.entries(modelData.models || {}).map(([key, model]) => {
      const info = model.model_info ?? model;
      const rawMetrics = model.metrics ?? info.metrics ?? {};
      const warningNotes = model.audit_warning ? [model.audit_warning] : Array.isArray(info.warning_notes) ? info.warning_notes : [];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-colors", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-mono font-bold text-emerald-400", children: key.toUpperCase() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800 font-mono", children: info.version || "v1.0" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-semibold text-white", children: info.name ?? key }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-slate-400 leading-tight", children: info.purpose ?? info.description ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] font-mono text-slate-500 pt-1", children: [
            "Alg: ",
            info.algorithm ?? "—"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1 text-[11px] font-mono", children: [
          Object.entries(rawMetrics).map(([mKey, mVal]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-slate-400", children: [
              mKey,
              ":"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-200 font-bold", children: typeof mVal === "number" ? mVal.toFixed(4) : String(mVal) })
          ] }, mKey)),
          Object.keys(rawMetrics).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-slate-600 text-[10px]", children: "No metrics available" })
        ] }),
        warningNotes.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 rounded bg-amber-950/40 border border-amber-800/60 text-[10px] text-amber-300 font-mono space-y-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3 h-3 text-amber-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "SYNTHETIC PROTOTYPE NOTE" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: warningNotes[0] })
        ] })
      ] }, key);
    }) })
  ] });
}
export {
  ModelPerformancePage as component
};
