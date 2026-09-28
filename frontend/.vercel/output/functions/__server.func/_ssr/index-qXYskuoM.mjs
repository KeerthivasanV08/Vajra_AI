import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { useStore, mergeHistoricalTransactions, mergeHistoricalAlerts, client, extractObject } from "./router-DXMls9-H.mjs";
import { S as StatCard, P as Panel } from "./Panel-CZ70JnZT.mjs";
import { R as RiskScoreBadge, D as DecisionBadge, P as PriorityBadge } from "./Badges-CsqHi44P.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { u as useRecentTransactions } from "./useTransactions-oWs_n7gU.mjs";
import { u as useAlerts } from "./useAlerts-OAbqpngd.mjs";
import { a as useCases } from "./useCases-C6WVsqI0.mjs";
import { b as useGraphSnapshot } from "./useGraph-CZT1edxt.mjs";
import "../_libs/sonner.mjs";
import { A as Activity, B as Ban, _ as ShieldAlert, a5 as TriangleAlert, h as Briefcase, s as FilePenLine, aa as Users, x as GitMerge, d as ArrowRight, $ as ShieldCheck } from "../_libs/lucide-react.mjs";
import { R as ResponsiveContainer, a as AreaChart, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, A as Area, d as PieChart, P as Pie, c as Cell, b as BarChart, B as Bar } from "../_libs/recharts.mjs";
import "../_libs/tanstack__query-core.mjs";
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
import "./cases-CBs17Qbj.mjs";
import "./caseNormalizer-BzVobBFG.mjs";
import "../_libs/clsx.mjs";
import "../_libs/lodash.mjs";
import "../_libs/react-smooth.mjs";
import "../_libs/prop-types.mjs";
import "../_libs/fast-equals.mjs";
import "../_libs/tiny-invariant.mjs";
import "../_libs/react-is.mjs";
import "../_libs/d3-shape.mjs";
import "../_libs/d3-path.mjs";
import "../_libs/victory-vendor.mjs";
import "../_libs/d3-scale.mjs";
import "../_libs/internmap.mjs";
import "../_libs/d3-array.mjs";
import "../_libs/d3-time-format.mjs";
import "../_libs/d3-time.mjs";
import "../_libs/d3-interpolate.mjs";
import "../_libs/d3-color.mjs";
import "../_libs/d3-format.mjs";
import "../_libs/recharts-scale.mjs";
import "../_libs/decimal.js-light.mjs";
import "../_libs/eventemitter3.mjs";
function normalizeMetrics(raw) {
  const metrics = extractObject(raw);
  return {
    total_transactions: Number(metrics.total_transactions ?? metrics.totalTransactions ?? 0),
    blocked_transactions: Number(metrics.blocked_transactions ?? metrics.blockedTransactions ?? 0),
    review_queue: Number(metrics.review_queue ?? metrics.reviewQueue ?? 0),
    high_risk_count: Number(metrics.high_risk_count ?? metrics.highRiskCount ?? 0),
    cases: Number(metrics.cases ?? metrics.activeCases ?? 0),
    escalations: Number(metrics.escalations ?? metrics.escalations ?? 0),
    p1: Number(metrics.p1 ?? metrics.high_risk_count ?? 0),
    activeCases: Number(metrics.activeCases ?? metrics.cases ?? 0),
    sar: Number(metrics.sar ?? 0),
    mules: Number(metrics.mules ?? 0),
    networkRisk: Number(metrics.networkRisk ?? 0)
  };
}
async function fetchDashboardMetrics() {
  const raw = await client.request({ path: "/api/dashboard/metrics" });
  return normalizeMetrics(raw);
}
function useDashboardMetrics() {
  const opts = {
    queryKey: ["dashboard", "metrics"],
    queryFn: fetchDashboardMetrics,
    staleTime: 1e4,
    retry: 2,
    refetchInterval: 3e4
  };
  try {
    return useQuery(opts);
  } catch (e) {
    console.error("useDashboardMetrics - useQuery called with invalid args", { opts, err: e });
    throw e;
  }
}
function formatWindow(ts) {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}
function buildRiskTrend(transactions, alerts) {
  const now = Date.now();
  const windowMs = 60 * 60 * 1e3;
  const buckets = {};
  transactions.slice().sort((a, b) => a.ts - b.ts).map((txn) => {
    const bucket = Math.floor(txn.ts / windowMs) * windowMs;
    const entry = buckets[bucket] ?? { totalRisk: 0, count: 0, alerts: 0 };
    entry.totalRisk += txn.finalScore ?? txn.riskScore ?? 0;
    entry.count += 1;
    buckets[bucket] = entry;
    return txn;
  });
  alerts.forEach((alert) => {
    const bucket = Math.floor(alert.createdAt / windowMs) * windowMs;
    const entry = buckets[bucket] ?? { totalRisk: 0, count: 0, alerts: 0 };
    entry.alerts += 1;
    buckets[bucket] = entry;
  });
  const bucketKeys = Array.from(new Set(Object.keys(buckets).map(Number))).sort((a, b) => a - b);
  const latest = bucketKeys.length ? bucketKeys[bucketKeys.length - 1] : Math.floor(now / windowMs) * windowMs;
  const series = [];
  for (let i = 29; i >= 0; i -= 1) {
    const ts = latest - i * windowMs;
    const bucket = buckets[ts];
    series.push({
      window: formatWindow(ts),
      risk: bucket && bucket.count ? +(bucket.totalRisk / bucket.count).toFixed(2) : 0,
      alerts: bucket?.alerts ?? 0
    });
  }
  return series;
}
function buildRiskDistribution(transactions, alerts) {
  const values = transactions.map((txn) => txn.finalScore ?? txn.riskScore ?? 0);
  const buckets = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    CRITICAL: 0
  };
  values.forEach((score) => {
    if (score > 0.92) buckets.CRITICAL += 1;
    else if (score > 0.75) buckets.HIGH += 1;
    else if (score > 0.5) buckets.MEDIUM += 1;
    else buckets.LOW += 1;
  });
  alerts.forEach((alert) => {
    const score = alert.riskScore ?? 0;
    if (score > 0.92) buckets.CRITICAL += 1;
    else if (score > 0.75) buckets.HIGH += 1;
    else if (score > 0.5) buckets.MEDIUM += 1;
    else buckets.LOW += 1;
  });
  return [
    { name: "LOW", value: buckets.LOW, color: "oklch(0.7 0.18 240)" },
    { name: "MEDIUM", value: buckets.MEDIUM, color: "oklch(0.78 0.17 75)" },
    { name: "HIGH", value: buckets.HIGH, color: "oklch(0.62 0.24 22)" },
    { name: "CRITICAL", value: buckets.CRITICAL, color: "oklch(0.72 0.19 18)" }
  ].filter((bucket) => bucket.value > 0);
}
function buildChannelComposition(transactions) {
  const channels = /* @__PURE__ */ new Map();
  const canonical = (channel) => {
    if (!channel) return "UNKNOWN";
    const normalized = channel.toUpperCase();
    if (normalized.includes("UPI")) return "UPI";
    if (normalized.includes("WIRE")) return "WIRE";
    if (normalized.includes("ACH")) return "ACH";
    if (normalized.includes("CARD") || normalized.includes("VISA") || normalized.includes("MASTERCARD")) return "CARD";
    if (normalized.includes("SWIFT")) return "SWIFT";
    if (normalized.includes("CRYPTO") || normalized.includes("BTC") || normalized.includes("ETH")) return "CRYPTO";
    return normalized;
  };
  transactions.forEach((txn) => {
    const channel = canonical(txn.channel);
    const entry = channels.get(channel) ?? { riskSum: 0, count: 0 };
    entry.riskSum += txn.finalScore ?? txn.riskScore ?? 0;
    entry.count += 1;
    channels.set(channel, entry);
  });
  return Array.from(channels.entries()).map(([name, entry]) => ({ name, risk: +(entry.riskSum / Math.max(entry.count, 1)).toFixed(2), count: entry.count, color: name === "UPI" ? "oklch(0.7 0.18 240)" : name === "CARD" ? "oklch(0.62 0.24 22)" : name === "SWIFT" ? "oklch(0.78 0.17 75)" : name === "CRYPTO" ? "oklch(0.72 0.17 160)" : "oklch(0.65 0.2 300)" })).sort((a, b) => b.count - a.count);
}
function buildHeatmap(transactions) {
  const heat = Array.from({ length: 7 }, () => Array(24).fill(0));
  const counts = Array.from({ length: 7 }, () => Array(24).fill(0));
  transactions.forEach((txn) => {
    const d = new Date(txn.ts);
    const day = d.getDay();
    const hour = d.getHours();
    if (!Number.isFinite(day) || !Number.isFinite(hour) || day < 0 || day >= 7 || hour < 0 || hour >= 24) return;
    const score = txn.finalScore ?? txn.riskScore ?? 0;
    heat[day][hour] += score;
    counts[day][hour] += 1;
  });
  return heat.map((row, day) => row.map((total, hour) => counts[day][hour] ? Math.round(total / counts[day][hour] * 10) : 0));
}
const PIE_TOOLTIP_STYLE = {
  background: "#0f172a",
  color: "#f8fafc",
  border: "1px solid rgba(148, 163, 184, 0.28)",
  borderRadius: "10px",
  boxShadow: "0 14px 30px rgba(0, 0, 0, 0.45)",
  fontSize: 12,
  padding: "10px 12px"
};
function PieRiskTooltip({
  active,
  payload,
  label
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  const name = item?.name ?? label ?? "Risk";
  const value = item?.value ?? payload[0]?.value ?? 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: PIE_TOOLTIP_STYLE, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-slate-400", children: "Risk distribution" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 font-semibold text-slate-50", children: name }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-sm text-slate-200", children: Number(value).toLocaleString() })
  ] });
}
function Dashboard() {
  const m = useStore((s) => s.metrics || {});
  const liveTxns = useStore((s) => s.transactions);
  const metricsQ = useDashboardMetrics();
  const txnsQ = useRecentTransactions();
  const alertsQ = useAlerts();
  const casesQ = useCases();
  useGraphSnapshot();
  reactExports.useEffect(() => {
    if (txnsQ.data && !txnsQ.isFetching) mergeHistoricalTransactions(txnsQ.data);
  }, [txnsQ.data, txnsQ.isFetching]);
  reactExports.useEffect(() => {
    if (alertsQ.data && !alertsQ.isFetching) mergeHistoricalAlerts(alertsQ.data);
  }, [alertsQ.data, alertsQ.isFetching]);
  const recentTransactions = txnsQ.data ?? [];
  const liveTransactions = liveTxns ?? [];
  const casesList = casesQ.data ?? [];
  const dashboardTransactions = reactExports.useMemo(() => {
    const merged = /* @__PURE__ */ new Map();
    for (const txn of [...liveTransactions, ...recentTransactions]) {
      const raw = txn;
      const id = txn.transactionId || raw.transId || raw.trans_id || txn.id;
      if (id) merged.set(id, txn);
    }
    return Array.from(merged.values());
  }, [liveTransactions, recentTransactions]);
  const metrics = {
    totalTxn: metricsQ.data?.total_transactions ?? m.total_transactions ?? m.totalTxn ?? 0,
    blocked: metricsQ.data?.blocked_transactions ?? m.blocked_transactions ?? m.blocked ?? 0,
    reviewQueue: metricsQ.data?.review_queue ?? m.review_queue ?? m.reviewQueue ?? 0,
    p1: metricsQ.data?.high_risk_count ?? m.high_risk_count ?? m.p1 ?? 0,
    activeCases: metricsQ.data?.cases ?? (casesList.length > 0 ? casesList.length : m.cases ?? m.activeCases ?? 0),
    sar: metricsQ.data?.sar ?? m.sar ?? 0,
    mules: metricsQ.data?.mules ?? m.mules ?? 0,
    networkRisk: metricsQ.data?.escalations ?? m.escalations ?? m.networkRisk ?? 0
  };
  const alerts = alertsQ.data ?? [];
  const riskTrendSeries = buildRiskTrend(dashboardTransactions, alerts);
  const riskDistribution = buildRiskDistribution(dashboardTransactions, alerts);
  const channelRiskData = buildChannelComposition(dashboardTransactions);
  const fraudHeatmap = buildHeatmap(dashboardTransactions);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-semibold tracking-tight", children: "Command Center" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Real-time AML operations — global view" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[11px] mono text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-1 rounded border border-success/40 text-success bg-success/5", children: "SOC-1 NOMINAL" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-1 rounded border border-warning/40 text-warning bg-warning/5", children: "ELEVATED THREAT" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-1 rounded border border-border", children: "Window: 24h" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Total Txn (24h)", value: metrics.totalTxn.toLocaleString(), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-3.5 w-3.5" }), trend: {
        dir: "up",
        value: "4.2%"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Blocked", value: metrics.blocked.toLocaleString(), tone: "critical", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "h-3.5 w-3.5" }), trend: {
        dir: "up",
        value: "0.9%"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Review Queue", value: metrics.reviewQueue, tone: "warning", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-3.5 w-3.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "P1 Alerts", value: metrics.p1, tone: "critical", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3.5 w-3.5" }), sub: "SLA 15m" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Active Cases", value: metrics.activeCases, tone: "primary", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { className: "h-3.5 w-3.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "SAR Generated", value: metrics.sar, tone: "success", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FilePenLine, { className: "h-3.5 w-3.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Mule Accounts", value: metrics.mules, tone: "warning", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3.5 w-3.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Network Risk", value: `${metrics.networkRisk}`, tone: "critical", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(GitMerge, { className: "h-3.5 w-3.5" }), sub: "propagation score" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Risk & Alert Trend (30 windows)", className: "lg:col-span-2 h-64", children: txnsQ.isLoading || alertsQ.isLoading || metricsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full flex items-center justify-center text-xs text-muted-foreground", children: "Loading trend…" }) : txnsQ.isError || alertsQ.isError || metricsQ.isError ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full flex items-center justify-center text-xs text-danger", children: "Failed to load trend" }) : !riskTrendSeries.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full flex items-center justify-center text-xs text-muted-foreground", children: "No risk trend data available" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AreaChart, { data: riskTrendSeries, margin: {
        top: 10,
        right: 8,
        left: -20,
        bottom: 0
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("defs", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "g1", x1: "0", y1: "0", x2: "0", y2: "1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "oklch(0.7 0.18 240)", stopOpacity: 0.6 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "oklch(0.7 0.18 240)", stopOpacity: 0 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "g2", x1: "0", y1: "0", x2: "0", y2: "1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "oklch(0.62 0.24 22)", stopOpacity: 0.5 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "oklch(0.62 0.24 22)", stopOpacity: 0 })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { stroke: "var(--color-border)", strokeDasharray: "2 4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "window", tick: {
          fill: "var(--color-muted-foreground)",
          fontSize: 10
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: {
          fill: "var(--color-muted-foreground)",
          fontSize: 10
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: {
          background: "var(--color-popover)",
          border: "1px solid var(--color-border)",
          fontSize: 11
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Area, { dataKey: "risk", stroke: "oklch(0.7 0.18 240)", fill: "url(#g1)", strokeWidth: 1.5 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Area, { dataKey: "alerts", stroke: "oklch(0.62 0.24 22)", fill: "url(#g2)", strokeWidth: 1.5 })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Risk Distribution", className: "h-64", children: txnsQ.isLoading || alertsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full flex items-center justify-center text-xs text-muted-foreground", children: "Loading distribution…" }) : txnsQ.isError || alertsQ.isError ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full flex items-center justify-center text-xs text-danger", children: "Failed to load distribution" }) : !riskDistribution.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full flex items-center justify-center text-xs text-muted-foreground", children: "No report distribution data available" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: riskDistribution, dataKey: "value", nameKey: "name", innerRadius: 45, outerRadius: 75, stroke: "var(--color-card)", children: riskDistribution.map((d, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: d.color }, i)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(PieRiskTooltip, {}), cursor: {
            fill: "rgba(148, 163, 184, 0.08)"
          } })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-1 text-[10px] mono px-2", children: riskDistribution.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-sm", style: {
            background: d.color
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: d.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto", children: d.value.toLocaleString() })
        ] }, d.name)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Channel Risk Composition", className: "h-64 lg:col-span-2", children: txnsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full flex items-center justify-center text-xs text-muted-foreground", children: "Loading channels…" }) : txnsQ.isError ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full flex items-center justify-center text-xs text-danger", children: "Failed to load channel composition" }) : !channelRiskData.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full flex items-center justify-center text-xs text-muted-foreground", children: "No channel data available" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: channelRiskData, margin: {
        top: 8,
        right: 8,
        left: -12,
        bottom: 4
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { stroke: "var(--color-border)", strokeDasharray: "2 4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "name", tick: {
          fill: "var(--color-muted-foreground)",
          fontSize: 10
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: {
          fill: "var(--color-muted-foreground)",
          fontSize: 10
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: {
          background: "var(--color-popover)",
          border: "1px solid var(--color-border)",
          fontSize: 11
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "risk", fill: "oklch(0.7 0.18 240)", children: channelRiskData.map((d, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: d.color }, i)) })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Fraud Heatmap · day × hour", className: "h-64", children: txnsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full flex items-center justify-center text-xs text-muted-foreground", children: "Loading heatmap…" }) : txnsQ.isError ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full flex items-center justify-center text-xs text-danger", children: "Failed to load heatmap" }) : !fraudHeatmap.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full flex items-center justify-center text-xs text-muted-foreground", children: "No heatmap data available" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-rows-7 gap-0.5 h-full p-1", children: fraudHeatmap.map((row, ri) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-24 gap-0.5", style: {
        gridTemplateColumns: "repeat(24,1fr)"
      }, children: row.map((v, ci) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { title: `${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][ri]} ${ci}:00 · ${v}`, className: "rounded-[2px]", style: {
        background: v > 80 ? `oklch(0.62 0.24 22 / ${0.4 + v / 200})` : v > 50 ? `oklch(0.78 0.17 75 / ${0.3 + v / 200})` : `oklch(0.7 0.18 240 / ${0.1 + v / 300})`
      } }, ci)) }, ri)) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Live Transaction Stream", subtitle: "High-risk activity from last 60 seconds", className: "lg:col-span-2 h-72", dense: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-y-auto scrollbar-thin h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "sticky top-0 bg-card/90 backdrop-blur text-[10px] uppercase tracking-wider text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-1.5 font-medium", children: "Time" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "font-medium", children: "Txn ID" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "font-medium", children: "Sender → Receiver" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "font-medium text-right", children: "Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "font-medium", children: "Risk" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "font-medium", children: "Decision" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: dashboardTransactions.slice(0, 14).map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: `border-t border-border/50 hover:bg-accent/30 ${i === 0 ? "row-enter" : ""}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 mono text-[10px] text-muted-foreground", children: new Date(t.ts ?? Date.now()).toLocaleTimeString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "mono text-[10px]", children: t.id.slice(0, 18) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "text-[11px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: t.sender.slice(-7) }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "inline h-3 w-3 text-muted-foreground" }),
            " ",
            t.receiver.slice(-7)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "text-right mono", children: [
            t.currency,
            " ",
            t.amount.toLocaleString()
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RiskScoreBadge, { score: t.riskScore }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DecisionBadge, { d: t.decision }) })
        ] }, t.id)) })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Active Investigations", className: "h-72", dense: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-border/50 overflow-y-auto h-full scrollbar-thin", children: casesList.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "p-4 text-center text-xs text-muted-foreground", children: "No active investigations recorded" }) : casesList.slice(0, 10).map((c) => {
        const priority = c.priority || "P2";
        const displayId = c.caseId || c.id || "CASE";
        const displayTitle = c.title || `Investigation ${displayId}`;
        const officerName = c.officer || "Unassigned";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "p-2.5 flex items-center gap-2 hover:bg-accent/20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PriorityBadge, { p: priority }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs truncate", children: displayTitle }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground mono", children: [
              displayId,
              " · ",
              officerName
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-3.5 w-3.5 text-muted-foreground" })
        ] }, c.id || displayId);
      }) }) })
    ] })
  ] });
}
export {
  Dashboard as component
};
