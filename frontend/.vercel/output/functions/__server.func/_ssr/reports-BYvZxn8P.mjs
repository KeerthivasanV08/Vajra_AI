import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { S as StatCard, P as Panel } from "./Panel-CZ70JnZT.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useAlerts } from "./useAlerts-OAbqpngd.mjs";
import { a as useCases } from "./useCases-C6WVsqI0.mjs";
import { a as useQuery, u as useMutation } from "../_libs/tanstack__react-query.mjs";
import { client, extractList } from "./router-DXMls9-H.mjs";
import { D as Download, t as FileSpreadsheet, u as FileText, s as FilePenLine } from "../_libs/lucide-react.mjs";
import { R as ResponsiveContainer, b as BarChart, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, B as Bar, d as PieChart, P as Pie, c as Cell } from "../_libs/recharts.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./cases-CBs17Qbj.mjs";
import "./caseNormalizer-BzVobBFG.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
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
function normalizeReport(raw) {
  const id = String(raw?.id ?? raw?.report_id ?? raw?.reportId ?? `${raw?.report_type ?? "REPORT"}-${raw?.timestamp ?? Date.now()}`);
  const timestamp = Number(raw?.timestamp ?? raw?.created_at ?? raw?.createdAt ?? Date.now());
  return {
    id,
    reportId: raw?.report_id ?? raw?.reportId ?? id,
    reportType: String(raw?.report_type ?? raw?.reportType ?? "MANUAL_REVIEW_ESCALATION"),
    userId: raw?.user_id ?? raw?.userId,
    transactionId: raw?.transaction_id ?? raw?.transactionId,
    decision: raw?.decision,
    finalScore: raw?.final_score != null ? Number(raw.final_score) : raw?.finalScore != null ? Number(raw.finalScore) : void 0,
    behaviorScore: raw?.behavior_score != null ? Number(raw.behavior_score) : raw?.behaviorScore != null ? Number(raw.behaviorScore) : void 0,
    sequenceScore: raw?.sequence_score != null ? Number(raw.sequence_score) : raw?.sequenceScore != null ? Number(raw.sequenceScore) : void 0,
    graphScore: raw?.graph_score != null ? Number(raw.graph_score) : raw?.graphScore != null ? Number(raw.graphScore) : void 0,
    ruleScore: raw?.rule_score != null ? Number(raw.rule_score) : raw?.ruleScore != null ? Number(raw.ruleScore) : void 0,
    officerRecommendation: raw?.officer_recommendation ?? raw?.officerRecommendation,
    immediateAction: raw?.immediate_action ?? raw?.immediateAction,
    reason: raw?.reason,
    reasons: Array.isArray(raw?.reasons) ? raw.reasons : raw?.reasons ? [String(raw.reasons)] : void 0,
    amount: raw?.amount != null ? Number(raw.amount) : void 0,
    sourceEngine: raw?.source_engine ?? raw?.sourceEngine,
    escalationLevel: raw?.escalation_level ?? raw?.escalationLevel,
    reviewStatus: raw?.review_status ?? raw?.reviewStatus,
    evidence: Array.isArray(raw?.evidence) ? raw.evidence : raw?.evidence ? [raw.evidence] : void 0,
    metadata: raw?.metadata && typeof raw.metadata === "object" ? raw.metadata : void 0,
    timestamp
  };
}
function extractReports(raw) {
  return extractList(raw).map(normalizeReport);
}
async function fetchReports() {
  const raw = await client.request({ path: "/api/reports" });
  return extractReports(raw);
}
async function fetchSarReports() {
  const raw = await client.request({ path: "/api/reports/sar" });
  return extractReports(raw);
}
async function fetchStrReports() {
  const raw = await client.request({ path: "/api/reports/str" });
  return extractReports(raw);
}
async function fetchHighRiskReports() {
  const raw = await client.request({ path: "/api/reports/high-risk" });
  return extractReports(raw);
}
async function fetchManualReviewReports() {
  const raw = await client.request({ path: "/api/reports/manual-review" });
  return extractReports(raw);
}
async function exportReport(format) {
  return client.request({ path: `/api/reports/export?format=${format}` });
}
function useReports() {
  return useQuery({ queryKey: ["reports", "list"], queryFn: fetchReports, staleTime: 6e4 });
}
function useSarReports() {
  return useQuery({ queryKey: ["reports", "sar"], queryFn: fetchSarReports, staleTime: 6e4 });
}
function useStrReports() {
  return useQuery({ queryKey: ["reports", "str"], queryFn: fetchStrReports, staleTime: 6e4 });
}
function useHighRiskReports() {
  return useQuery({ queryKey: ["reports", "high-risk"], queryFn: fetchHighRiskReports, staleTime: 6e4 });
}
function useManualReviewReports() {
  return useQuery({ queryKey: ["reports", "manual-review"], queryFn: fetchManualReviewReports, staleTime: 6e4 });
}
function useExportReport() {
  return useMutation({ mutationFn: (fmt) => exportReport(fmt) });
}
function ReportsPage() {
  const reportsQ = useReports();
  const sarQ = useSarReports();
  const strQ = useStrReports();
  const highRiskQ = useHighRiskReports();
  const manualReviewQ = useManualReviewReports();
  const exportReport2 = useExportReport();
  const alertsQ = useAlerts();
  const casesQ = useCases();
  const reportList = reportsQ.data ?? [];
  const alertList = alertsQ.data ?? [];
  const alertEscalations = alertsQ.escalations ?? [];
  const caseList = casesQ.data ?? [];
  const workloadLoading = reportsQ.isLoading || casesQ.isLoading || alertsQ.isLoading;
  sarQ.isLoading || strQ.isLoading || highRiskQ.isLoading || manualReviewQ.isLoading;
  const handleExport = async (format) => {
    if (format === "pdf" && true) {
      toast.error("PDF export not available from backend");
      return;
    }
    try {
      const payload = await exportReport2.mutateAsync(format);
      const data = typeof payload === "string" ? payload : JSON.stringify(payload);
      const mimeType = format === "csv" ? "text/csv" : "application/json";
      const blob = new Blob([data], {
        type: mimeType
      });
      const name = `reports.${format === "json" ? "json" : format === "csv" ? "csv" : "json"}`;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = name;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${name}`);
    } catch (error) {
      toast.error("Export failed");
    }
  };
  const officerWorkload = reactExports.useMemo(() => {
    const workload = /* @__PURE__ */ new Map();
    const add = (officer, open = 0, closed = 0, sar = 0) => {
      const key = officer || "Unassigned";
      const current = workload.get(key) ?? {
        open: 0,
        closed: 0,
        sar: 0
      };
      workload.set(key, {
        officer: key,
        open: current.open + open,
        closed: current.closed + closed,
        sar: current.sar + sar
      });
    };
    if (caseList.length) {
      for (const c of caseList) {
        const officer = c.officer ?? "Unassigned";
        if (c.status === "CLOSED") add(officer, 0, 1, 0);
        else if (c.status === "SAR_FILED") add(officer, 0, 0, 1);
        else add(officer, 1, 0, 0);
      }
    } else if (alertList.length) {
      for (const alert of alertList) {
        const officer = alert.assignedOfficer ?? "Unassigned";
        if (alert.status === "CLOSED") add(officer, 0, 1, 0);
        else add(officer, 1, 0, 0);
      }
    } else {
      for (const report of reportList) {
        const officer = report.officerRecommendation ?? report.sourceEngine ?? report.reportType ?? "System";
        if (report.reportType === "SAR") add(officer, 0, 0, 1);
        else if (report.reviewStatus === "CLOSED") add(officer, 0, 1, 0);
        else add(officer, 1, 0, 0);
      }
    }
    return Array.from(workload.values()).slice(0, 8);
  }, [caseList, alertList, reportList]);
  const riskDistribution = reactExports.useMemo(() => {
    const buckets = [{
      name: "SAR",
      value: sarQ.data?.length ?? 0,
      color: "oklch(0.62 0.24 22)"
    }, {
      name: "STR",
      value: strQ.data?.length ?? 0,
      color: "oklch(0.78 0.17 75)"
    }, {
      name: "High risk",
      value: highRiskQ.data?.length ?? 0,
      color: "oklch(0.7 0.18 240)"
    }, {
      name: "Manual review",
      value: manualReviewQ.data?.length ?? 0,
      color: "oklch(0.72 0.17 160)"
    }];
    const total = buckets.reduce((sum, bucket) => sum + bucket.value, 0) || 1;
    return buckets.map((bucket) => ({
      ...bucket,
      pct: Math.round(bucket.value / total * 100)
    }));
  }, [sarQ.data?.length, strQ.data?.length, highRiskQ.data?.length, manualReviewQ.data?.length]);
  const auditRows = reactExports.useMemo(() => [...reportList].sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0)).slice(0, 24), [reportList]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-semibold tracking-tight", children: "Reports & Audit Center" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Regulatory reporting · SAR / STR workflows · 30-day audit log" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleExport("json"), disabled: exportReport2.isLoading, className: "h-8 px-3 rounded-md border border-border bg-card/60 text-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3.5 w-3.5" }),
          " JSON"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleExport("csv"), disabled: exportReport2.isLoading, className: "h-8 px-3 rounded-md border border-border bg-card/60 text-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { className: "h-3.5 w-3.5" }),
          " CSV"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleExport("pdf"), disabled: true, title: "PDF export not available from backend", className: "h-8 px-3 rounded-md border border-border bg-card/60 text-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5" }),
          " PDF"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground", children: "PDF export not available from backend" }),
        alertEscalations.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
          alertEscalations.length,
          " alert escalations loaded"
        ] })
      ] })
    ] }),
    (reportsQ.isError || sarQ.isError || strQ.isError || highRiskQ.isError || manualReviewQ.isError) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-danger/40 bg-danger/5 px-3 py-2 text-xs text-danger", children: "Backend unavailable. Reports could not be fully loaded." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "SAR filed (30d)", value: sarQ.data?.length ?? 0, tone: "primary", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FilePenLine, { className: "h-3.5 w-3.5" }), trend: {
        dir: "up",
        value: "live"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "STR filed (30d)", value: strQ.data?.length ?? 0, tone: "warning" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "High risk", value: highRiskQ.data?.length ?? 0, tone: "success" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Manual review", value: manualReviewQ.data?.length ?? 0 })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Officer Workload", className: "h-72 lg:col-span-2", children: workloadLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full flex items-center justify-center text-xs text-muted-foreground", children: "Loading workload…" }) : !officerWorkload.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full flex items-center justify-center text-xs text-muted-foreground", children: "No report workload data available" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: officerWorkload, margin: {
        top: 10,
        right: 8,
        left: -20,
        bottom: 0
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { stroke: "var(--color-border)", strokeDasharray: "2 4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "officer", tick: {
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "open", fill: "oklch(0.78 0.17 75)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "closed", fill: "oklch(0.72 0.17 160)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "sar", fill: "oklch(0.7 0.18 240)" })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Risk Category Breakdown", className: "h-72", children: reportsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full flex items-center justify-center text-xs text-muted-foreground", children: "Loading distribution…" }) : !riskDistribution.some((bucket) => bucket.value > 0) ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full flex items-center justify-center text-xs text-muted-foreground", children: "No report distribution data available" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: riskDistribution.filter((bucket) => bucket.value > 0), dataKey: "value", nameKey: "name", innerRadius: 40, outerRadius: 75, children: riskDistribution.filter((bucket) => bucket.value > 0).map((d, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: d.color }, i)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: {
          background: "var(--color-popover)",
          border: "1px solid var(--color-border)",
          fontSize: 11
        } })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Audit Log · last 30 days", dense: true, children: reportsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-40 flex items-center justify-center text-xs text-muted-foreground", children: "Loading audit log…" }) : !auditRows.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-40 flex items-center justify-center text-xs text-muted-foreground", children: "No audit records available from backend" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-auto scrollbar-thin max-h-[calc(100vh-560px)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "sticky top-0 bg-card/95 backdrop-blur text-[10px] uppercase tracking-wider text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "text-left border-b border-border", children: ["Timestamp", "Action", "Officer", "Target", "Status"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 font-medium", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: auditRows.map((a, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/50 hover:bg-accent/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 mono text-[10px] text-muted-foreground", children: new Date(a.timestamp ?? Date.now()).toISOString() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "mono text-[11px]", children: a.reportType }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: a.officerRecommendation ?? a.sourceEngine ?? "system" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "mono text-[11px]", children: a.transactionId ?? a.userId ?? a.reportId ?? a.id }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] mono px-1.5 py-0.5 rounded border border-border text-muted-foreground", children: a.reviewStatus ?? a.escalationLevel ?? "OPEN" }) })
      ] }, i)) })
    ] }) }) })
  ] });
}
export {
  ReportsPage as component
};
