import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useQueryClient, u as useMutation } from "../_libs/tanstack__react-query.mjs";
import { P as Panel } from "./Panel-CZ70JnZT.mjs";
import { P as PriorityBadge, D as DecisionBadge, R as RiskScoreBadge, S as StatusBadge } from "./Badges-CsqHi44P.mjs";
import { S as SLATimer } from "./SLATimer-BILC5wrW.mjs";
import { E as ExplainabilityPanel } from "./ExplainabilityPanel-zKW048Vf.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useAlerts } from "./useAlerts-OAbqpngd.mjs";
import { a as useCases, u as useAssignCase } from "./useCases-C6WVsqI0.mjs";
import { w as whitelistOfficer, e as escalate, s as sar, f as freeze, r as review } from "./officer-CEPf9Y1X.mjs";
import { closeAlert } from "./router-DXMls9-H.mjs";
import { a2 as Snowflake, f as ArrowUpRight, s as FilePenLine, a9 as UserPlus, a4 as ThumbsDown, l as CircleCheck } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./cases-CBs17Qbj.mjs";
import "./caseNormalizer-BzVobBFG.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
function useOfficerActions() {
  const qc = useQueryClient();
  const refresh = () => {
    qc.invalidateQueries();
  };
  const reviewM = useMutation({ mutationFn: (p) => review(p), onSuccess: refresh });
  const freezeM = useMutation({ mutationFn: (p) => freeze(p), onSuccess: refresh });
  const sarM = useMutation({ mutationFn: (p) => sar(p), onSuccess: refresh });
  const escalateM = useMutation({ mutationFn: (p) => escalate(p), onSuccess: refresh });
  const whitelistM = useMutation({ mutationFn: (p) => whitelistOfficer(p), onSuccess: refresh });
  return {
    review: reviewM.mutateAsync,
    freeze: freezeM.mutateAsync,
    sar: sarM.mutateAsync,
    escalate: escalateM.mutateAsync,
    whitelist: whitelistM.mutateAsync
  };
}
const QUEUE_OPTIONS = [{
  id: "P1_QUEUE",
  label: "P1 — Critical",
  tone: "critical",
  snapshotKey: "P1_QUEUE"
}, {
  id: "ESCALATED",
  label: "Escalated",
  tone: "warning"
}, {
  id: "EDD",
  label: "EDD Review",
  tone: "info",
  snapshotKey: "EDD_QUEUE"
}, {
  id: "MANUAL_REVIEW",
  label: "Manual Review",
  tone: "default",
  snapshotKey: "MANUAL_REVIEW_QUEUE"
}];
function OfficerReview() {
  const queryClient = useQueryClient();
  const alertsQ = useAlerts();
  const casesQ = useCases();
  const officerActions = useOfficerActions();
  const assignCase = useAssignCase();
  const [activeQueue, setActiveQueue] = reactExports.useState("P1_QUEUE");
  const [selectedId, setSelectedId] = reactExports.useState(null);
  const alerts = alertsQ.data ?? [];
  const alertQueue = alertsQ.queue.data;
  const queueItems = reactExports.useMemo(() => {
    switch (activeQueue) {
      case "P1_QUEUE":
        return alertsQ.p1.data ?? [];
      case "ESCALATED":
        return alerts.filter((alert) => alert.status === "ESCALATED" || alert.queue === "ESCALATED");
      case "EDD":
        return alerts.filter((alert) => alert.queue === "EDD_QUEUE");
      case "MANUAL_REVIEW":
        return alerts.filter((alert) => alert.queue === "MANUAL_REVIEW_QUEUE");
      default:
        return [];
    }
  }, [activeQueue, alerts, alertsQ.p1.data]);
  reactExports.useEffect(() => {
    if (!selectedId && queueItems.length) {
      setSelectedId(queueItems[0].id);
    }
  }, [queueItems, selectedId]);
  const selected = reactExports.useMemo(() => alerts.find((alert) => alert.id === selectedId) ?? null, [alerts, selectedId]);
  const linkedAlerts = reactExports.useMemo(() => {
    if (!selected) return [];
    return alerts.filter((alert) => alert.userId === selected.userId && alert.id !== selected.id).slice(0, 8);
  }, [alerts, selected]);
  const p1Count = alertsQ.p1.data?.length ?? 0;
  const escalatedCount = alerts.filter((alert) => alert.status === "ESCALATED" || alert.queue === "ESCALATED").length;
  const eddCount = alertQueue?.EDD_QUEUE?.size ?? 0;
  const manualCount = alertQueue?.MANUAL_REVIEW_QUEUE?.size ?? 0;
  const closedCount = casesQ.data?.filter((item) => item.status === "CLOSED").length ?? 0;
  const sarCount = casesQ.data?.filter((item) => item.status === "SAR_FILED").length ?? 0;
  const refreshAll = () => {
    queryClient.invalidateQueries({
      queryKey: ["alerts"]
    });
    queryClient.invalidateQueries({
      queryKey: ["cases"]
    });
  };
  const handleFreeze = async () => {
    if (!selected?.userId) {
      toast.error("Select an alert with a user before freezing");
      return;
    }
    try {
      await officerActions.freeze({
        user_id: selected.userId,
        case_id: selected.caseId ?? void 0,
        officer_id: "OFFICER_1"
      });
      toast.success(`Freeze requested for ${selected.userId}`);
      refreshAll();
    } catch {
      toast.error("Freeze action failed");
    }
  };
  const handleEscalate = async () => {
    if (!selected?.caseId) {
      toast.error("Escalate requires a linked case");
      return;
    }
    try {
      await officerActions.escalate({
        case_id: selected.caseId,
        officer_id: "OFFICER_1"
      });
      toast.success(`Escalation sent for ${selected.caseId}`);
      refreshAll();
    } catch {
      toast.error("Escalation failed");
    }
  };
  const handleSar = async () => {
    if (!selected?.caseId) {
      toast.error("SAR generation requires a linked case");
      return;
    }
    try {
      await officerActions.sar({
        case_id: selected.caseId,
        notes: "Officer review SAR request"
      });
      toast.success(`SAR requested for ${selected.caseId}`);
      refreshAll();
    } catch {
      toast.error("SAR action failed");
    }
  };
  const handleAssign = async () => {
    if (!selected?.caseId) {
      toast.error("Assign requires a linked case");
      return;
    }
    try {
      await assignCase.mutateAsync({
        id: selected.caseId,
        officerId: "OFFICER_1"
      });
      toast.success(`Assigned case ${selected.caseId}`);
      refreshAll();
    } catch {
      toast.error("Case assignment failed");
    }
  };
  const handleWhitelist = async () => {
    if (!selected?.userId) {
      toast.error("Whitelist requires a user id");
      return;
    }
    try {
      await officerActions.whitelist({
        user_id: selected.userId,
        reason: "FALSE_POSITIVE",
        officer_id: "OFFICER_1"
      });
      toast.success(`Marked ${selected.userId} as false positive`);
      refreshAll();
    } catch {
      toast.error("Whitelist action failed");
    }
  };
  const handleCloseAlert = async () => {
    if (!selected?.id) {
      toast.error("Select an alert to close");
      return;
    }
    try {
      await closeAlert(selected.id);
      toast.success(`Alert ${selected.id} closed`);
      refreshAll();
    } catch {
      toast.error("Close failed");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-3 h-full flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-semibold tracking-tight", children: "Officer Review Workbench" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Investigation desk · officer ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mono text-foreground", children: "OFFICER_1" }),
          " · shift 09:00–17:00 UTC"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[11px] mono", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pill, { label: "Open", value: alerts.length }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pill, { label: "Closed today", value: closedCount, tone: "success" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pill, { label: "SAR drafted", value: sarCount, tone: "primary" })
      ] })
    ] }),
    (alertsQ.isError || casesQ.isError) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-danger/40 bg-danger/5 px-3 py-2 text-xs text-danger", children: "Backend unavailable. Officer review data could not be fully loaded." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-12 gap-3 flex-1 min-h-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-3 flex flex-col gap-3 min-h-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Officer Queues", dense: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col", children: QUEUE_OPTIONS.map((queueOption) => {
          const count = queueOption.id === "P1_QUEUE" ? p1Count : queueOption.id === "ESCALATED" ? escalatedCount : queueOption.id === "EDD" ? eddCount : manualCount;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActiveQueue(queueOption.id), className: `text-left px-3 py-2.5 border-l-2 flex items-center justify-between ${activeQueue === queueOption.id ? "bg-accent/40 border-primary" : "border-transparent hover:bg-accent/20"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium", children: queueOption.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground mono", children: queueOption.id })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `mono text-[11px] px-1.5 py-0.5 rounded border ${queueOption.tone === "critical" ? "border-critical/40 text-critical bg-critical/10" : queueOption.tone === "warning" ? "border-warning/40 text-warning bg-warning/10" : queueOption.tone === "info" ? "border-info/40 text-info bg-info/10" : "border-border text-muted-foreground bg-card/60"}`, children: count })
          ] }, queueOption.id);
        }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: `Queue · ${activeQueue.replace("_", " ")}`, className: "flex-1 min-h-0", dense: true, children: alertsQ.isLoading && !queueItems.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full flex items-center justify-center text-xs text-muted-foreground", children: "Loading queue…" }) : !queueItems.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full flex items-center justify-center text-xs text-muted-foreground", children: "No queue items available from backend" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "overflow-y-auto scrollbar-thin h-full divide-y divide-border/50", children: queueItems.slice(0, 30).map((alert) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { onClick: () => setSelectedId(alert.id), className: `p-2.5 cursor-pointer hover:bg-accent/30 ${selected?.id === alert.id ? "bg-accent/40" : ""}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PriorityBadge, { p: alert.priority }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mono text-[11px]", children: alert.alertId ?? alert.id }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SLATimer, { dueAt: alert.slaDueAt })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs", children: alert.type }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground mono", children: [
            alert.userId,
            " · ",
            alert.assignedOfficer ?? "unassigned"
          ] })
        ] }, alert.id)) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-6 flex flex-col gap-3 min-h-0", children: selected ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel, { title: "Investigation Card", subtitle: `${selected.alertId ?? selected.id} · ${selected.type}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Account / User", value: selected.userId }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Assigned officer", value: selected.assignedOfficer ?? "Unassigned" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Decision", value: /* @__PURE__ */ jsxRuntimeExports.jsx(DecisionBadge, { d: selected.priority === "P1" ? "BLOCK" : "REVIEW" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "SLA", value: /* @__PURE__ */ jsxRuntimeExports.jsx(SLATimer, { dueAt: selected.slaDueAt }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Final risk score", value: /* @__PURE__ */ jsxRuntimeExports.jsx(RiskScoreBadge, { score: selected.finalScore ?? selected.riskScore }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Alert status", value: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: selected.status ?? "OPEN" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Behavioral score", value: formatScore(selected.behaviorScore) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Sequence score", value: formatScore(selected.sequenceScore) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Graph score", value: formatScore(selected.graphScore) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Case", value: selected.caseId ?? "No case linked" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-[0.18em] text-muted-foreground", children: "Summary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm", children: selected.summary ?? selected.type })
          ] }),
          selected.reasons?.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-[0.18em] text-muted-foreground", children: "Reasons / signals" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex flex-wrap gap-2", children: selected.reasons.map((reason) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] mono px-2 py-1 rounded bg-card/60 border border-border", children: reason }, reason)) })
          ] }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 flex-1 min-h-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Evidence Timeline", dense: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-y-auto scrollbar-thin h-full pr-2 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "relative border-l border-border pl-4 space-y-3", children: [
            (selected.evidence ?? selected.signals ?? []).length ? (selected.evidence ?? selected.signals ?? []).map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -left-[9px] top-1 h-2 w-2 rounded-full bg-primary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mono text-[10px] text-muted-foreground", children: [
                "Step ",
                index + 1
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: item })
            ] }, `${String(item)}-${index}`)) : /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-muted-foreground", children: "No published evidence details available for this alert." }),
            selected.caseId ? /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "text-[10px] text-muted-foreground mt-2", children: [
              "Linked case ID: ",
              selected.caseId
            ] }) : null
          ] }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Explainability", dense: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 overflow-y-auto scrollbar-thin h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExplainabilityPanel, { finalScore: selected.finalScore ?? selected.riskScore, decision: selected.priority === "P1" ? "BLOCK" : "REVIEW" }) }) })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground text-center pt-12", children: "Select an alert from the queue" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-3 flex flex-col gap-3 min-h-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Operational Actions", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ActionBtn, { icon: Snowflake, label: "Freeze Account", tone: "critical", disabled: !selected?.userId || officerActions.freeze.isLoading, onClick: handleFreeze }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ActionBtn, { icon: ArrowUpRight, label: "Escalate to MLRO", tone: "warning", disabled: !selected?.caseId || officerActions.escalate.isLoading, onClick: handleEscalate }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ActionBtn, { icon: FilePenLine, label: "Generate SAR", tone: "primary", disabled: !selected?.caseId || officerActions.sar.isLoading, onClick: handleSar }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ActionBtn, { icon: UserPlus, label: "Assign Case", tone: "default", disabled: !selected?.caseId || assignCase.isLoading, onClick: handleAssign }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ActionBtn, { icon: ThumbsDown, label: "Mark False Positive", tone: "default", disabled: !selected?.userId || officerActions.whitelist.isLoading, onClick: handleWhitelist }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ActionBtn, { icon: CircleCheck, label: "Close Alert", tone: "success", disabled: !selected?.id, onClick: handleCloseAlert })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Linked Alerts", className: "flex-1 min-h-0", dense: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "overflow-y-auto scrollbar-thin h-full divide-y divide-border/50", children: linkedAlerts.length ? linkedAlerts.map((alert) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "p-2 text-xs flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PriorityBadge, { p: alert.priority }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mono text-[10px]", children: alert.alertId ?? alert.id }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground truncate", children: alert.type })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(RiskScoreBadge, { score: alert.riskScore })
        ] }, alert.id)) : /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "p-3 text-xs text-muted-foreground", children: "No linked alerts were found for the selected account." }) }) })
      ] })
    ] })
  ] });
}
function formatScore(value) {
  return value != null ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mono text-xs", children: value.toFixed(1) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mono text-xs text-muted-foreground", children: "N/A" });
}
function Pill({
  label,
  value,
  tone = "default"
}) {
  const c = tone === "success" ? "border-success/40 text-success bg-success/5" : tone === "primary" ? "border-primary/40 text-primary bg-primary/5" : "border-border";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `px-2 py-1 rounded border ${c}`, children: [
    label,
    " ",
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mono ml-1", children: value })
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
function ActionBtn({
  icon: Icon,
  label,
  tone,
  onClick,
  disabled
}) {
  const t = tone === "critical" ? "border-critical/40 text-critical hover:bg-critical/10" : tone === "warning" ? "border-warning/40 text-warning hover:bg-warning/10" : tone === "primary" ? "border-primary/40 text-primary hover:bg-primary/10" : tone === "success" ? "border-success/40 text-success hover:bg-success/10" : "border-border hover:bg-accent";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { disabled, onClick, className: `w-full h-9 px-3 rounded-md border flex items-center gap-2 text-xs font-medium ${t} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5" }),
    " ",
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label })
  ] });
}
export {
  OfficerReview as component
};
