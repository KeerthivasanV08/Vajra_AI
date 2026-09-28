import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { b as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { useStore, mergeHistoricalAlerts, API_BASE } from "./router-DXMls9-H.mjs";
import { P as Panel } from "./Panel-CZ70JnZT.mjs";
import { P as PriorityBadge, R as RiskScoreBadge, S as StatusBadge } from "./Badges-CsqHi44P.mjs";
import { S as SLATimer } from "./SLATimer-BILC5wrW.mjs";
import { E as ExplainabilityPanel } from "./ExplainabilityPanel-zKW048Vf.mjs";
import { u as useAlerts } from "./useAlerts-OAbqpngd.mjs";
import { c as createCase } from "./cases-CBs17Qbj.mjs";
import { f as freeze, s as sar } from "./officer-CEPf9Y1X.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { a7 as UserCheck, f as ArrowUpRight, a2 as Snowflake, s as FilePenLine, l as CircleCheck, E as LoaderCircle, ad as X } from "../_libs/lucide-react.mjs";
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
import "./caseNormalizer-BzVobBFG.mjs";
function AlertsPage() {
  const alerts = useStore((s) => s.alerts);
  const alertsQ = useAlerts();
  const queryClient = useQueryClient();
  reactExports.useEffect(() => {
    if (alertsQ.data && !alertsQ.isFetching) mergeHistoricalAlerts(alertsQ.data || []);
  }, [alertsQ.data, alertsQ.isFetching]);
  const [queue, setQueue] = reactExports.useState("ALL");
  const [selected, setSelected] = reactExports.useState(null);
  const [busyAction, setBusyAction] = reactExports.useState(null);
  const refreshQueues = async () => {
    await queryClient.invalidateQueries();
  };
  const withBusy = async (key, task) => {
    setBusyAction(key);
    try {
      await task();
    } finally {
      setBusyAction((current) => current === key ? null : current);
    }
  };
  const triggerDownload = (downloadUrl) => {
    const absolute = new URL(downloadUrl, API_BASE).toString();
    const link = document.createElement("a");
    link.href = absolute;
    link.rel = "noreferrer";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };
  const ensureCaseForAlert = async (alert) => {
    if (alert.caseId) {
      return alert.caseId;
    }
    const created = await createCase({
      case_id: `CASE-${alert.id}`,
      title: alert.summary ? `Alert ${alert.id}: ${alert.summary}` : `Manual review for alert ${alert.id}`,
      priority: alert.priority,
      status: "OPEN",
      source_alert: alert.id,
      source_alert_id: alert.id,
      source_alerts: [alert.id],
      evidence: alert.signals ?? [],
      created_at: new Date(alert.createdAt ?? Date.now()).toISOString()
    });
    return created.caseId ?? created.id ?? created.case_id ?? "";
  };
  const handleAcknowledge = async (alertId) => {
    await withBusy(`ack:${alertId}`, async () => {
      try {
        await alertsQ.acknowledge(alertId);
        await refreshQueues();
        toast.success(`Acknowledged ${alertId}`);
      } catch (error) {
        toast.error(`Failed to acknowledge ${alertId}`);
      }
    });
  };
  const handleEscalate = async (alertId) => {
    await withBusy(`esc:${alertId}`, async () => {
      try {
        await alertsQ.escalate(alertId);
        await refreshQueues();
        toast.success(`Escalated ${alertId}`);
      } catch (error) {
        toast.error(`Failed to escalate ${alertId}`);
      }
    });
  };
  const handleFreeze = async (alert) => {
    await withBusy(`freeze:${alert.id}`, async () => {
      try {
        const caseId = await ensureCaseForAlert(alert);
        await freeze({
          user_id: alert.userId,
          case_id: caseId,
          officer_id: "OFFICER_1",
          freeze_type: "DEBIT_FREEZE",
          reason: alert.summary ?? `Freeze requested for alert ${alert.id}`
        });
        await refreshQueues();
        toast.success(`Freeze requested for ${alert.userId}`);
      } catch (error) {
        toast.error(`Failed to freeze alert ${alert.id}`);
      }
    });
  };
  const handleSar = async (alert) => {
    await withBusy(`sar:${alert.id}`, async () => {
      try {
        const caseId = await ensureCaseForAlert(alert);
        let result;
        try {
          result = await sar({
            case_id: caseId,
            officer_id: "OFFICER_1",
            notes: alert.summary ?? `SAR requested from alert ${alert.id}`,
            filing_type: "INTERNAL"
          }, 6e4);
        } catch (firstError) {
          try {
            result = await sar({
              alert_id: alert.id,
              officer_id: "OFFICER_1",
              notes: alert.summary ?? `SAR requested from alert ${alert.id}`,
              filing_type: "INTERNAL"
            }, 6e4);
          } catch (fallbackError) {
            console.error("SAR generation failed for alert", alert.id, {
              firstError,
              fallbackError
            });
            throw fallbackError;
          }
        }
        const downloadUrl = result?.download_url;
        if (downloadUrl) {
          triggerDownload(downloadUrl);
        }
        toast.success(`SAR generated for alert ${alert.id}`);
        refreshQueues().catch(() => void 0);
      } catch (error) {
        console.error("Failed to create SAR for alert", alert.id, error);
        const message = error instanceof Error ? error.message : String(error ?? "Unknown error");
        toast.error(`Failed to create SAR for alert ${alert.id}: ${message}`);
      }
    });
  };
  const handleClose = async (alertId) => {
    await withBusy(`close:${alertId}`, async () => {
      try {
        await alertsQ.close(alertId);
        await refreshQueues();
        toast.success(`Closed ${alertId}`);
      } catch (error) {
        toast.error(`Failed to close ${alertId}`);
      }
    });
  };
  const filtered = alerts.filter((a) => queue === "ALL" || a.queue === queue);
  const counts = {
    ALL: alerts.length,
    AML_CRITICAL_QUEUE: alerts.filter((a) => a.queue === "AML_CRITICAL_QUEUE").length,
    AML_REVIEW_QUEUE: alerts.filter((a) => a.queue === "AML_REVIEW_QUEUE").length,
    AML_MONITORING_QUEUE: alerts.filter((a) => a.queue === "AML_MONITORING_QUEUE").length,
    AML_INFO_QUEUE: alerts.filter((a) => a.queue === "AML_INFO_QUEUE").length
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-semibold tracking-tight", children: "Alert Center" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Operational alert queue · SLA-driven prioritization · auto-routing engine v2.4" })
    ] }) }),
    alertsQ.isError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-danger/40 bg-danger/5 px-3 py-2 text-xs text-danger", children: "Backend unavailable. Alerts could not be loaded." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1.5 text-[11px]", children: ["ALL", "AML_CRITICAL_QUEUE", "AML_REVIEW_QUEUE", "AML_MONITORING_QUEUE", "AML_INFO_QUEUE"].map((q) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setQueue(q), className: `h-8 px-3 rounded-md mono border ${queue === q ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card/60 hover:bg-card"}`, children: [
      q === "ALL" ? q : q.split("_").join(" "),
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-60 ml-1", children: counts[q] })
    ] }, q)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: `${filtered.length} alerts in queue`, dense: true, children: alertsQ.isLoading && !alerts.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-40 flex items-center justify-center text-xs text-muted-foreground", children: "Loading alerts…" }) : !filtered.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-40 flex items-center justify-center text-xs text-muted-foreground", children: "No alerts available from backend" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-auto scrollbar-thin max-h-[calc(100vh-260px)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "sticky top-0 bg-card/95 backdrop-blur text-[10px] uppercase tracking-wider text-muted-foreground z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "text-left border-b border-border", children: ["Pri", "Alert ID", "Type", "User", "Risk", "Queue", "Officer", "SLA", "Created", "Status", "Actions"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-2 font-medium", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.slice(0, 80).map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { onClick: () => setSelected(a), className: `border-b border-border/50 cursor-pointer hover:bg-accent/30 ${a.priority === "P1" ? "bg-critical/[0.04]" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PriorityBadge, { p: a.priority }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "mono text-[11px]", children: a.id }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: a.type }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mono text-[10px]", children: a.userId }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground text-[10px]", children: a.userName })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RiskScoreBadge, { score: a.riskScore }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "mono text-[10px] text-muted-foreground", children: a.queue.replace("_", " ") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-[11px]", children: a.assignedOfficer ?? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground italic", children: "unassigned" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SLATimer, { dueAt: a.slaDueAt }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "mono text-[10px] text-muted-foreground", children: a.createdAt ? new Date(a.createdAt).toLocaleString(void 0, {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit"
        }) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: a.status }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ActionIcon, { icon: UserCheck, label: "Acknowledge", onClick: () => handleAcknowledge(a.id), loading: busyAction === `ack:${a.id}`, disabled: busyAction !== null && busyAction !== `ack:${a.id}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ActionIcon, { icon: ArrowUpRight, label: "Escalate", onClick: () => handleEscalate(a.id), tone: "warning", loading: busyAction === `esc:${a.id}`, disabled: busyAction !== null && busyAction !== `esc:${a.id}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ActionIcon, { icon: Snowflake, label: "Freeze account", onClick: () => handleFreeze(a), tone: "critical", loading: busyAction === `freeze:${a.id}`, disabled: busyAction !== null && busyAction !== `freeze:${a.id}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ActionIcon, { icon: FilePenLine, label: "Create SAR", onClick: () => handleSar(a), tone: "primary", loading: busyAction === `sar:${a.id}`, disabled: busyAction !== null && busyAction !== `sar:${a.id}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ActionIcon, { icon: CircleCheck, label: "Close", onClick: () => handleClose(a.id), tone: "success", loading: busyAction === `close:${a.id}`, disabled: busyAction !== null && busyAction !== `close:${a.id}` })
        ] }) })
      ] }, a.id)) })
    ] }) }) }),
    selected && /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDrawer, { a: selected, onClose: () => setSelected(null) })
  ] });
}
function ActionIcon({
  icon: Icon,
  label,
  onClick,
  tone = "default",
  disabled = false,
  loading = false
}) {
  const t = {
    default: "text-muted-foreground hover:text-foreground hover:bg-accent",
    warning: "text-warning hover:bg-warning/10",
    critical: "text-critical hover:bg-critical/10",
    primary: "text-primary hover:bg-primary/10",
    success: "text-success hover:bg-success/10"
  }[tone];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick, title: label, disabled: disabled || loading, className: `h-6 w-6 rounded border border-border flex items-center justify-center transition ${t} ${disabled || loading ? "opacity-50 cursor-not-allowed" : ""}`, children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3 w-3" }) });
}
function AlertDrawer({
  a,
  onClose
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-50 flex", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 bg-background/60 backdrop-blur-sm", onClick: onClose }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "w-[600px] bg-card border-l border-border overflow-y-auto scrollbar-thin", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "sticky top-0 z-10 bg-card/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PriorityBadge, { p: a.priority }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: "Alert" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mono text-sm", children: [
              a.id,
              " · ",
              a.type
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "h-7 w-7 rounded hover:bg-accent flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "User", value: a.userId }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Officer", value: a.assignedOfficer ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "SLA", value: /* @__PURE__ */ jsxRuntimeExports.jsx(SLATimer, { dueAt: a.slaDueAt }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Channel", value: a.channel }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Amount", value: a.amount != null ? `₹ ${a.amount.toLocaleString()}` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Status", value: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: a.status }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-mono text-slate-400 uppercase font-semibold", children: "VAJRA Interception Shortcuts" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 font-mono", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/mule-ring-investigator", search: {
              accountId: a.userId,
              caseId: a.caseId || void 0,
              alertId: a.id
            }, className: "p-2 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 text-center transition", children: "Mule Ring Analysis →" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/legal-dossier-vault", search: {
              caseId: a.caseId || void 0
            }, className: "p-2 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 text-center transition", children: "Legal Dossier PDF →" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ExplainabilityPanel, { finalScore: a.riskScore, decision: a.priority === "P1" ? "BLOCK" : "REVIEW" })
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
  AlertsPage as component
};
