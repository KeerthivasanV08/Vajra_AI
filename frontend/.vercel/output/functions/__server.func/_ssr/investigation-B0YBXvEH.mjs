import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { P as Panel } from "./Panel-CZ70JnZT.mjs";
import { a as useAccountList, u as useAccount } from "./useAccounts-C9su_RZA.mjs";
import { u as useRecentTransactions } from "./useTransactions-oWs_n7gU.mjs";
import { u as useAlerts } from "./useAlerts-OAbqpngd.mjs";
import { a as useCases } from "./useCases-C6WVsqI0.mjs";
import { u as useAccountGraph } from "./useGraph-CZT1edxt.mjs";
import "../_libs/sonner.mjs";
import { l as CircleCheck, n as CircleX, c as ArrowLeftRight } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tanstack__query-core.mjs";
import "./router-DXMls9-H.mjs";
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
function InvestigationPage() {
  const [queryA, setQueryA] = reactExports.useState("");
  const [queryB, setQueryB] = reactExports.useState("");
  const [selectedAId, setSelectedAId] = reactExports.useState(null);
  const [selectedBId, setSelectedBId] = reactExports.useState(null);
  const accountsA = useAccountList({
    limit: 25,
    search: queryA || void 0
  });
  const accountsB = useAccountList({
    limit: 25,
    search: queryB || void 0
  });
  const accountA = useAccount(selectedAId ?? void 0);
  const accountB = useAccount(selectedBId ?? void 0);
  const alertsQ = useAlerts();
  const casesQ = useCases();
  const txnsQ = useRecentTransactions();
  const graphA = useAccountGraph(selectedAId ?? void 0);
  const graphB = useAccountGraph(selectedBId ?? void 0);
  const a = accountA.data;
  const b = accountB.data;
  const alerts = alertsQ.data ?? [];
  const cases = casesQ.data ?? [];
  const txns = txnsQ.data ?? [];
  const alertsA = reactExports.useMemo(() => a ? alerts.filter((alert) => alert.userId === a.id || alert.userId === a.id) : [], [a, alerts]);
  const alertsB = reactExports.useMemo(() => b ? alerts.filter((alert) => alert.userId === b.id || alert.userId === b.id) : [], [b, alerts]);
  const alertTypesA = reactExports.useMemo(() => new Set(alertsA.map((alert) => alert.type)), [alertsA]);
  const alertTypesB = reactExports.useMemo(() => new Set(alertsB.map((alert) => alert.type)), [alertsB]);
  const commonAlertTypes = reactExports.useMemo(() => [...alertTypesA].filter((type) => alertTypesB.has(type)), [alertTypesA, alertTypesB]);
  const caseIdsA = reactExports.useMemo(() => new Set(alertsA.flatMap((alert) => [alert.id, alert.alertId ?? ""]).filter(Boolean)), [alertsA]);
  const caseIdsB = reactExports.useMemo(() => new Set(alertsB.flatMap((alert) => [alert.id, alert.alertId ?? ""]).filter(Boolean)), [alertsB]);
  const casesA = reactExports.useMemo(() => cases.filter((cs) => cs.sourceAlerts?.some((id) => caseIdsA.has(id)) || (cs.sourceAlert ? caseIdsA.has(cs.sourceAlert) : false)), [cases, caseIdsA]);
  const casesB = reactExports.useMemo(() => cases.filter((cs) => cs.sourceAlerts?.some((id) => caseIdsB.has(id)) || (cs.sourceAlert ? caseIdsB.has(cs.sourceAlert) : false)), [cases, caseIdsB]);
  const commonCases = reactExports.useMemo(() => casesA.filter((caseItem) => casesB.some((other) => other.id === caseItem.id)), [casesA, casesB]);
  const txnsA = reactExports.useMemo(() => a ? txns.filter((txn) => txn.sender === a.id || txn.receiver === a.id) : [], [a, txns]);
  const txnsB = reactExports.useMemo(() => b ? txns.filter((txn) => txn.sender === b.id || txn.receiver === b.id) : [], [b, txns]);
  const counterpartiesA = reactExports.useMemo(() => new Set(txnsA.map((txn) => txn.sender === a?.id ? txn.receiver : txn.sender).filter(Boolean)), [txnsA, a?.id]);
  const counterpartiesB = reactExports.useMemo(() => new Set(txnsB.map((txn) => txn.sender === b?.id ? txn.receiver : txn.sender).filter(Boolean)), [txnsB, b?.id]);
  const sharedCounterparties = reactExports.useMemo(() => new Set([...counterpartiesA].filter((counterparty) => counterpartiesB.has(counterparty))), [counterpartiesA, counterpartiesB]);
  const commonReceivers = reactExports.useMemo(() => {
    if (!a || !b) return [];
    const aReceivers = new Set(txnsA.filter((txn) => txn.sender === a.id).map((txn) => txn.receiver));
    const bReceivers = new Set(txnsB.filter((txn) => txn.sender === b.id).map((txn) => txn.receiver));
    return [...aReceivers].filter((id) => bReceivers.has(id));
  }, [a, b, txnsA, txnsB]);
  const commonSenders = reactExports.useMemo(() => {
    if (!a || !b) return [];
    const aSenders = new Set(txnsA.filter((txn) => txn.receiver === a.id).map((txn) => txn.sender));
    const bSenders = new Set(txnsB.filter((txn) => txn.receiver === b.id).map((txn) => txn.sender));
    return [...aSenders].filter((id) => bSenders.has(id));
  }, [a, b, txnsA, txnsB]);
  const graphNodesA = reactExports.useMemo(() => new Set(graphA.data?.nodes?.map((node) => node.id) ?? []), [graphA.data?.nodes]);
  const graphNodesB = reactExports.useMemo(() => new Set(graphB.data?.nodes?.map((node) => node.id) ?? []), [graphB.data?.nodes]);
  const commonGraphNodes = reactExports.useMemo(() => [...graphNodesA].filter((id) => graphNodesB.has(id) && id !== selectedAId && id !== selectedBId), [graphNodesA, graphNodesB, selectedAId, selectedBId]);
  const sharedSignals = reactExports.useMemo(() => {
    if (!a || !b) return [];
    return [{
      label: "Device ID",
      valueA: a.device_id ?? "—",
      valueB: b.device_id ?? "—",
      match: !!a.device_id && !!b.device_id && a.device_id === b.device_id,
      impact: "High"
    }, {
      label: "IP Address",
      valueA: a.ip_address ?? "—",
      valueB: b.ip_address ?? "—",
      match: !!a.ip_address && !!b.ip_address && a.ip_address === b.ip_address,
      impact: "High"
    }, {
      label: "Shared counterparties",
      valueA: sharedCounterparties.size ? [...sharedCounterparties].join(", ") : "None",
      valueB: sharedCounterparties.size ? [...sharedCounterparties].join(", ") : "None",
      match: sharedCounterparties.size > 0,
      impact: "High"
    }, {
      label: "Common alert types",
      valueA: alertTypesA.size ? [...alertTypesA].join(", ") : "None",
      valueB: alertTypesB.size ? [...alertTypesB].join(", ") : "None",
      match: commonAlertTypes.length > 0,
      impact: "Medium"
    }, {
      label: "Common cases",
      valueA: casesA.map((cs) => cs.title).join(", ") || "None",
      valueB: casesB.map((cs) => cs.title).join(", ") || "None",
      match: commonCases.length > 0,
      impact: "Medium"
    }, {
      label: "Common graph nodes",
      valueA: commonGraphNodes.length ? `${commonGraphNodes.length} nodes` : "None",
      valueB: commonGraphNodes.length ? `${commonGraphNodes.length} nodes` : "None",
      match: commonGraphNodes.length > 0,
      impact: "Medium"
    }, {
      label: "Common receivers",
      valueA: commonReceivers.length ? commonReceivers.join(", ") : "None",
      valueB: commonReceivers.length ? commonReceivers.join(", ") : "None",
      match: commonReceivers.length > 0,
      impact: "Low"
    }, {
      label: "Common senders",
      valueA: commonSenders.length ? commonSenders.join(", ") : "None",
      valueB: commonSenders.length ? commonSenders.join(", ") : "None",
      match: commonSenders.length > 0,
      impact: "Low"
    }];
  }, [a, b, sharedCounterparties, alertTypesA, alertTypesB, commonAlertTypes, casesA, casesB, commonCases, commonGraphNodes, commonReceivers, commonSenders]);
  const similarityScore = reactExports.useMemo(() => {
    if (!a || !b) return void 0;
    const weights = [sharedSignals[0].match ? 3 : 0, sharedSignals[1].match ? 3 : 0, sharedSignals[2].match ? 3 : 0, sharedSignals[3].match ? 2 : 0, sharedSignals[4].match ? 2 : 0, sharedSignals[5].match ? 2 : 0, sharedSignals[6].match ? 1 : 0, sharedSignals[7].match ? 1 : 0];
    const totalWeight = 17;
    const score = weights.reduce((sum, weight) => sum + weight, 0) / totalWeight;
    return Number(score.toFixed(2));
  }, [a, b, sharedSignals]);
  const recentSharedTransactions = reactExports.useMemo(() => {
    if (!a || !b) return [];
    return txns.filter((txn) => sharedCounterparties.has(txn.sender === a.id ? txn.receiver : txn.sender) || sharedCounterparties.has(txn.sender === b.id ? txn.receiver : txn.sender)).slice(0, 5);
  }, [a, b, sharedCounterparties, txns]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-semibold tracking-tight", children: "Investigation Sandbox" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Compare entities · graph overlap · shared-signal forensics" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[11px] mono", children: [
        similarityScore != null ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 py-1 rounded border border-warning/40 text-warning bg-warning/5", children: [
          "SIMILARITY ",
          similarityScore
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-1 rounded border border-border text-muted-foreground bg-card/50", children: "Select two accounts" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-2 py-1 rounded border ${similarityScore && similarityScore >= 0.5 ? "border-critical/40 text-critical bg-critical/5" : "border-border text-muted-foreground bg-card/50"}`, children: similarityScore != null ? similarityScore >= 0.5 ? "LINKED EVIDENCE" : "LOW LINK EVIDENCE" : "Awaiting selection" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Entity A", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LabelledSearch, { label: "Search Entity A", value: queryA, onChange: setQueryA, options: accountsA.data?.results ?? [], selectedId: selectedAId, onSelectId: setSelectedAId }),
        a ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center text-base font-bold text-primary-foreground", children: a.name?.split(" ").map((n) => n[0]).join("") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: a.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] mono text-muted-foreground", children: [
                a.country,
                " · opened ",
                new Date(a.openedAt ?? Date.now()).toLocaleDateString()
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 text-[11px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { label: "Device", v: a.device_id ?? "—", mono: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { label: "IP", v: a.ip_address ?? "—", mono: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { label: "Graph", v: a.graphProximity ?? 0 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { label: "SIM", v: a.simRisk ?? 0 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { label: "Alerts", v: alertsA.length }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { label: "Cases", v: casesA.length })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-border bg-card/40 p-3 text-xs text-muted-foreground", children: "Select Entity A from backend account search to load details." })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Entity B", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LabelledSearch, { label: "Search Entity B", value: queryB, onChange: setQueryB, options: accountsB.data?.results ?? [], selectedId: selectedBId, onSelectId: setSelectedBId }),
        b ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center text-base font-bold text-primary-foreground", children: b.name?.split(" ").map((n) => n[0]).join("") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: b.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] mono text-muted-foreground", children: [
                b.country,
                " · opened ",
                new Date(b.openedAt ?? Date.now()).toLocaleDateString()
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 text-[11px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { label: "Device", v: b.device_id ?? "—", mono: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { label: "IP", v: b.ip_address ?? "—", mono: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { label: "Graph", v: b.graphProximity ?? 0 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { label: "SIM", v: b.simRisk ?? 0 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { label: "Alerts", v: alertsB.length }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { label: "Cases", v: casesB.length })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-border bg-card/40 p-3 text-xs text-muted-foreground", children: "Select Entity B from backend account search to load details." })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Shared Signal Matching", children: a && b ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-2", children: sharedSignals.map((signal) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-md border p-3 ${signal.match ? "border-critical/30 bg-critical/5" : "border-border bg-card/40"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium", children: signal.label }),
        signal.match ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-critical" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4 text-muted-foreground" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-[10px] text-muted-foreground", children: "Entity A" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold break-words", children: signal.valueA }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-[10px] text-muted-foreground", children: "Entity B" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold break-words", children: signal.valueB }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground", children: "Risk impact" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px]", children: signal.impact })
    ] }, signal.label)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-border bg-card/40 p-3 text-xs text-muted-foreground", children: "Select two accounts to compare" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Graph Overlap", subtitle: "Common neighbors at depth ≤ 2", children: a && b ? commonGraphNodes.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: "Shared infrastructure nodes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-2 text-xs", children: commonGraphNodes.slice(0, 6).map((nodeId) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-border bg-card/40 p-2 break-words", children: nodeId }, nodeId)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: "Graph proximity derived from shared node overlap." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-border bg-card/40 p-3 text-xs text-muted-foreground", children: "No shared signals found in graph overlap" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-border bg-card/40 p-3 text-xs text-muted-foreground", children: "Select two accounts to compare" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Transaction Overlap (recent)", dense: true, children: a && b ? sharedCounterparties.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-2 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-card/40 p-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-[0.18em] text-muted-foreground", children: "Overlapping counterparties" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 break-words", children: sharedCounterparties.join(", ") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-card/40 p-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-[0.18em] text-muted-foreground", children: "Common senders" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 break-words", children: commonSenders.length ? commonSenders.join(", ") : "None" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-card/40 p-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-[0.18em] text-muted-foreground", children: "Common receivers" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 break-words", children: commonReceivers.length ? commonReceivers.join(", ") : "None" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: "Recent transaction patterns involving shared counterparties." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-border/50 text-xs", children: recentSharedTransactions.map((txn) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "px-3 py-2 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeftRight, { className: "h-3 w-3 text-warning" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mono", children: [
              txn.sender,
              " → ",
              txn.receiver
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mono", children: [
            txn.currency,
            " ",
            txn.amount.toLocaleString()
          ] })
        ] }, txn.id)) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-border bg-card/40 p-3 text-xs text-muted-foreground", children: "No overlapping transactions available from backend" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-border bg-card/40 p-3 text-xs text-muted-foreground", children: "Select two accounts to compare" }) })
    ] })
  ] });
}
function LabelledSearch({
  label,
  value,
  onChange,
  options,
  selectedId,
  onSelectId
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-[0.18em] text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value, onChange: (event) => onChange(event.target.value), placeholder: "Search accounts by id or name", className: "w-full rounded-md border border-border bg-input/60 px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: selectedId ?? "", onChange: (event) => onSelectId(event.target.value || null), className: "w-full rounded-md border border-border bg-card/60 px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select account" }),
      options.map((account) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: account.id, children: [
        account.id,
        " ",
        account.name ? `· ${account.name}` : ""
      ] }, account.id))
    ] })
  ] });
}
function Cell({
  label,
  v,
  mono
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-card/40 p-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mt-0.5 text-xs ${mono ? "mono" : ""}`, children: v })
  ] });
}
export {
  InvestigationPage as component
};
