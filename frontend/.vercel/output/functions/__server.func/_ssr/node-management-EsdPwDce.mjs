import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as bulkImportNodes, w as recalculateNodeVulnerability, t as fetchWithdrawalNodes } from "./api-03VgCQYK.mjs";
import { O as OperationsMapCanvas } from "./OperationsMapCanvas-jPCvbzSH.mjs";
import { T as TacticalBrief } from "./TacticalBrief-BLvjPKFH.mjs";
import { R as RiskBadge } from "./RiskBadge-OTALS72R.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { i as Building2, Y as Search, U as RefreshCw, z as List, M as Map, j as ChevronLeft, k as ChevronRight } from "../_libs/lucide-react.mjs";
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
import "./SOPTierBadge-DkteLLAU.mjs";
function NodeManagementPage() {
  const [nodes, setNodes] = reactExports.useState([]);
  const [selectedNode, setSelectedNode] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [search, setSearch] = reactExports.useState("");
  const [nodeTypeFilter, setNodeTypeFilter] = reactExports.useState("ALL");
  const [riskBandFilter, setRiskBandFilter] = reactExports.useState("ALL");
  const [view, setView] = reactExports.useState("list");
  const [page, setPage] = reactExports.useState(1);
  const [pageSize] = reactExports.useState(25);
  const [totalNodes, setTotalNodes] = reactExports.useState(0);
  const loadNodes = async (targetPage = page) => {
    setLoading(true);
    try {
      const res = await fetchWithdrawalNodes({
        page: targetPage,
        page_size: pageSize,
        search: search || void 0,
        node_type: nodeTypeFilter === "ALL" ? void 0 : nodeTypeFilter,
        risk_band: riskBandFilter === "ALL" ? void 0 : riskBandFilter
      });
      setNodes(res.items || []);
      setTotalNodes(res.total || 0);
      if (res.items?.length > 0) {
        setSelectedNode(res.items[0]);
      } else {
        setSelectedNode(null);
      }
    } catch (err) {
      toast.error(`Failed to load withdrawal nodes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    setPage(1);
    loadNodes(1);
  }, [search, nodeTypeFilter, riskBandFilter]);
  const handlePageChange = (newPage) => {
    setPage(newPage);
    loadNodes(newPage);
  };
  const filteredNodes = nodes;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full w-full bg-slate-950 text-slate-200 overflow-hidden select-none", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between gap-4 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-5 h-5 text-emerald-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-sm font-bold text-white font-mono tracking-wider", children: "WITHDRAWAL NODE REGISTRY" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono", children: [
            filteredNodes.length,
            " NODES"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search Node ID, Bank, District...", className: "bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-slate-700 w-48 font-sans" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: nodeTypeFilter, onChange: (e) => setNodeTypeFilter(e.target.value), className: "bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 font-mono focus:outline-none", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ALL", children: "ALL TYPES" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ATM", children: "ATM" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "MICRO_ATM", children: "MICRO ATM" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "AEPS_CSP", children: "AePS CSP" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "POS", children: "POS" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: riskBandFilter, onChange: (e) => setRiskBandFilter(e.target.value), className: "bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 font-mono focus:outline-none", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ALL", children: "ALL RISK" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "HIGH", children: "HIGH" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "MEDIUM", children: "MEDIUM" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "LOW", children: "LOW" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "cursor-pointer rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white", children: [
            "Bulk Import",
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: ".csv,text/csv", className: "hidden", onChange: async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              try {
                const result = await bulkImportNodes(file);
                toast.success(`Imported ${result.rows_accepted ?? 0} nodes.`);
                await loadNodes();
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Node import failed.");
              } finally {
                event.target.value = "";
              }
            } })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: loadNodes, className: "p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `w-3.5 h-3.5 ${loading ? "animate-spin" : ""}` }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 border-b border-slate-800 px-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setView("list"), className: `inline-flex items-center gap-1 rounded px-2 py-1 text-xs ${view === "list" ? "bg-slate-700 text-white" : "text-slate-400"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(List, { className: "h-3.5 w-3.5" }),
          " List"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setView("map"), className: `inline-flex items-center gap-1 rounded px-2 py-1 text-xs ${view === "map" ? "bg-slate-700 text-white" : "text-slate-400"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Map, { className: "h-3.5 w-3.5" }),
          " Map"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-3 scrollbar-thin space-y-2", children: [
        view === "map" && filteredNodes.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(OperationsMapCanvas, { nodes: filteredNodes, selectedNode, onSelectNode: setSelectedNode, className: "mb-3 min-h-[28rem]" }),
        view === "list" && (loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-center text-sm text-slate-400", children: "Loading withdrawal nodes..." }) : !filteredNodes.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-center text-sm text-slate-400", children: "No withdrawal nodes match the current filters." }) : filteredNodes.map((node) => {
          const isSelected = selectedNode?.node_id === node.node_id;
          const vuln = node.vulnerability_score_reference ?? node.node_vulnerability_score ?? 0.35;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => setSelectedNode(node), className: `min-h-12 p-3 rounded-xl border transition-colors cursor-pointer flex items-center justify-between gap-4 ${isSelected ? "bg-slate-900 border-slate-700 shadow-md" : "bg-slate-950/70 border-slate-800/80 hover:border-slate-700"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 font-mono text-xs shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-4 h-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-mono font-bold text-white truncate", children: node.node_id }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 font-mono uppercase", children: node.node_type })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-slate-300 truncate mt-0.5", children: [
                  node.bank_name || "Bank Aggregator",
                  " • ",
                  node.district || "Delhi NCR"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right text-sm font-mono", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-slate-500", children: "Daily Limit" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-slate-300 font-medium", children: [
                  "₹",
                  (node.cash_limit_daily || 1e5).toLocaleString("en-IN")
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(RiskBadge, { score: vuln })
            ] })
          ] }, node.node_id);
        }))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2.5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400 font-mono shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          "Page ",
          page,
          " of ",
          Math.max(1, Math.ceil(totalNodes / pageSize)),
          " (",
          totalNodes.toLocaleString(),
          " nodes total)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handlePageChange(page - 1), disabled: page <= 1 || loading, className: "p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200", title: "Previous Page", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "w-4 h-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-200", children: page }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handlePageChange(page + 1), disabled: page >= Math.ceil(totalNodes / pageSize) || loading, className: "p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200", title: "Next Page", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4" }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-96 shrink-0 h-full border-l border-slate-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TacticalBrief, { node: selectedNode }),
      selectedNode && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: async () => {
        try {
          await recalculateNodeVulnerability(selectedNode.node_id);
          toast.success("Node vulnerability recalculated.");
          await loadNodes();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Vulnerability recalculation failed.");
        }
      }, className: "m-4 w-[calc(100%-2rem)] rounded-md bg-amber-700 px-3 py-2 text-xs font-semibold text-white", children: "Recalculate Vulnerability" })
    ] })
  ] });
}
export {
  NodeManagementPage as component
};
