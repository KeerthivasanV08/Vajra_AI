import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { v as recalculateFairnessRegions, k as fetchFairnessRegions, j as fetchFairnessRegionDetail } from "./api-03VgCQYK.mjs";
import { X as Scale, I as Info, U as RefreshCw, Y as Search, e as ArrowUp, a as ArrowDown, _ as ShieldAlert } from "../_libs/lucide-react.mjs";
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
const MIN_SAMPLE_SIZE = 10;
function percentage(value, sampleSize) {
  return value === null || sampleSize < MIN_SAMPLE_SIZE ? "Insufficient data" : `${value.toFixed(1)}%`;
}
function flagStyle(flag) {
  if (flag === "FLAGGED") return "border-rose-800 bg-rose-950/70 text-rose-300";
  if (flag === "REVIEW") return "border-amber-800 bg-amber-950/70 text-amber-300";
  if (flag === "OK") return "border-emerald-800 bg-emerald-950/70 text-emerald-300";
  return "border-slate-700 bg-slate-800 text-slate-500";
}
function FairnessAuditPage() {
  const [rows, setRows] = reactExports.useState([]);
  const [selected, setSelected] = reactExports.useState(null);
  const [search, setSearch] = reactExports.useState("");
  const [flaggedOnly, setFlaggedOnly] = reactExports.useState(false);
  const [sortKey, setSortKey] = reactExports.useState(null);
  const [ascending, setAscending] = reactExports.useState(true);
  const [loading, setLoading] = reactExports.useState(true);
  const [recalculating, setRecalculating] = reactExports.useState(false);
  const loadRows = async () => {
    setLoading(true);
    try {
      setRows((await fetchFairnessRegions()).results);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load fairness regions.");
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    void loadRows();
  }, []);
  const openDetail = async (row) => {
    try {
      setSelected(await fetchFairnessRegionDetail(row.region_id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load region detail.");
    }
  };
  const setSorting = (key) => {
    if (sortKey === key) setAscending((value) => !value);
    else {
      setSortKey(key);
      setAscending(true);
    }
  };
  const visibleRows = rows.filter((row) => !flaggedOnly || row.governance_flag === "FLAGGED" || row.governance_flag === "REVIEW").filter((row) => `${row.region_name} ${row.state}`.toLowerCase().includes(search.toLowerCase())).sort((left, right) => {
    if (!sortKey) {
      const rank = {
        FLAGGED: 0,
        REVIEW: 1,
        "N/A": 2,
        OK: 3
      };
      return rank[left.governance_flag] - rank[right.governance_flag];
    }
    const comparison = String(left[sortKey] ?? "").localeCompare(String(right[sortKey] ?? ""), void 0, {
      numeric: true
    });
    return ascending ? comparison : -comparison;
  });
  const sufficientRows = rows.filter((row) => row.number_of_predictions >= MIN_SAMPLE_SIZE && row.disparate_impact_ratio !== null);
  const flaggedCount = rows.filter((row) => row.governance_flag === "FLAGGED" || row.governance_flag === "REVIEW").length;
  const averageDir = sufficientRows.length ? sufficientRows.reduce((sum, row) => sum + (row.disparate_impact_ratio ?? 0), 0) / sufficientRows.length : null;
  const insufficientCount = rows.filter((row) => row.number_of_predictions < MIN_SAMPLE_SIZE).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full min-h-0 flex-col overflow-y-auto bg-slate-950 p-4 text-slate-200", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-start justify-between rounded-xl border border-slate-800 bg-slate-900 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Scale, { className: "mt-0.5 h-6 w-6 text-cyan-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-mono text-sm font-bold tracking-wider text-white", children: "FAIRNESS AUDIT & GOVERNANCE CONSOLE" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-400", children: "Regional disparate impact review. Non-scoring governance layer." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 max-w-3xl text-[11px] leading-relaxed text-slate-500", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "mr-1 inline h-3.5 w-3.5 text-cyan-400" }),
            "DIR compares each region's predicted high-risk rate with the overall predicted high-risk baseline. Values outside 0.80 to 1.25 require governance review."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: async () => {
        setRecalculating(true);
        try {
          const result = await recalculateFairnessRegions();
          setRows(result.results);
          toast.success("Fairness snapshot recalculated.");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Recalculation failed.");
        } finally {
          setRecalculating(false);
        }
      }, className: "inline-flex items-center gap-2 rounded-md border border-cyan-800 bg-cyan-950/60 px-3 py-2 text-xs font-semibold text-cyan-300", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `h-3.5 w-3.5 ${recalculating ? "animate-spin" : ""}` }),
        " Recalculate"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4", children: [["Regions Analyzed", rows.length.toString(), "text-white"], ["Regions Flagged", flaggedCount.toString(), flaggedCount ? "text-amber-300" : "text-emerald-300"], ["Average DIR", averageDir === null ? "Insufficient data" : averageDir.toFixed(2), "text-cyan-300"], ["Insufficient Data", insufficientCount.toString(), insufficientCount ? "text-slate-300" : "text-emerald-300"]].map(([label, value, color]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-slate-800 bg-slate-900 px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-slate-500", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mt-1 font-mono text-3xl font-bold leading-none ${color}`, children: value })
    ] }, label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-0 flex-1 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "min-w-0 flex-1 rounded-xl border border-slate-800 bg-slate-900 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex flex-wrap items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-mono text-xs font-semibold uppercase tracking-wider text-slate-400", children: "Regional Statistics" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: search, onChange: (event) => setSearch(event.target.value), placeholder: "Search state or region", className: "w-48 rounded-md border border-slate-700 bg-slate-950 py-1.5 pl-8 pr-2 text-xs text-slate-200 outline-none" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-xs text-slate-400", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: flaggedOnly, onChange: (event) => setFlaggedOnly(event.target.checked) }),
              " Flagged only"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full min-w-[50rem] text-left text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "border-b border-slate-800 text-[13px] font-semibold uppercase tracking-wider text-slate-300", children: [["region_name", "Regional Group"], ["number_of_predictions", "Predictions"], ["predicted_high_risk_pct", "Predicted High Risk"], ["confirmed_fraud_pct", "Confirmed Fraud"], ["disparate_impact_ratio", "DIR"], ["governance_flag", "Governance Flag"]].map(([key, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "whitespace-nowrap px-3 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setSorting(key), className: "inline-flex items-center gap-1", children: [
            label,
            sortKey === key && (ascending ? /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDown, { className: "h-3.5 w-3.5" }))
          ] }) }, key)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-slate-800/70", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "p-8 text-center text-slate-400", children: "Loading fairness snapshot..." }) }) : visibleRows.map((row) => {
            const primary = row.region_name || row.state || "Unknown region";
            const subtitle = row.state && row.state !== primary ? row.state : null;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { onClick: () => void openDetail(row), className: "h-12 cursor-pointer hover:bg-slate-950/70", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[15px] font-semibold text-slate-100", children: primary }),
                subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 text-sm text-slate-400", children: subtitle })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 font-mono text-sm text-slate-200", children: row.number_of_predictions.toLocaleString() }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-3 py-3 font-mono text-sm ${row.number_of_predictions < MIN_SAMPLE_SIZE ? "text-slate-400" : "text-slate-200"}`, children: percentage(row.predicted_high_risk_pct, row.number_of_predictions) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-3 py-3 font-mono text-sm ${row.number_of_true_cases < MIN_SAMPLE_SIZE ? "text-slate-400" : "text-slate-200"}`, children: percentage(row.confirmed_fraud_pct, row.number_of_true_cases) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 font-mono text-[15px] font-bold text-cyan-300", children: row.disparate_impact_ratio === null || row.number_of_predictions < MIN_SAMPLE_SIZE ? "Insufficient data" : row.disparate_impact_ratio.toFixed(2) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex rounded border px-2.5 py-1.5 font-mono text-xs font-semibold ${flagStyle(row.number_of_predictions < MIN_SAMPLE_SIZE ? "N/A" : row.governance_flag)}`, children: row.number_of_predictions < MIN_SAMPLE_SIZE ? "N/A" : row.governance_flag }) })
            ] }, row.region_id);
          }) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "hidden w-80 shrink-0 rounded-xl border border-slate-800 bg-slate-900 p-4 xl:block", children: selected ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-start justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-slate-500", children: "Selected region" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-1 text-lg font-semibold text-white", children: selected.region_name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-500", children: selected.state })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-5 w-5 text-cyan-400" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: [["Predictions", selected.number_of_predictions], ["True cases", selected.number_of_true_cases], ["False positives", selected.number_of_false_positives], ["False negatives", selected.number_of_false_negatives]].map(([label, value]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded border border-slate-800 bg-slate-950 p-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-slate-500", children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 font-mono text-sm text-slate-200", children: Number(value).toLocaleString() })
        ] }, label)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 border-t border-slate-800 pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-slate-500", children: "Transparent calculation" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[11px] leading-relaxed text-slate-400", children: "DIR = (predicted high-risk rate in this region) / (predicted high-risk rate baseline)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-mono text-xs text-cyan-300", children: selected.predicted_high_risk_pct === null || selected.disparate_impact_ratio === null ? "Insufficient data for DIR" : `${(selected.predicted_high_risk_pct / 100).toFixed(4)} / ${(selected.predicted_high_risk_pct / 100 / selected.disparate_impact_ratio).toFixed(4)} = ${selected.disparate_impact_ratio.toFixed(2)}` })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 border-t border-slate-800 pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-slate-500", children: "DIR trend, 30 days" }),
          selected.dir_trend_30d.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 240 48", className: "mt-3 h-12 w-full", role: "img", "aria-label": "DIR trend", children: /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { fill: "none", stroke: "currentColor", strokeWidth: "2", className: "text-cyan-400", points: selected.dir_trend_30d.map((point, index) => `${index / Math.max(selected.dir_trend_30d.length - 1, 1) * 240},${48 - (point.dir ?? 0) / 2 * 48}`).join(" ") }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-slate-500", children: "No historical snapshots available." })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full min-h-48 items-center justify-center text-center text-xs text-slate-500", children: "Select a region to inspect its raw counts and DIR calculation." }) })
    ] })
  ] });
}
export {
  FairnessAuditPage as component
};
