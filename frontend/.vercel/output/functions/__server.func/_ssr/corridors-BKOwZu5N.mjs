import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { i as fetchCorridors, h as fetchCorridorNodes } from "./api-03VgCQYK.mjs";
import { R as RiskBadge } from "./RiskBadge-OTALS72R.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { L as Layers, U as RefreshCw } from "../_libs/lucide-react.mjs";
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
import "./caseNormalizer-BzVobBFG.mjs";
import "./router-DXMls9-H.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
function CorridorsPage() {
  const [corridors, setCorridors] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [selected, setSelected] = reactExports.useState(null);
  const [selectedNodes, setSelectedNodes] = reactExports.useState([]);
  const [stateFilter, setStateFilter] = reactExports.useState("ALL");
  const [sortBy, setSortBy] = reactExports.useState("risk");
  const loadCorridors = async () => {
    setLoading(true);
    try {
      const res = await fetchCorridors();
      setCorridors(res || []);
    } catch (err) {
      toast.error(`Failed to load corridors: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  const selectCorridor = async (corridor) => {
    setSelected(corridor);
    try {
      const result = await fetchCorridorNodes(corridor.corridor_id);
      setSelectedNodes(result.nodes || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load corridor nodes.");
    }
  };
  const visibleCorridors = corridors.filter((corridor) => stateFilter === "ALL" || corridor.state === stateFilter).sort((a, b) => sortBy === "nodes" ? b.primary_nodes_count - a.primary_nodes_count : b.risk_score - a.risk_score);
  reactExports.useEffect(() => {
    loadCorridors();
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full bg-slate-950 text-slate-200 p-4 space-y-4 overflow-y-auto select-none", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "w-6 h-6 text-rose-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-sm font-bold text-white font-mono tracking-wider", children: "MONITORED HIGH-RISK CASHOUT CORRIDORS" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-400", children: "Dense Withdrawal Networks & Inter-District Cash-Out Vector Analytics" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: loadCorridors, className: "p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `w-4 h-4 ${loading ? "animate-spin" : ""}` }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: stateFilter, onChange: (event) => setStateFilter(event.target.value), className: "rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ALL", children: "ALL STATES" }),
        Array.from(new Set(corridors.map((corridor) => corridor.state))).map((state) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: state, children: state }, state))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: sortBy, onChange: (event) => setSortBy(event.target.value), className: "rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "risk", children: "SORT: INTENSITY" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "nodes", children: "SORT: NODE COUNT" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-3", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-sm text-slate-400", children: "Loading corridor intelligence..." }) : !visibleCorridors.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-sm text-slate-400", children: "No corridors available for this filter." }) : visibleCorridors.map((corr, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => void selectCorridor(corr), className: `p-4 rounded-xl bg-slate-900 border text-left space-y-3 ${selected?.corridor_id === corr.corridor_id ? "border-rose-600" : "border-slate-800"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-mono font-bold text-rose-400", children: corr.corridor_id }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(RiskBadge, { score: corr.risk_score })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-white", children: corr.corridor_name }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-slate-400 font-mono", children: [
        "District: ",
        corr.district,
        " • State: ",
        corr.state
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400", children: "Primary Monitored Nodes:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-emerald-400 font-bold", children: [
          corr.primary_nodes_count,
          " Nodes"
        ] })
      ] })
    ] }, `corridor-card-${corr.corridor_id || "item"}-${idx}`)) }),
    selected && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-white", children: selected.corridor_name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-400", children: [
            selected.district,
            ", ",
            selected.state,
            " · ",
            selectedNodes.length,
            " nodes in corridor"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/heatmap", search: {
          corridorId: selected.corridor_id
        }, className: "rounded-md bg-slate-800 px-3 py-2 text-xs text-cyan-300 hover:bg-slate-700", children: "View on Operations Map" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-2 md:grid-cols-3", children: selectedNodes.slice(0, 6).map((node) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-slate-800 bg-slate-950 p-3 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-slate-200", children: node.node_id }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-slate-500", children: [
          node.node_type,
          " · ",
          node.district || "District unavailable"
        ] })
      ] }, node.node_id)) })
    ] })
  ] });
}
export {
  CorridorsPage as component
};
