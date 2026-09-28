import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { b as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { P as Panel } from "./Panel-CZ70JnZT.mjs";
import { P as PriorityBadge, S as StatusBadge } from "./Badges-CsqHi44P.mjs";
import { S as SLATimer } from "./SLATimer-BILC5wrW.mjs";
import { a as useCases, b as useCreateCase, u as useAssignCase, c as useFreezeCase, d as useSarCase } from "./useCases-C6WVsqI0.mjs";
import { u as useAlerts } from "./useAlerts-OAbqpngd.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { R as Plus, h as Briefcase, ad as X, a2 as Snowflake, l as CircleCheck, u as FileText } from "../_libs/lucide-react.mjs";
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
import "../_libs/tanstack__query-core.mjs";
import "./cases-CBs17Qbj.mjs";
import "./router-DXMls9-H.mjs";
import "./caseNormalizer-BzVobBFG.mjs";
function CasesPage() {
  const [selected, setSelected] = reactExports.useState(null);
  const [status, setStatus] = reactExports.useState("ALL");
  const {
    data: list = [],
    isLoading,
    isError
  } = useCases();
  const alertsQ = useAlerts();
  const queryClient = useQueryClient();
  const createCase = useCreateCase();
  const assignCase = useAssignCase();
  const freezeCase = useFreezeCase();
  const sarCase = useSarCase();
  const filtered = list.filter((c) => status === "ALL" || c.status === status);
  const formatCaseDate = (timestamp, includeTime = false) => {
    if (timestamp == null || !Number.isFinite(timestamp)) return "Date unavailable";
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "Date unavailable";
    return includeTime ? date.toLocaleString() : date.toLocaleDateString();
  };
  const handleAssign = async () => {
    if (!selected) return;
    try {
      await assignCase.mutateAsync({
        id: selected.id,
        officerId: "A. Khan"
      });
      await queryClient.invalidateQueries({
        queryKey: ["cases", "list"]
      });
      toast.success(`Assigned ${selected.id}`);
    } catch (error) {
      toast.error(`Failed to assign ${selected.id}`);
    }
  };
  const handleFreeze = async () => {
    if (!selected) return;
    try {
      await freezeCase.mutateAsync(selected.id);
      await queryClient.invalidateQueries({
        queryKey: ["cases", "list"]
      });
      toast.success(`Freeze requested for ${selected.id}`);
    } catch (error) {
      toast.error(`Failed to freeze ${selected.id}`);
    }
  };
  const handleSar = async () => {
    if (!selected) return;
    try {
      await sarCase.mutateAsync(selected.id);
      await queryClient.invalidateQueries({
        queryKey: ["cases", "list"]
      });
      toast.success(`SAR generated for ${selected.id}`);
    } catch (error) {
      toast.error(`Failed to generate SAR for ${selected.id}`);
    }
  };
  const handleNewCase = async () => {
    const sourceAlert = alertsQ.data?.[0]?.alertId ?? alertsQ.data?.[0]?.id;
    if (!sourceAlert) {
      toast.error("No alerts available to create a case.");
      return;
    }
    try {
      const created = await createCase.mutateAsync({
        case_id: `CASE-${Date.now()}`,
        title: "Manual AML investigation case",
        priority: "P3",
        status: "OPEN",
        source_alert: sourceAlert,
        source_alerts: [sourceAlert],
        evidence: ["Created from UI"],
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      await queryClient.invalidateQueries({
        queryKey: ["cases", "list"]
      });
      setSelected(created);
      toast.success(`Created ${created.id}`);
    } catch (error) {
      toast.error("Failed to create case");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-semibold tracking-tight", children: "Case Registry" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Investigation registry · ",
          list.length,
          " cases · ",
          list.filter((c) => c.status === "SAR_FILED").length,
          " SARs filed"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleNewCase, className: "h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
        " New Case"
      ] })
    ] }),
    isError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-danger/40 bg-danger/5 px-3 py-2 text-xs text-danger", children: "Backend unavailable. Case registry could not be loaded." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1.5 text-[11px]", children: ["ALL", "OPEN", "IN_REVIEW", "ESCALATED", "SAR_FILED", "CLOSED"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setStatus(s), className: `h-8 px-3 rounded-md mono border ${status === s ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card/60"}`, children: s }, s)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: `${filtered.length} cases`, dense: true, children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-40 flex items-center justify-center text-xs text-muted-foreground", children: "Loading cases…" }) : !filtered.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-40 flex items-center justify-center text-xs text-muted-foreground", children: "No cases available from backend" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-auto scrollbar-thin max-h-[calc(100vh-280px)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "sticky top-0 bg-card/95 backdrop-blur text-[10px] uppercase tracking-wider text-muted-foreground z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "text-left border-b border-border", children: ["Case ID", "Pri", "Title", "Linked Alerts", "Officer", "Status", "Created", "SLA", "Escalation"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-2 font-medium", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { onClick: () => setSelected(c), className: "border-b border-border/50 cursor-pointer hover:bg-accent/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1.5 mono text-[11px]", children: c.id }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(PriorityBadge, { p: c.priority }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-xs", children: c.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "text-[11px] text-muted-foreground", children: [
          c.linkedAlerts,
          " alerts"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-[11px]", children: c.officer }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: c.status }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "mono text-[10px] text-muted-foreground", children: formatCaseDate(c.createdAt) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: c.slaDueAt == null ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(SLATimer, { dueAt: c.slaDueAt }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "mono text-[10px] text-warning", children: c.escalation || "—" })
      ] }, c.id)) })
    ] }) }) }),
    selected && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-50 flex", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 bg-background/60 backdrop-blur-sm", onClick: () => setSelected(null) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "w-[640px] bg-card border-l border-border overflow-y-auto scrollbar-thin", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "sticky top-0 z-10 bg-card/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { className: "h-4 w-4 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: "Case" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mono text-sm", children: selected.id })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSelected(null), className: "h-7 w-7 rounded hover:bg-accent flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: selected.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/mule-ring-investigator", search: {
            accountId: selected.userId,
            caseId: selected.caseId ?? selected.id,
            alertId: selected.sourceAlert
          }, className: "inline-flex min-h-10 items-center rounded-md border border-rose-800/70 bg-rose-950/30 px-3 text-xs font-semibold text-rose-200 hover:bg-rose-950/60", children: "Open Mule Ring Investigation" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Officer", value: selected.officer }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Status", value: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: selected.status }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Escalation", value: selected.escalation || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Linked alerts", value: `${selected.linkedAlerts}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Created", value: formatCaseDate(selected.createdAt, true) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "SLA", value: selected.slaDueAt == null ? "—" : /* @__PURE__ */ jsxRuntimeExports.jsx(SLATimer, { dueAt: selected.slaDueAt }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "SAR status", value: selected.sarStatus ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Source alert", value: selected.sourceAlert ?? selected.sourceAlerts?.[0] ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Case id", value: selected.caseId ?? selected.id })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleAssign, className: "h-8 px-3 rounded-md border border-border bg-card/60", children: "Assign" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleFreeze, className: "h-8 px-3 rounded-md border border-warning/40 text-warning bg-warning/5 flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Snowflake, { className: "h-3 w-3" }),
              " Freeze"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleSar, className: "h-8 px-3 rounded-md border border-primary/40 text-primary bg-primary/10 flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }),
              " SAR"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5", children: "Investigation Timeline" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "relative border-l border-border ml-3 space-y-3 text-xs", children: (selected.evidence?.length ? selected.evidence : [selected.status, selected.escalation, selected.officer ?? "unassigned"]).map((entry, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "ml-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -left-[5px] mt-1.5 h-2 w-2 rounded-full bg-primary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mono text-[10px] text-muted-foreground", children: [
                "Event ",
                i + 1
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: String(entry) })
            ] }, i)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5", children: "Audit Trail" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-border bg-card/40 divide-y divide-border/50 text-[11px]", children: [selected.caseId ?? selected.id, selected.status, selected.escalation, selected.sarStatus ?? "SAR_PENDING"].map((a, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-1.5 flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mono text-muted-foreground", children: String(a) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3 w-3 text-muted-foreground" })
            ] }, `audit-${idx}-${String(a)}`)) })
          ] })
        ] })
      ] })
    ] })
  ] });
}
function Field({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-card/40 p-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 mono text-xs", children: value })
  ] });
}
export {
  CasesPage as component
};
