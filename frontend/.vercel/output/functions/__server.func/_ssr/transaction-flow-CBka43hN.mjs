import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { useStore, mergeHistoricalTransactions, store } from "./router-DXMls9-H.mjs";
import { u as useRecentTransactions } from "./useTransactions-oWs_n7gU.mjs";
import { P as Panel } from "./Panel-CZ70JnZT.mjs";
import { D as DecisionBadge, R as RiskScoreBadge, S as StatusBadge } from "./Badges-CsqHi44P.mjs";
import { E as ExplainabilityPanel } from "./ExplainabilityPanel-zKW048Vf.mjs";
import "../_libs/sonner.mjs";
import { v as Funnel, Q as Play, P as Pause, ad as X, d as ArrowRight } from "../_libs/lucide-react.mjs";
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
function formatTxnTime(value) {
  if (!value) return "Live now";
  const date = new Date(typeof value === "string" ? value : value * 1e3);
  if (Number.isNaN(date.getTime())) return "Live now";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
}
function formatINR(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(value);
}
function TransactionFlow() {
  const txns = useStore((s) => s.transactions);
  const paused = useStore((s) => s.paused);
  const recent = useRecentTransactions();
  reactExports.useEffect(() => {
    if (recent.data && !recent.isFetching) {
      mergeHistoricalTransactions(recent.data || []);
    }
  }, [recent.data, recent.isFetching]);
  const [minRisk, setMinRisk] = reactExports.useState(0);
  const [q, setQ] = reactExports.useState("");
  const [decision, setDecision] = reactExports.useState("ALL");
  const [selected, setSelected] = reactExports.useState(null);
  const filtered = txns.filter((t) => {
    if (t.riskScore < minRisk) return false;
    if (decision !== "ALL" && t.decision !== decision) return false;
    if (q && !`${t.id} ${t.sender} ${t.receiver} ${t.senderName} ${t.receiverName}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-semibold tracking-tight", children: "Transaction Intelligence Terminal" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Real-time SSE stream · scoring latency p99 21ms · throughput ",
          (12 + txns.length % 6).toFixed(0),
          " tx/s"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-[11px] mono", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 px-2 py-1 rounded border border-success/40 text-success bg-success/5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-success pulse-dot text-success" }),
          " SSE"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-1 rounded border border-border", children: "latency 21ms" })
      ] })
    ] }),
    recent.isError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-danger/40 bg-danger/5 px-3 py-2 text-xs text-danger", children: "Backend unavailable. Transaction history could not be loaded." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Search txn id / account / name…", className: "h-8 w-64 px-3 rounded-md bg-input/60 border border-border text-xs focus:outline-none focus:border-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3 h-8 rounded-md border border-border bg-card/60 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Funnel, { className: "h-3 w-3 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-[10px] uppercase tracking-wider", children: "Min risk" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "range", min: 0, max: 100, value: minRisk, onChange: (e) => setMinRisk(+e.target.value), className: "w-24 accent-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mono w-6", children: minRisk })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center rounded-md border border-border overflow-hidden", children: ["ALL", "ALLOW", "REVIEW", "BLOCK"].map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDecision(d), className: `px-2.5 h-8 text-[11px] mono ${decision === d ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`, children: d }, d)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => store.togglePause(), className: "ml-auto flex items-center gap-1.5 h-8 px-3 rounded-md border border-border bg-card/60 text-xs", children: [
        paused ? /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-3.5 w-3.5 text-success" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "h-3.5 w-3.5 text-warning" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mono", children: paused ? "RESUME STREAM" : "PAUSE STREAM" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: `${filtered.length} transactions in view`, subtitle: "Newest first · click row to inspect", dense: true, children: recent.isLoading && !txns.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-40 flex items-center justify-center text-xs text-muted-foreground", children: "Loading transactions…" }) : !filtered.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-40 flex items-center justify-center text-xs text-muted-foreground", children: "No transactions available from backend" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-auto scrollbar-thin max-h-[calc(100vh-280px)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "sticky top-0 bg-card/95 backdrop-blur text-[10px] uppercase tracking-wider text-muted-foreground z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "text-left border-b border-border", children: ["Time", "Txn ID", "Sender", "Receiver", "Amount", "Decision", "Risk", "Behav", "Seq", "Graph", "Signals", "Status"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-2 font-medium", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.slice(0, 80).map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { onClick: () => setSelected(t), className: `border-b border-border/50 cursor-pointer hover:bg-accent/30 ${i === 0 && !paused ? "row-enter" : ""} ${t.decision === "BLOCK" ? "bg-critical/[0.04]" : t.decision === "REVIEW" ? "bg-warning/[0.03]" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1.5 mono text-[10px] text-muted-foreground", children: formatTxnTime(t.ts || t.timestamp) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "mono text-[10px]", children: t.id.slice(0, 22) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "text-[11px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mono text-[10px]", children: t.sender }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground text-[10px]", children: [
            t.senderName,
            " · ",
            t.countryFrom
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "text-[11px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mono text-[10px]", children: t.receiver }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground text-[10px]", children: [
            t.receiverName,
            " · ",
            t.countryTo
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "mono text-right pr-3", children: formatINR(t.amount) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DecisionBadge, { d: t.decision }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RiskScoreBadge, { score: t.riskScore }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "mono text-[10px] text-muted-foreground", children: t.behavioralScore }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "mono text-[10px] text-muted-foreground", children: t.sequenceScore }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "mono text-[10px] text-muted-foreground", children: t.graphScore }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "max-w-[180px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 flex-wrap", children: [
          t.signals.slice(0, 2).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] mono px-1 py-0.5 rounded bg-muted text-muted-foreground border border-border", children: s }, s)),
          t.signals.length > 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[9px] mono text-muted-foreground", children: [
            "+",
            t.signals.length - 2
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: t.status ?? "OPEN" }) })
      ] }, t.id)) })
    ] }) }) }),
    selected && /* @__PURE__ */ jsxRuntimeExports.jsx(TxnDrawer, { t: selected, onClose: () => setSelected(null) })
  ] });
}
function TxnDrawer({
  t,
  onClose
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-50 flex", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 bg-background/60 backdrop-blur-sm", onClick: onClose }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "w-[560px] bg-card border-l border-border overflow-y-auto scrollbar-thin", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "sticky top-0 z-10 bg-card/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: "Transaction Detail" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mono text-sm", children: t.id })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "h-7 w-7 rounded hover:bg-accent flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Amount", value: formatINR(t.amount) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Channel", value: t.channel }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Decision", value: /* @__PURE__ */ jsxRuntimeExports.jsx(DecisionBadge, { d: t.decision }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Status", value: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: t.status ?? "OPEN" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-card/40 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground mb-2", children: "Counterparties" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mono", children: t.sender }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground text-[10px]", children: [
                t.senderName,
                " · ",
                t.countryFrom
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mono", children: t.receiver }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground text-[10px]", children: [
                t.receiverName,
                " · ",
                t.countryTo
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ExplainabilityPanel, { finalScore: t.riskScore, decision: t.decision })
      ] })
    ] })
  ] });
}
function Field({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-card/40 p-2.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 mono text-xs", children: value })
  ] });
}
export {
  TransactionFlow as component
};
