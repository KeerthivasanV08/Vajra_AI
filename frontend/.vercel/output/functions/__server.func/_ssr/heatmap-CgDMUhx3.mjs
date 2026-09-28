import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { O as OperationsMapCanvas } from "./OperationsMapCanvas-jPCvbzSH.mjs";
import { T as TacticalBrief } from "./TacticalBrief-BLvjPKFH.mjs";
import { t as fetchWithdrawalNodes, i as fetchCorridors, s as fetchWithdrawalNode, h as fetchCorridorNodes } from "./api-03VgCQYK.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { Route$2 as Route$9 } from "./router-DXMls9-H.mjs";
import { M as Map, U as RefreshCw } from "../_libs/lucide-react.mjs";
import "./SOPTierBadge-DkteLLAU.mjs";
import "./RiskBadge-OTALS72R.mjs";
import "./caseNormalizer-BzVobBFG.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
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
function OperationsMapPage() {
  const search = Route$9.useSearch();
  const [nodes, setNodes] = reactExports.useState([]);
  const [corridors, setCorridors] = reactExports.useState([]);
  const [selectedNode, setSelectedNode] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [loadError, setLoadError] = reactExports.useState(null);
  const [riskFilter, setRiskFilter] = reactExports.useState("ALL");
  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [nodeRes, corrRes, requestedNode, corridorNodeRes] = await Promise.all([fetchWithdrawalNodes({
        page: 1,
        page_size: 50
      }), fetchCorridors(), search.nodeId ? fetchWithdrawalNode(search.nodeId).catch(() => null) : Promise.resolve(null), search.corridorId ? fetchCorridorNodes(search.corridorId).catch(() => null) : Promise.resolve(null)]);
      const listedItems = nodeRes.items || [];
      const corridorItems = corridorNodeRes?.nodes || [];
      const combined = corridorItems.length > 0 ? corridorItems : listedItems;
      const items = requestedNode ? [requestedNode, ...combined.filter((node) => node.node_id !== requestedNode.node_id)] : combined;
      setNodes(items);
      setCorridors(corrRes || []);
      if (items.length > 0) {
        const initial = requestedNode || items[0];
        setSelectedNode(initial);
      } else {
        setSelectedNode(null);
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Unable to load operations map data.");
      toast.error(`Failed to load operations map data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    loadData();
  }, []);
  const filteredNodes = nodes.filter((node) => {
    if (riskFilter === "ALL") return true;
    const vuln = node.vulnerability_score_reference ?? node.node_vulnerability_score ?? 0.35;
    if (riskFilter === "IMMINENT") return vuln >= 0.7;
    if (riskFilter === "WATCHLIST") return vuln >= 0.5 && vuln < 0.7;
    if (riskFilter === "NORMAL") return vuln < 0.5;
    return true;
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-full w-full flex-col bg-slate-950 text-slate-200 overflow-y-auto select-none lg:flex-row lg:overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-[36rem] min-w-0 flex-1 flex-col lg:min-h-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between gap-4 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Map, { className: "w-5 h-5 text-rose-500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-base font-bold text-white font-mono tracking-wider", children: "VAJRA GIS OPERATIONS MAP" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono", children: [
            filteredNodes.length,
            " NODES MONITORED"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-sm", children: ["ALL", "IMMINENT", "WATCHLIST", "NORMAL"].map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setRiskFilter(tab), className: `px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors ${riskFilter === tab ? "bg-slate-800 text-white shadow" : "text-slate-400 hover:text-slate-200"}`, children: tab }, tab)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: loadData, className: "p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors", title: "Refresh Map Data", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `w-4 h-4 ${loading ? "animate-spin" : ""}` }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative flex-1 min-h-0 p-3", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full min-h-[30rem] items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-sm text-slate-300", children: "Loading operations map data..." }) : loadError ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full min-h-[30rem] flex-col items-center justify-center gap-3 rounded-xl border border-rose-900/70 bg-slate-900 px-6 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-rose-200", children: "Unable to load operations map data" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "max-w-md text-xs text-slate-400", children: loadError }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: loadData, className: "rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700", children: "Retry" })
      ] }) : filteredNodes.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full min-h-[30rem] items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-sm text-slate-300", children: "No nodes available for this filter." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(OperationsMapCanvas, { nodes: filteredNodes, corridors, selectedNode, onSelectNode: (node) => setSelectedNode(node) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-[28rem] w-full shrink-0 border-t border-slate-800 lg:h-full lg:w-[min(24rem,34vw)] lg:min-w-[20rem] lg:border-l lg:border-t-0", children: (() => {
      const vuln = selectedNode ? selectedNode.vulnerability_score_reference ?? selectedNode.node_vulnerability_score ?? 0.35 : 0;
      const dynamicSopTier = vuln >= 0.7 ? "ESCALATE_FREEZE" : vuln >= 0.5 ? "RECOMMEND-HOLD" : "MONITOR";
      const dynamicCaseId = search.caseId || "";
      return /* @__PURE__ */ jsxRuntimeExports.jsx(TacticalBrief, { node: selectedNode, caseId: dynamicCaseId, sopTier: dynamicSopTier });
    })() })
  ] });
}
export {
  OperationsMapPage as component
};
