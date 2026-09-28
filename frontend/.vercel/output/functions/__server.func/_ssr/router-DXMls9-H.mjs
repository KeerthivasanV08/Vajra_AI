import { Q as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider, a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { b as createRouter, a as createRootRouteWithContext, d as useRouter, L as Link, O as Outlet, H as HeadContent, S as Scripts, c as createFileRoute, l as lazyRouteComponent, e as useRouterState, u as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { T as Toaster, t as toast } from "../_libs/sonner.mjs";
import { _ as ShieldAlert, S as Radar, M as Map$1, A as Activity, a5 as TriangleAlert, w as GitBranch, J as Network, h as Briefcase, aa as Users, i as Building2, L as Layers, r as Cpu, a8 as UserCog, a1 as Smartphone, G as Gavel, F as FileCheck, X as Scale, u as FileText, ae as Zap, Z as Settings, Y as Search, ab as Wifi, ac as WifiOff, a6 as User, $ as ShieldCheck, o as Clock, a7 as UserCheck } from "../_libs/lucide-react.mjs";
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
const appCss = "/assets/styles-D_safEmr.css";
let state = {
  connected: false,
  connectionStatus: "disconnected",
  paused: false,
  transactions: [],
  liveTransactions: [],
  alerts: [],
  liveAlerts: [],
  liveCases: [],
  liveGraphEvents: [],
  selectedAlert: null,
  selectedCase: null,
  dashboardMetrics: null,
  queueState: null,
  slaState: {},
  ticker: [],
  metrics: {}
};
const listeners = /* @__PURE__ */ new Set();
const notify = () => listeners.forEach((l) => l());
const store = {
  get: () => state,
  set: (next) => {
    state = { ...state, ...next };
    notify();
  },
  subscribe: (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  togglePause: () => store.set({ paused: !state.paused }),
  pauseLiveView: () => store.set({ paused: true }),
  resumeLiveView: () => store.set({ paused: false }),
  setConnected: (c) => store.set({ connected: c, connectionStatus: c ? "connected" : "disconnected" }),
  setConnectionStatus: (connectionStatus) => store.set({ connectionStatus, connected: connectionStatus === "connected" }),
  pushTransaction: (t) => {
    store.addTransactionFromSSE(t);
    const amount = Number(t.amount) || 0;
    const formattedAmount = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount);
    store.addTickerLine({
      ts: Date.now(),
      level: t.riskScore >= 80 ? "critical" : "warning",
      text: `Txn ${t.id.slice(0, 8)} · ${t.sender.slice(-6)} → ${t.receiver.slice(-6)} · ${formattedAmount} · risk ${Math.round(t.riskScore)}%`
    });
  },
  pushAlert: (a) => {
    store.addAlertFromSSE(a);
    store.addTickerLine({
      ts: Date.now(),
      level: a.priority === "P1" ? "critical" : a.priority === "P2" ? "warning" : "success",
      text: `${a.priority} · ${a.type} · ${a.summary ?? "Alert triggered"} · risk ${Math.round(a.riskScore)}%`
    });
  },
  setTicker: (lines) => {
    state = { ...state, ticker: lines.slice(0, 200) };
    notify();
  },
  addTickerLine: (line) => {
    state = { ...state, ticker: [line, ...state.ticker].slice(0, 200) };
    notify();
  },
  updateMetrics: (m) => {
    state = { ...state, metrics: { ...state.metrics, ...m } };
    notify();
  },
  updateDashboardMetrics: (m) => {
    state = {
      ...state,
      dashboardMetrics: m,
      metrics: {
        ...state.metrics,
        totalTxn: m.total_transactions,
        blocked: m.blocked_transactions,
        reviewQueue: m.review_queue,
        p1: m.high_risk_count,
        activeCases: m.cases,
        networkRisk: m.escalations
      }
    };
    notify();
  },
  updateQueueFromAPI: (queueState) => {
    state = { ...state, queueState };
    notify();
  },
  addTransactionFromSSE: (t) => {
    state = {
      ...state,
      transactions: [t, ...state.transactions.filter((x) => x.id !== t.id)].slice(0, 500),
      liveTransactions: [t, ...state.liveTransactions.filter((x) => x.id !== t.id)].slice(0, 500)
    };
    notify();
  },
  addAlertFromSSE: (a) => {
    state = {
      ...state,
      alerts: [a, ...state.alerts.filter((x) => x.id !== a.id)].slice(0, 500),
      liveAlerts: [a, ...state.liveAlerts.filter((x) => x.id !== a.id)].slice(0, 500)
    };
    notify();
  },
  setSelectedAlert: (selectedAlert) => store.set({ selectedAlert }),
  setSelectedCase: (selectedCase) => store.set({ selectedCase }),
  clear: () => {
    state = { connected: false, connectionStatus: "disconnected", paused: false, transactions: [], liveTransactions: [], alerts: [], liveAlerts: [], liveCases: [], liveGraphEvents: [], selectedAlert: null, selectedCase: null, dashboardMetrics: null, queueState: null, slaState: {}, ticker: [], metrics: {} };
    notify();
  }
};
function useStore(selector) {
  const [val, setVal] = reactExports.useState(() => selector(state));
  reactExports.useEffect(() => {
    const unsub = store.subscribe(() => setVal(selector(state)));
    return () => {
      unsub();
    };
  }, []);
  return val;
}
function mergeHistoricalTransactions(hist) {
  const map = /* @__PURE__ */ new Map();
  hist.forEach((t) => map.set(t.id, t));
  state.transactions.forEach((t) => map.set(t.id, t));
  state.liveTransactions.forEach((t) => map.set(t.id, t));
  const merged = Array.from(map.values()).sort((a, b) => b.ts - a.ts).slice(0, 500);
  store.set({ transactions: merged, liveTransactions: merged });
}
function mergeHistoricalAlerts(hist) {
  const map = /* @__PURE__ */ new Map();
  hist.forEach((a) => map.set(a.id, a));
  state.alerts.forEach((a) => map.set(a.id, a));
  state.liveAlerts.forEach((a) => map.set(a.id, a));
  const merged = Array.from(map.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 500);
  store.set({ alerts: merged, liveAlerts: merged });
}
const NAV_SECTIONS = [
  {
    title: "COMMAND",
    items: [
      { to: "/", label: "Dashboard", icon: Radar, exact: true },
      { to: "/heatmap", label: "Operations Map", icon: Map$1 }
    ]
  },
  {
    title: "MONITORING",
    items: [
      { to: "/transaction-flow", label: "Transaction Monitor", icon: Activity },
      { to: "/alerts", label: "Alert Center", icon: TriangleAlert, badge: "p1" }
    ]
  },
  {
    title: "INVESTIGATION",
    items: [
      { to: "/mule-ring-investigator", label: "Mule Ring Investigator", icon: GitBranch },
      { to: "/graph", label: "Graph Explorer", icon: Network },
      { to: "/cases", label: "Cases", icon: Briefcase },
      { to: "/accounts", label: "Account 360", icon: Users }
    ]
  },
  {
    title: "PHYSICAL INTELLIGENCE",
    items: [
      { to: "/node-management", label: "Node Management", icon: Building2 },
      { to: "/corridors", label: "High-Risk Corridors", icon: Layers }
    ]
  },
  {
    title: "RESPONSE",
    items: [
      { to: "/sop-triage", label: "SOP Triage", icon: Cpu },
      { to: "/officer-review", label: "Officer Review", icon: UserCog },
      { to: "/field", label: "Beat Officer Mode", icon: Smartphone }
    ]
  },
  {
    title: "COMPLIANCE",
    items: [
      { to: "/legal-dossier-vault", label: "Legal Dossier Vault", icon: Gavel },
      { to: "/audit-compliance-ledger", label: "Audit Ledger", icon: FileCheck },
      { to: "/fairness-audit", label: "Fairness Audit", icon: Scale }
    ]
  },
  {
    title: "ANALYTICS & SYSTEM",
    items: [
      { to: "/reports", label: "Reports", icon: FileText },
      { to: "/model-performance", label: "Model Performance", icon: Cpu },
      { to: "/simulation", label: "Live Simulation", icon: Zap },
      { to: "/settings", label: "Settings", icon: Settings }
    ]
  }
];
function Sidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const p1 = useStore((s) => s.metrics.p1);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "aside",
    {
      "aria-label": "Sidebar Navigation",
      className: "w-16 md:w-72 shrink-0 border-r border-slate-800 bg-slate-950 text-slate-200 flex flex-col h-screen select-none shadow-xl",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-14 px-4 flex items-center gap-3 border-b border-slate-800 bg-slate-900/60 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-6 w-6 text-rose-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400 animate-ping" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "leading-tight max-md:hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-bold tracking-wider font-mono text-white flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "VAJRA" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "vajra-status rounded bg-rose-950 px-1.5 py-0.5 text-rose-300 border border-rose-800 font-sans", children: "AI" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "vajra-micro uppercase tracking-[0.12em] text-slate-300 font-mono", children: "Predictive Interception" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "nav",
          {
            "aria-label": "Main Operations Navigation",
            className: "flex-1 overflow-y-auto py-3.5 px-3 space-y-4 scrollbar-thin",
            children: NAV_SECTIONS.map((section, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 pt-2 pb-1 vajra-label uppercase tracking-[0.1em] font-mono text-slate-300 max-md:hidden", children: section.title }),
              section.items.map((item) => {
                const active = item.exact ? path === item.to : path === item.to || path.startsWith(item.to + "/");
                const Icon = item.icon;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Link,
                  {
                    to: item.to,
                    "aria-current": active ? "page" : void 0,
                    className: `group relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] min-h-[38px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500 ${active ? "bg-slate-800/90 text-white font-semibold shadow-sm border border-slate-700/80" : "text-slate-200 font-medium hover:bg-slate-900/80 hover:text-white max-md:justify-center"}`,
                    children: [
                      active && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-0 top-2 bottom-2 w-1 bg-rose-500 rounded-r shadow-[0_0_8px_rgba(244,63,94,0.6)]" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Icon,
                        {
                          className: `h-[18px] w-[18px] shrink-0 transition-colors ${active ? "text-rose-400" : "text-slate-400 group-hover:text-slate-200"}`
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 truncate tracking-normal max-md:hidden", children: item.label }),
                      item.badge === "p1" && p1 > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "vajra-status font-mono px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 shadow-sm", children: p1 })
                    ]
                  },
                  item.to
                );
              })
            ] }, idx))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-slate-800 px-2 md:px-4 py-3 vajra-body-small font-mono text-slate-300 bg-slate-900/40 flex items-center justify-between shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-slate-300 max-md:hidden", children: "VAJRA v2.4-PROD" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-emerald-400 font-semibold flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-400 animate-pulse" }),
            "ACTIVE"
          ] })
        ] })
      ]
    }
  );
}
function Header() {
  const connected = useStore((s) => s.connected);
  const connectionStatus = useStore((s) => s.connectionStatus);
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const navigate = useNavigate();
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const query = searchQuery.trim().toUpperCase();
    if (query.startsWith("CASE-") || query.startsWith("CASE_")) {
      navigate({ to: "/mule-ring-investigator", search: { caseId: query, accountId: void 0, alertId: void 0 } });
      toast.info(`Opening case investigation ${query}`);
    } else if (query.startsWith("ALERT-") || query.startsWith("ALERT_")) {
      navigate({ to: "/mule-ring-investigator", search: { alertId: query, accountId: void 0, caseId: void 0 } });
      toast.info(`Opening alert investigation ${query}`);
    } else if (query.startsWith("ACC") || /^U\d+$/.test(query) || /^M-\d+$/.test(query)) {
      navigate({ to: "/mule-ring-investigator", search: { accountId: query, caseId: void 0, alertId: void 0 } });
      toast.info(`Opening account investigation ${query}`);
    } else if (query.startsWith("CASE")) {
      navigate({ to: "/cases" });
      toast.info(`Searching case ${query}`);
    } else if (query.startsWith("NODE")) {
      navigate({ to: "/node-management" });
      toast.info(`Searching node ${query}`);
    } else {
      navigate({ to: "/alerts" });
      toast.info(`Global search for "${query}"`);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "h-14 border-b border-slate-800 bg-slate-950 px-4 flex items-center justify-between gap-4 shrink-0 select-none text-slate-200", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSearch, className: "flex-1 max-w-md relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          value: searchQuery,
          onChange: (e) => setSearchQuery(e.target.value),
          placeholder: "Search Account, Case ID, Node ID, Alert, or SHA-256 Hash...",
          className: "w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-slate-700 font-sans"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: `flex items-center gap-1.5 px-2.5 py-1.5 rounded-full vajra-status font-mono border ${connected ? "bg-emerald-950/70 text-emerald-400 border-emerald-800/80" : "bg-rose-950/80 text-rose-300 border-rose-800/80 animate-pulse"}`,
          children: connected ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Wifi, { className: "w-3.5 h-3.5 text-emerald-400 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "LIVE FEED CONNECTED" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(WifiOff, { className: "w-3.5 h-3.5 text-rose-400 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "LIVE FEED DISCONNECTED (",
              connectionStatus,
              ")"
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/field",
          className: "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-sm font-mono text-slate-200 hover:text-white hover:border-slate-700 transition-colors",
          title: "Switch to Mobile Beat Officer Field Mode",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "w-3.5 h-3.5 text-rose-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "FIELD MODE" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pl-2 border-l border-slate-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-7 h-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-rose-400", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-4 h-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:block leading-tight text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold text-slate-200 font-sans", children: "Officer Keerthivasan" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "vajra-micro font-mono text-slate-300 flex items-center justify-end gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-3 h-3 text-emerald-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "LEA_OFFICER_001" })
          ] })
        ] })
      ] })
    ] })
  ] });
}
const iconFor = (lvl) => {
  if (lvl === "critical") return TriangleAlert;
  if (lvl === "warning") return Clock;
  if (lvl === "success") return UserCheck;
  return Zap;
};
const toneFor = (lvl) => {
  if (lvl === "critical") return "text-critical border-critical/30 bg-critical/5";
  if (lvl === "warning") return "text-warning border-warning/30 bg-warning/5";
  if (lvl === "success") return "text-success border-success/30 bg-success/5";
  return "text-info border-info/30 bg-info/5";
};
function RealtimeThreatFeed({ compact = false }) {
  const ticker = useStore((s) => s.ticker);
  const connected = useStore((s) => s.connected);
  const connectionStatus = useStore((s) => s.connectionStatus);
  const hasEvents = ticker.length > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-panel rounded-lg overflow-hidden flex flex-col h-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-3 py-2 border-b border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Network, { className: "h-3.5 w-3.5 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] uppercase tracking-[0.18em] font-medium", children: "Live Threat Feed" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] mono text-muted-foreground flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-1.5 w-1.5 rounded-full ${connected ? "bg-success pulse-dot text-success" : "bg-critical text-critical"}` }),
        connected ? "STREAMING" : connectionStatus === "reconnecting" ? "RECONNECTING" : "DISCONNECTED"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex-1 overflow-y-auto scrollbar-thin divide-y divide-border/50`, children: hasEvents ? ticker.slice(0, compact ? 8 : 30).map((t, i) => {
      const Icon = iconFor(t.level);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `px-3 py-2 text-xs flex items-start gap-2 ${i === 0 ? "row-enter" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `mt-0.5 h-5 w-5 rounded shrink-0 flex items-center justify-center border ${toneFor(t.level)}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3 w-3" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate", children: t.text }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground mono mt-0.5", children: new Date(t.ts).toLocaleTimeString() })
        ] })
      ] }, t.ts + "-" + i);
    }) : connected ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-4 text-xs text-muted-foreground", children: "Waiting for realtime alert stream..." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-4 text-xs text-muted-foreground", children: "Realtime alert stream disconnected" }) })
  ] });
}
class TransactionStream {
  es;
  handlers = /* @__PURE__ */ new Set();
  url = "http://127.0.0.1:8000/api/transactions/realtime";
  reconnectMs = 1e3;
  shouldRun = false;
  onMessage(fn) {
    this.handlers.add(fn);
    return () => this.handlers.delete(fn);
  }
  start() {
    if (this.shouldRun) return;
    this.shouldRun = true;
    this.open();
  }
  stop() {
    this.shouldRun = false;
    this.cleanup();
  }
  open() {
    this.cleanup();
    try {
      this.es = new EventSource(this.url);
    } catch (e) {
      this.scheduleReconnect();
      return;
    }
    this.es.onopen = () => {
      store.setConnectionStatus("connected");
    };
    const handlePayload = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        this.handlers.forEach((h) => h(data));
      } catch (e) {
        console.error("malformed txn event", e);
      }
    };
    this.es.onmessage = handlePayload;
    this.es.addEventListener("transaction", handlePayload);
    this.es.onerror = () => {
      store.setConnectionStatus("reconnecting");
      this.cleanup();
      this.scheduleReconnect();
    };
  }
  scheduleReconnect() {
    if (!this.shouldRun) return;
    setTimeout(() => {
      this.reconnectMs = Math.min(3e4, Math.floor(this.reconnectMs * 1.5));
      this.open();
    }, this.reconnectMs);
  }
  cleanup() {
    if (this.es) {
      try {
        this.es.close();
      } catch {
      }
      this.es = void 0;
    }
  }
}
class AlertStream {
  es;
  handlers = /* @__PURE__ */ new Set();
  url = "http://127.0.0.1:8000/api/alerts/realtime";
  reconnectMs = 1e3;
  shouldRun = false;
  onMessage(fn) {
    this.handlers.add(fn);
    return () => this.handlers.delete(fn);
  }
  start() {
    if (this.shouldRun) return;
    this.shouldRun = true;
    this.open();
  }
  stop() {
    this.shouldRun = false;
    this.cleanup();
  }
  open() {
    this.cleanup();
    try {
      this.es = new EventSource(this.url);
    } catch (e) {
      this.scheduleReconnect();
      return;
    }
    this.es.onopen = () => {
      store.setConnectionStatus("connected");
    };
    const handlePayload = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        this.handlers.forEach((h) => h(data));
      } catch (e) {
        console.error("malformed alert event", e);
      }
    };
    this.es.onmessage = handlePayload;
    this.es.addEventListener("alert", handlePayload);
    this.es.addEventListener("escalation", handlePayload);
    this.es.addEventListener("queue_update", handlePayload);
    this.es.addEventListener("assignment", handlePayload);
    this.es.onerror = () => {
      store.setConnectionStatus("reconnecting");
      this.cleanup();
      this.scheduleReconnect();
    };
  }
  scheduleReconnect() {
    if (!this.shouldRun) return;
    setTimeout(() => {
      this.reconnectMs = Math.min(3e4, Math.floor(this.reconnectMs * 1.5));
      this.open();
    }, this.reconnectMs);
  }
  cleanup() {
    if (this.es) {
      try {
        this.es.close();
      } catch {
      }
      this.es = void 0;
    }
  }
}
const API_BASE = "http://127.0.0.1:8000";
class APIError extends Error {
  status;
  data;
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}
async function request({ method = "GET", path, body, signal, timeoutMs = 15e3, headers }) {
  const url = API_BASE.replace(/\/$/, "") + path;
  const controller = new AbortController();
  const mergedSignal = controller.signal;
  if (signal) {
    signal.addEventListener("abort", () => controller.abort());
  }
  const opts = { method, headers: { "content-type": "application/json", ...headers || {} }, credentials: "omit", signal: mergedSignal };
  if (body != null) opts.body = JSON.stringify(body);
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const r = await fetch(url, opts);
    if (!r.ok) {
      let data = null;
      try {
        data = await r.json();
      } catch (e) {
        data = await r.text().catch(() => null);
      }
      throw new APIError(r.statusText || "API Error", r.status, data);
    }
    const text = await r.text();
    if (!text) return null;
    try {
      const parsed = JSON.parse(text);
      if (false) ;
      return parsed;
    } catch {
      if (false) ;
      return text;
    }
  } catch (err) {
    if (controller.signal.aborted) throw new APIError("Request timed out");
    if (err?.name === "AbortError") throw new APIError("Request aborted");
    if (err?.message === "Failed to fetch" || String(err?.message || "").includes("fetch")) throw new APIError("Backend unavailable");
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
const client = { request, API_BASE, APIError };
function extractList(raw) {
  if (Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== "object") return [];
  const candidate = raw;
  for (const key of ["items", "data", "results", "payload"]) {
    const value = candidate[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}
function extractObject(raw) {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) return raw;
  return {};
}
function extractGraphPayload(raw) {
  if (!raw || typeof raw !== "object") return { nodes: [], edges: [] };
  const payload = raw;
  const nodes = Array.isArray(payload.nodes) ? payload.nodes : Array.isArray(payload.data?.nodes) ? payload.data?.nodes : Array.isArray(payload.items?.nodes) ? payload.items?.nodes : [];
  const edges = Array.isArray(payload.edges) ? payload.edges : Array.isArray(payload.data?.edges) ? payload.data?.edges : Array.isArray(payload.items?.edges) ? payload.items?.edges : [];
  return { nodes, edges };
}
function normalizeDate(value) {
  if (value == null || value === "") {
    return Date.now();
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  const asString = String(value).trim();
  if (!asString) {
    return Date.now();
  }
  const numeric = Number(asString);
  if (Number.isFinite(numeric)) {
    return numeric;
  }
  const parsed = Date.parse(asString);
  return Number.isNaN(parsed) ? Date.now() : parsed;
}
function normalizeAlert(raw) {
  const id = String(raw?.id ?? raw?.alert_id ?? raw?.alertId ?? "");
  const createdAt = normalizeDate(raw?.createdAt ?? raw?.created_at ?? raw?.timestamp);
  const slaDueAt = normalizeDate(raw?.slaDueAt ?? raw?.sla_due_at ?? raw?.due_at ?? raw?.deadline_at ?? createdAt + 2 * 60 * 6e4);
  return {
    id,
    alertId: raw?.alert_id ?? raw?.alertId ?? id,
    priority: String(raw?.priority ?? "P3").toUpperCase(),
    type: String(raw?.type ?? raw?.alert_type ?? "AML_ALERT"),
    userId: String(raw?.userId ?? raw?.user_id ?? raw?.sender_id ?? raw?.account_id ?? ""),
    userName: raw?.userName ?? raw?.user_name ?? raw?.account_name,
    riskScore: Number(raw?.riskScore ?? raw?.risk_score ?? raw?.final_score ?? 0),
    finalScore: Number(raw?.finalScore ?? raw?.final_score ?? raw?.riskScore ?? raw?.risk_score ?? 0),
    behaviorScore: raw?.behaviorScore ?? raw?.behavioral_score ?? raw?.behavioralScore ? Number(raw?.behaviorScore ?? raw?.behavioral_score ?? raw?.behavioralScore) : void 0,
    sequenceScore: raw?.sequenceScore ?? raw?.sequence_score ? Number(raw?.sequenceScore ?? raw?.sequence_score) : void 0,
    graphScore: raw?.graphScore ?? raw?.graph_score ? Number(raw?.graphScore ?? raw?.graph_score) : void 0,
    reasons: extractList(raw?.reasons ?? raw?.reason_list ?? raw?.reason ?? raw?.signals ?? []),
    evidence: extractList(raw?.evidence ?? raw?.evidence_items ?? raw?.evidence_list ?? []),
    queue: raw?.queue ?? raw?.queue_name ?? raw?.assigned_queue,
    assignedOfficer: raw?.assignedOfficer ?? raw?.assigned_officer_name ?? raw?.assigned_officer ?? null,
    assignedOfficerId: raw?.assigned_officer_id ?? raw?.assignedOfficerId ?? null,
    assignedOfficerName: raw?.assigned_officer_name ?? raw?.assignedOfficerName ?? raw?.assigned_officer ?? null,
    slaDueAt,
    remainingSeconds: raw?.remainingSeconds ?? raw?.remaining_seconds ?? void 0,
    slaBreached: raw?.slaBreached ?? raw?.sla_breached ?? void 0,
    createdAt,
    status: String(raw?.status ?? raw?.state ?? "OPEN").toUpperCase(),
    caseId: raw?.caseId ?? raw?.case_id ?? null,
    signals: extractList(raw?.signals ?? raw?.signal_list ?? raw?.signal ?? []),
    amount: raw?.amount != null ? Number(raw.amount) : void 0,
    channel: raw?.channel ? String(raw.channel) : void 0,
    summary: raw?.summary ?? raw?.reason ?? raw?.description
  };
}
function extractAlerts(raw) {
  return extractList(raw).map(normalizeAlert);
}
async function fetchAlerts() {
  const raw = await client.request({ path: "/api/alerts" });
  return extractAlerts(raw);
}
async function fetchP1Alerts() {
  const raw = await client.request({ path: "/api/alerts/p1" });
  return extractAlerts(raw);
}
async function fetchAlertsQueue() {
  return client.request({ path: "/api/alerts/queue" });
}
async function fetchAlertEscalations() {
  const raw = await client.request({ path: "/api/alerts/escalations" });
  return Array.isArray(raw) ? raw : [];
}
async function acknowledgeAlert(id) {
  await client.request({ method: "POST", path: `/api/alerts/${id}/acknowledge` });
}
async function escalateAlert(id) {
  await client.request({ method: "POST", path: `/api/alerts/${id}/escalate` });
}
async function closeAlert(id) {
  await client.request({ method: "POST", path: `/api/alerts/${id}/close` });
}
function normalizeTransaction(raw) {
  const id = String(raw?.id ?? raw?.trans_id ?? raw?.transaction_id ?? raw?.txn_id ?? "");
  let ts;
  let timestamp;
  if (raw?.timestamp) {
    if (typeof raw.timestamp === "string") {
      timestamp = raw.timestamp;
      const parsed = new Date(raw.timestamp).getTime();
      if (!Number.isNaN(parsed)) ts = parsed;
    } else {
      ts = Number(raw.timestamp);
    }
  } else if (raw?.ts || raw?.created_at || raw?.createdAt) {
    ts = Number(raw?.ts ?? raw?.created_at ?? raw?.createdAt ?? Date.now());
  }
  if (!ts && !Number.isNaN(new Date(timestamp).getTime())) {
    ts = new Date(String(timestamp)).getTime();
  }
  ts = ts || Date.now();
  const riskScore = Number(raw?.riskScore ?? raw?.final_score ?? raw?.finalScore ?? 0);
  const behavioralScore = Number(raw?.behavioral_score ?? raw?.behaviorScore ?? raw?.behavioralScore ?? 0);
  return {
    id,
    transactionId: raw?.transaction_id ?? raw?.trans_id ?? id,
    ts,
    timestamp,
    createdAt: ts,
    sender: String(raw?.sender ?? raw?.sender_id ?? raw?.from ?? ""),
    senderName: raw?.senderName ?? raw?.sender_name ?? raw?.fromName ?? "",
    receiver: String(raw?.receiver ?? raw?.receiver_id ?? raw?.to ?? ""),
    receiverName: raw?.receiverName ?? raw?.receiver_name ?? raw?.toName ?? "",
    amount: Number(raw?.amount ?? 0),
    currency: String(raw?.currency ?? raw?.ccy ?? "INR"),
    channel: raw?.channel ? String(raw.channel) : void 0,
    countryFrom: raw?.countryFrom ?? raw?.country_from,
    countryTo: raw?.countryTo ?? raw?.country_to,
    decision: String(raw?.decision ?? "ALLOW").toUpperCase(),
    riskScore,
    finalScore: Number(raw?.final_score ?? raw?.finalScore ?? riskScore),
    behaviorScore: behavioralScore,
    behavioralScore,
    sequenceScore: Number(raw?.sequence_score ?? raw?.sequenceScore ?? 0),
    graphScore: Number(raw?.graph_score ?? raw?.graphScore ?? 0),
    ruleScore: Number(raw?.rule_score ?? raw?.ruleScore ?? 0),
    signals: extractList(raw?.signals ?? raw?.signal_list ?? raw?.signal ?? []),
    status: String(raw?.status ?? raw?.state ?? "PENDING")
  };
}
function extractTransactions(raw) {
  return extractList(raw).map(normalizeTransaction);
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold mono text-primary", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold", children: "Route not found in console" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The operational surface you requested does not exist." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "mt-6 inline-flex h-9 px-4 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm", children: "Return to Command Center" })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  const router2 = useRouter();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold", children: "Console error" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: error.message }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
      router2.invalidate();
      reset();
    }, className: "mt-4 h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm", children: "Retry" })
  ] }) });
}
const Route$l = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "VAJRA AI — Predictive Cybercrime Interception Console" },
      { name: "description", content: "VAJRA AI: Real-time predictive cybercrime intelligence, physical cash-out forecasting, SOP triage, tactical dispatch, and court legal dossier vault." },
      { name: "theme-color", content: "#0a1019" }
    ],
    links: [{ rel: "stylesheet", href: appCss }]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", className: "dark", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { className: "dark", children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$l.useRouteContext();
  const router2 = useRouter();
  const pathname = router2.state.location.pathname;
  const showLiveThreatFeed = pathname === "/";
  reactExports.useEffect(() => {
    const txs = new TransactionStream();
    const als = new AlertStream();
    const unsubTx = txs.onMessage((tRaw) => {
      try {
        const t = normalizeTransaction(tRaw);
        store.pushTransaction(t);
        store.setConnected(true);
        store.addTickerLine({
          ts: Date.now(),
          level: t.riskScore >= 80 ? "critical" : "warning",
          text: `Txn ${t.id.slice(0, 8)} ${t.sender.slice(-6)}→${t.receiver.slice(-6)} · ${t.currency} ${t.amount.toLocaleString()} · risk ${Math.round(t.riskScore)}%`
        });
        queryClient.setQueryData(["transactions", "recent"], (old) => {
          const arr = old || [];
          return [t, ...arr.filter((x) => x.id !== t.id)].slice(0, 500);
        });
        queryClient.setQueryData(["dashboard", "metrics"], (old) => {
          if (!old) return old;
          try {
            const copy = { ...old };
            copy.total_transactions = (copy.total_transactions || 0) + 1;
            if (t.decision && t.decision.toString().toUpperCase().includes("BLOCK")) {
              copy.blocked_transactions = (copy.blocked_transactions || 0) + 1;
            }
            if (typeof t.riskScore === "number" && t.riskScore >= 80) {
              copy.high_risk_count = (copy.high_risk_count || 0) + 1;
            }
            return copy;
          } catch (e) {
            return old;
          }
        });
        queryClient.setQueryData(["graph", "snapshot"], (old) => {
          if (!old) return old;
          try {
            const nodes = Array.isArray(old.nodes) ? [...old.nodes] : [];
            const edges = Array.isArray(old.edges) ? [...old.edges] : [];
            const ensureNode = (id) => {
              if (!nodes.find((n) => n.id === id)) nodes.push({ id, label: id.slice(-8) });
            };
            ensureNode(t.sender);
            ensureNode(t.receiver);
            const existing = edges.find((e) => e.source === t.sender && e.target === t.receiver);
            if (existing) {
              existing.weight = (existing.weight || 0) + 1;
            } else {
              edges.push({ source: t.sender, target: t.receiver, weight: 1 });
            }
            return { ...old, nodes, edges };
          } catch (e) {
            return old;
          }
        });
      } catch (e) {
        console.error("txn sse merge err", e);
      }
    });
    const unsubAl = als.onMessage((aRaw) => {
      try {
        const a = normalizeAlert(aRaw);
        store.pushAlert(a);
        store.setConnected(true);
        store.addTickerLine({
          ts: Date.now(),
          level: a.priority === "P1" ? "critical" : a.priority === "P2" ? "warning" : "success",
          text: `${a.priority} · ${a.type} · ${a.summary ?? "Alert triggered"} · risk ${Math.round(a.riskScore)}%`
        });
        queryClient.setQueryData(["alerts", "list"], (old) => {
          const arr = old || [];
          return [a, ...arr.filter((x) => x.id !== a.id)].slice(0, 500);
        });
        if (a.priority === "P1") {
          queryClient.setQueryData(["alerts", "p1"], (old) => {
            const arr = old || [];
            return [a, ...arr.filter((x) => x.id !== a.id)].slice(0, 500);
          });
        }
        queryClient.setQueryData(["dashboard", "metrics"], (old) => {
          if (!old) return old;
          try {
            const copy = { ...old };
            copy.review_queue = (copy.review_queue || 0) + 1;
            if (a.priority === "P1") copy.high_risk_count = (copy.high_risk_count || 0) + 1;
            return copy;
          } catch (e) {
            return old;
          }
        });
        queryClient.setQueryData(["officer", "queues"], (old) => {
          try {
            const arr = Array.isArray(old) ? [...old] : [];
            const item = { id: a.id, alertId: a.id, assignedTo: a.assignedOfficer ?? null, priority: a.priority };
            return [item, ...arr.filter((x) => x.id !== a.id)].slice(0, 500);
          } catch (e) {
            return old;
          }
        });
        queryClient.setQueryData(["reports", "list"], (old) => {
          if (!old) return old;
          try {
            return old;
          } catch (e) {
            return old;
          }
        });
      } catch (e) {
        console.error("alert sse merge err", e);
      }
    });
    txs.start();
    als.start();
    return () => {
      unsubTx();
      unsubAl();
      txs.stop();
      als.stop();
    };
  }, [queryClient]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-screen flex bg-background text-foreground overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sidebar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Header, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex min-h-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 overflow-y-auto scrollbar-thin min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) }),
        showLiveThreatFeed && /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "w-72 shrink-0 border-l border-border hidden xl:flex flex-col p-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RealtimeThreatFeed, { compact: true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(EscalationsPanel, {})
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { theme: "dark", position: "bottom-right", toastOptions: { style: { background: "var(--color-card)", border: "1px solid var(--color-border)", color: "var(--color-foreground)" } } })
  ] }) });
}
function EscalationsPanel() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["alerts", "escalations"],
    queryFn: fetchAlertEscalations,
    staleTime: 1e4,
    retry: 1,
    refetchInterval: 3e4
  });
  const breaches = Array.isArray(data) ? data.map((item) => {
    const alertId = String(item?.alert_id ?? item?.alertId ?? item?.id ?? "");
    const summary = String(item?.summary ?? item?.reason ?? item?.description ?? item?.txt ?? "SLA breach");
    const time = String(item?.t ?? item?.time ?? item?.delta ?? "");
    return { alertId, summary, time };
  }).filter((item) => item.alertId) : [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-panel rounded-lg p-3 text-xs min-h-0 flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] uppercase tracking-[0.18em] font-medium", children: "SLA Breaches" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] mono text-critical", children: isLoading ? "..." : `${breaches.length} ACTIVE` })
    ] }),
    isError ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: "Realtime SLA data unavailable." }) : breaches.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1.5 overflow-y-auto min-h-0 scrollbar-thin pr-1", children: breaches.slice(0, 5).map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between gap-3 p-2 rounded border border-critical/30 bg-critical/5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mono text-[11px] whitespace-normal break-words", children: b.alertId }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground whitespace-normal break-words leading-relaxed", children: b.summary })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mono text-[11px] text-critical shrink-0", children: b.time || "breached" })
    ] }, b.alertId)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: "No active SLA breaches" })
  ] });
}
const $$splitComponentImporter$k = () => import("./transaction-flow-CBka43hN.mjs");
const Route$k = createFileRoute("/transaction-flow")({
  head: () => ({
    meta: [{
      title: "Transaction Monitor — VAJRA AI"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$k, "component")
});
const $$splitComponentImporter$j = () => import("./sop-triage-CV1X2qxA.mjs");
const Route$j = createFileRoute("/sop-triage")({
  component: lazyRouteComponent($$splitComponentImporter$j, "component")
});
const $$splitComponentImporter$i = () => import("./simulation-CAgK-t_o.mjs");
const Route$i = createFileRoute("/simulation")({
  component: lazyRouteComponent($$splitComponentImporter$i, "component")
});
const $$splitComponentImporter$h = () => import("./settings-GmAYuPBT.mjs");
const Route$h = createFileRoute("/settings")({
  head: () => ({
    meta: [{
      title: "Settings — VAJRA AI"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
const $$splitComponentImporter$g = () => import("./reports-BYvZxn8P.mjs");
const Route$g = createFileRoute("/reports")({
  head: () => ({
    meta: [{
      title: "Reports — VAJRA AI"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("./officer-review-D1VoD-rl.mjs");
const Route$f = createFileRoute("/officer-review")({
  head: () => ({
    meta: [{
      title: "Officer Review — VAJRA AI"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./node-management-EsdPwDce.mjs");
const Route$e = createFileRoute("/node-management")({
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./mule-ring-investigator-zIwmSNWE.mjs");
const Route$d = createFileRoute("/mule-ring-investigator")({
  validateSearch: (search) => ({
    accountId: typeof search.accountId === "string" ? search.accountId : typeof search.account_id === "string" ? search.account_id : void 0,
    caseId: typeof search.caseId === "string" ? search.caseId : typeof search.case_id === "string" ? search.case_id : void 0,
    alertId: typeof search.alertId === "string" ? search.alertId : typeof search.alert_id === "string" ? search.alert_id : void 0
  }),
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./model-performance-Bhr9yNy1.mjs");
const Route$c = createFileRoute("/model-performance")({
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./legal-dossier-vault-CGtlSwB1.mjs");
const Route$b = createFileRoute("/legal-dossier-vault")({
  validateSearch: (search) => ({
    caseId: typeof search.caseId === "string" ? search.caseId : typeof search.case_id === "string" ? search.case_id : void 0,
    dossierId: typeof search.dossierId === "string" ? search.dossierId : typeof search.dossier_id === "string" ? search.dossier_id : void 0
  }),
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./investigation-B0YBXvEH.mjs");
const Route$a = createFileRoute("/investigation")({
  head: () => ({
    meta: [{
      title: "Investigation Sandbox — VAJRA AI"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./heatmap-CgDMUhx3.mjs");
const Route$9 = createFileRoute("/heatmap")({
  validateSearch: (search) => {
    return {
      caseId: typeof search.caseId === "string" ? search.caseId : typeof search.case_id === "string" ? search.case_id : void 0,
      nodeId: typeof search.nodeId === "string" ? search.nodeId : typeof search.node_id === "string" ? search.node_id : void 0,
      corridorId: typeof search.corridorId === "string" ? search.corridorId : typeof search.corridor_id === "string" ? search.corridor_id : void 0
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./graph-x8yL5yPs.mjs");
const Route$8 = createFileRoute("/graph")({
  head: () => ({
    meta: [{
      title: "Graph Explorer — VAJRA AI"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./field-Dj4mIaR1.mjs");
const Route$7 = createFileRoute("/field")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./fairness-audit-BNjVMOkH.mjs");
const Route$6 = createFileRoute("/fairness-audit")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./corridors-BKOwZu5N.mjs");
const Route$5 = createFileRoute("/corridors")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./cases-Ev-R_6Mc.mjs");
const Route$4 = createFileRoute("/cases")({
  head: () => ({
    meta: [{
      title: "Case Registry — VAJRA AI"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./audit-compliance-ledger-C3uHI1Ml.mjs");
const Route$3 = createFileRoute("/audit-compliance-ledger")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./alerts-CvxqYNwa.mjs");
const Route$2 = createFileRoute("/alerts")({
  head: () => ({
    meta: [{
      title: "Alert Center — VAJRA AI"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./accounts-C30Veimf.mjs");
const Route$1 = createFileRoute("/accounts")({
  head: () => ({
    meta: [{
      title: "Account 360 — VAJRA AI"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./index-qXYskuoM.mjs");
const Route = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "Command Center — VAJRA AI"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const TransactionFlowRoute = Route$k.update({
  id: "/transaction-flow",
  path: "/transaction-flow",
  getParentRoute: () => Route$l
});
const SopTriageRoute = Route$j.update({
  id: "/sop-triage",
  path: "/sop-triage",
  getParentRoute: () => Route$l
});
const SimulationRoute = Route$i.update({
  id: "/simulation",
  path: "/simulation",
  getParentRoute: () => Route$l
});
const SettingsRoute = Route$h.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => Route$l
});
const ReportsRoute = Route$g.update({
  id: "/reports",
  path: "/reports",
  getParentRoute: () => Route$l
});
const OfficerReviewRoute = Route$f.update({
  id: "/officer-review",
  path: "/officer-review",
  getParentRoute: () => Route$l
});
const NodeManagementRoute = Route$e.update({
  id: "/node-management",
  path: "/node-management",
  getParentRoute: () => Route$l
});
const MuleRingInvestigatorRoute = Route$d.update({
  id: "/mule-ring-investigator",
  path: "/mule-ring-investigator",
  getParentRoute: () => Route$l
});
const ModelPerformanceRoute = Route$c.update({
  id: "/model-performance",
  path: "/model-performance",
  getParentRoute: () => Route$l
});
const LegalDossierVaultRoute = Route$b.update({
  id: "/legal-dossier-vault",
  path: "/legal-dossier-vault",
  getParentRoute: () => Route$l
});
const InvestigationRoute = Route$a.update({
  id: "/investigation",
  path: "/investigation",
  getParentRoute: () => Route$l
});
const HeatmapRoute = Route$9.update({
  id: "/heatmap",
  path: "/heatmap",
  getParentRoute: () => Route$l
});
const GraphRoute = Route$8.update({
  id: "/graph",
  path: "/graph",
  getParentRoute: () => Route$l
});
const FieldRoute = Route$7.update({
  id: "/field",
  path: "/field",
  getParentRoute: () => Route$l
});
const FairnessAuditRoute = Route$6.update({
  id: "/fairness-audit",
  path: "/fairness-audit",
  getParentRoute: () => Route$l
});
const CorridorsRoute = Route$5.update({
  id: "/corridors",
  path: "/corridors",
  getParentRoute: () => Route$l
});
const CasesRoute = Route$4.update({
  id: "/cases",
  path: "/cases",
  getParentRoute: () => Route$l
});
const AuditComplianceLedgerRoute = Route$3.update({
  id: "/audit-compliance-ledger",
  path: "/audit-compliance-ledger",
  getParentRoute: () => Route$l
});
const AlertsRoute = Route$2.update({
  id: "/alerts",
  path: "/alerts",
  getParentRoute: () => Route$l
});
const AccountsRoute = Route$1.update({
  id: "/accounts",
  path: "/accounts",
  getParentRoute: () => Route$l
});
const IndexRoute = Route.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$l
});
const rootRouteChildren = {
  IndexRoute,
  AccountsRoute,
  AlertsRoute,
  AuditComplianceLedgerRoute,
  CasesRoute,
  CorridorsRoute,
  FairnessAuditRoute,
  FieldRoute,
  GraphRoute,
  HeatmapRoute,
  InvestigationRoute,
  LegalDossierVaultRoute,
  ModelPerformanceRoute,
  MuleRingInvestigatorRoute,
  NodeManagementRoute,
  OfficerReviewRoute,
  ReportsRoute,
  SettingsRoute,
  SimulationRoute,
  SopTriageRoute,
  TransactionFlowRoute
};
const routeTree = Route$l._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  API_BASE,
  Route$d as Route,
  Route$b as Route$1,
  Route$9 as Route$2,
  acknowledgeAlert,
  client,
  closeAlert,
  escalateAlert,
  extractGraphPayload,
  extractList,
  extractObject,
  extractTransactions,
  fetchAlertEscalations,
  fetchAlerts,
  fetchAlertsQueue,
  fetchP1Alerts,
  mergeHistoricalAlerts,
  mergeHistoricalTransactions,
  normalizeTransaction,
  router,
  store,
  useStore
};
