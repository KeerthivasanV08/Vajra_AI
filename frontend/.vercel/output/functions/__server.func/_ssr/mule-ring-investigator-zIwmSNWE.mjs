import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { z as searchMuleAccounts, q as fetchMuleTrace, o as fetchMuleFingerprint, p as fetchMulePredictedTerminals } from "./api-03VgCQYK.mjs";
import { Route as Route$d } from "./router-DXMls9-H.mjs";
import "../_libs/sonner.mjs";
import { w as GitBranch, b as ArrowLeft, a6 as User, Y as Search, U as RefreshCw, d as ArrowRight, _ as ShieldAlert, a3 as Tag, i as Building2 } from "../_libs/lucide-react.mjs";
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
const money = (value) => value == null ? "Unavailable" : `₹${value.toLocaleString("en-IN", {
  maximumFractionDigits: 2
})}`;
const minutes = (value) => value == null ? "Unavailable" : `${value.toFixed(1)} min`;
function Skeleton({
  className = ""
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `animate-pulse rounded bg-slate-700/70 ${className}` });
}
function Kpi({
  label,
  value,
  detail,
  tone,
  loading,
  idle
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `min-w-36 flex-1 rounded-lg border p-3 ${idle ? "border-dashed border-slate-700 bg-slate-950/40" : "border-slate-800 bg-slate-950"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400", children: label }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "mt-2 h-6 w-20" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mt-1 font-mono text-xl font-bold ${idle ? "text-slate-500" : tone}`, children: value || "Unavailable" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mt-1 text-xs ${idle ? "text-slate-600" : "text-slate-400"}`, children: detail })
  ] });
}
function RoleNode({
  title,
  account,
  bank,
  role,
  amount,
  transactionId,
  onClick
}) {
  const roleStyle = {
    victim: "border-emerald-500/70 text-emerald-300",
    layer_mule: "border-amber-500/70 text-amber-300",
    terminal_mule: "border-rose-500/80 text-rose-300",
    predicted_terminal: "border-pink-500/80 text-pink-300"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick, className: `w-56 shrink-0 space-y-2 rounded-lg border bg-slate-950 p-4 text-left ${roleStyle[role] || roleStyle.layer_mule}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold uppercase", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4 shrink-0" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "break-all font-mono text-sm font-bold text-slate-100", children: account || "Unavailable" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-400", children: bank || "Bank unavailable" }),
    amount != null && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-slate-800 pt-2 font-mono text-sm font-semibold", children: money(amount) }),
    transactionId && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-500", children: transactionId })
  ] });
}
function FlowSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center overflow-hidden py-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 w-56 shrink-0" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 shrink-0 border-t-2 border-dashed border-slate-700" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 w-56 shrink-0" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 shrink-0 border-t-2 border-dashed border-slate-700" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 w-56 shrink-0" })
  ] });
}
function RetryPanel({
  message,
  onRetry
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-rose-900/70 bg-slate-950 p-4 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-rose-200", children: message }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onRetry, className: "mt-3 rounded-md bg-slate-800 px-4 py-2 text-sm text-white", children: "Retry" })
  ] });
}
function Ledger({
  transactions,
  hops,
  onSelect
}) {
  const hopStep = (txn) => {
    if (txn.transaction_id) {
      const byId = hops.find((h) => h.transaction_id === txn.transaction_id);
      if (byId) return byId.step;
    }
    const byAccounts = hops.find((h) => h.from_account === txn.from_account && h.to_account === txn.to_account);
    return byAccounts?.step ?? null;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-lg border border-slate-800", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "vajra-readable-table w-full min-w-[60rem] text-left text-[15px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-slate-950 font-mono text-xs uppercase text-slate-300", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Hop", "From → To", "Banks", "Amount", "Type", "Velocity", "Elapsed"].map((heading) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-3 font-semibold", children: heading }, heading)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: transactions.map((transaction) => {
      const step = hopStep(transaction);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { onClick: () => onSelect(transaction), className: "cursor-pointer border-t border-slate-800 bg-slate-900/60 text-slate-200 hover:bg-slate-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 font-mono text-slate-500", children: step != null ? `#${step}` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-3 font-mono", children: [
          transaction.from_account || "Unavailable",
          " →",
          " ",
          transaction.to_account || "Unavailable"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-3 text-slate-400", children: [
          transaction.from_bank || "—",
          " → ",
          transaction.to_bank || "—"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 font-mono text-emerald-300", children: money(transaction.amount) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-slate-400 capitalize", children: transaction.channel || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: minutes(transaction.velocity_mins) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: minutes(transaction.elapsed_mins) })
      ] }, transaction.transaction_id || `${transaction.from_account}-${transaction.to_account}-${transaction.timestamp}`);
    }) })
  ] }) });
}
function MuleRingInvestigatorPage() {
  const search = Route$d.useSearch();
  const navigate = useNavigate();
  const [query, setQuery] = reactExports.useState("");
  const [debouncedQuery, setDebouncedQuery] = reactExports.useState("");
  const [showAccountSearch, setShowAccountSearch] = reactExports.useState(!search.accountId && !search.caseId && !search.alertId);
  const [selectedTransaction, setSelectedTransaction] = reactExports.useState(null);
  const requestedId = search.caseId || search.alertId || search.accountId;
  const accountSearchQuery = useQuery({
    queryKey: ["mule-ring", "account-search", debouncedQuery],
    queryFn: () => searchMuleAccounts(debouncedQuery),
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 3e4,
    retry: false
  });
  const traceQuery = useQuery({
    queryKey: ["mule-ring", "trace", requestedId],
    queryFn: () => fetchMuleTrace(requestedId),
    enabled: Boolean(requestedId),
    retry: false
  });
  const fingerprintQuery = useQuery({
    queryKey: ["mule-ring", "fingerprint", requestedId],
    queryFn: () => fetchMuleFingerprint(requestedId),
    enabled: Boolean(requestedId),
    retry: false
  });
  const terminalsQuery = useQuery({
    queryKey: ["mule-ring", "terminals", requestedId],
    queryFn: () => fetchMulePredictedTerminals(requestedId),
    enabled: Boolean(requestedId),
    retry: false
  });
  const trace = traceQuery.data;
  const fingerprint = fingerprintQuery.data;
  const terminals = terminalsQuery.data?.candidates ?? [];
  const searchResults = accountSearchQuery.data ?? [];
  const traceState = !requestedId ? "idle" : traceQuery.isPending ? "loading" : traceQuery.isError ? "error" : trace?.status === "SUCCESS" ? "success" : "empty";
  const fingerprintState = !requestedId ? "idle" : fingerprintQuery.isPending ? "loading" : fingerprintQuery.isError ? "error" : fingerprint?.status === "UNAVAILABLE" ? "error" : fingerprint?.patterns.length ? "success" : "empty";
  const terminalState = !requestedId ? "idle" : terminalsQuery.isPending ? "loading" : terminalsQuery.isError || terminalsQuery.data?.status === "UNAVAILABLE" ? "error" : terminals.length ? "success" : "empty";
  const isSearchDebouncing = query.trim().length >= 2 && query.trim() !== debouncedQuery.trim();
  const searchState = query.trim().length < 2 ? "idle" : isSearchDebouncing || accountSearchQuery.isFetching ? "loading" : accountSearchQuery.isError ? "error" : searchResults.length ? "success" : "empty";
  const activeAccountId = trace?.account_id || search.accountId;
  const isLinked = Boolean(requestedId);
  reactExports.useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);
  const retryTrace = () => void traceQuery.refetch();
  const idle = !isLinked;
  const kpis = trace?.kpis;
  const roles = {
    victim: "Victim / Origin",
    layer_mule: "Layer Mule",
    terminal_mule: "Terminal Mule"
  };
  const backLink = search.alertId ? {
    to: "/alerts",
    label: "Back to Alert Center"
  } : search.caseId ? {
    to: "/cases",
    label: "Back to Cases"
  } : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-full flex-col gap-4 overflow-y-auto bg-slate-950 p-4 text-slate-200", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap items-start justify-between gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(GitBranch, { className: "mt-1 h-6 w-6 shrink-0 text-rose-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "vajra-page-title font-mono uppercase tracking-wider", children: "Mule Ring Hop-by-Hop Investigator" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 vajra-body", children: "Multi-hop layering flow and syndicate pattern analytics" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap items-center gap-2 text-xs font-mono uppercase", children: [
            backLink && /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: backLink.to, className: "inline-flex items-center gap-1 text-rose-300 hover:text-rose-200", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-3.5 w-3.5" }),
              backLink.label
            ] }),
            [["CASE", trace?.case_id || search.caseId, search.caseId ? `/cases` : null], ["ALERT", trace?.alert_id || search.alertId, search.alertId ? `/alerts` : null], ["ACCOUNT", activeAccountId, null]].map(([label, value, navTo]) => navTo && value ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: navTo, className: "inline-flex items-center gap-1 rounded-full border border-cyan-700/70 bg-cyan-950/50 px-3 py-1.5 text-cyan-200 hover:bg-cyan-900/60", children: [
              label,
              " · ",
              value
            ] }, label) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `rounded-full border px-3 py-1.5 ${value ? "border-cyan-700/70 bg-cyan-950/50 text-cyan-200" : "border-dashed border-slate-700 bg-slate-950 text-slate-500"}`, children: [
              label,
              " · ",
              value || "Not linked"
            ] }, label))
          ] })
        ] }),
        activeAccountId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/accounts", search: {
            accountId: activeAccountId
          }, className: "inline-flex items-center gap-1.5 rounded-md border border-cyan-700/70 bg-cyan-950/40 px-3 py-2 text-xs text-cyan-200 hover:bg-cyan-900/50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3.5 w-3.5" }),
            "Open Account 360"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowAccountSearch((visible) => !visible), className: "rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800", children: showAccountSearch ? "Hide Search" : "Change Account" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
            setShowAccountSearch(true);
            setQuery("");
            setDebouncedQuery("");
            void navigate({
              to: "/mule-ring-investigator",
              search: {
                accountId: void 0,
                caseId: void 0,
                alertId: void 0
              }
            });
          }, className: "rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-400 hover:bg-slate-800", children: "Clear Selection" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { label: "Hops Traced", value: kpis ? String(kpis.hops_traced) : void 0, detail: "Observed transfers in chain", tone: "text-rose-300", loading: traceState === "loading", idle }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { label: "Fan-Out Factor", value: kpis?.fan_out_factor == null ? void 0 : `${kpis.fan_out_factor.toFixed(1)}×`, detail: "Peak outgoing branches", tone: "text-amber-300", loading: traceState === "loading", idle }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { label: "Total Flow Value", value: money(kpis?.total_flow_value), detail: "Sum of observed transfers", tone: "text-emerald-300", loading: traceState === "loading", idle }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { label: "Layering Time", value: minutes(kpis?.layering_time_min), detail: "First to last observed hop", tone: "text-cyan-300", loading: traceState === "loading", idle }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { label: "Terminal Mules", value: kpis ? String(kpis.terminal_mule_count) : void 0, detail: "Observed terminal accounts", tone: "text-rose-300", loading: traceState === "loading", idle })
      ] })
    ] }),
    (showAccountSearch || !activeAccountId && !search.caseId && !search.alertId) && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-xl border border-slate-800 bg-slate-900 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "vajra-section-title", children: "Search Account" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 vajra-body-small", children: "Search seeded account records by masked ID or holder name." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: query, onChange: (event) => setQuery(event.target.value), placeholder: "Search account ID or name", className: "w-full rounded-md border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 divide-y divide-slate-800 overflow-hidden rounded-md border border-slate-800", children: [
        query.trim().length < 2 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 text-sm text-slate-400", children: "Type at least 2 characters to search." }),
        query.trim().length >= 2 && searchState === "loading" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" })
        ] }),
        searchState === "error" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 text-sm text-rose-300", children: "Account search is unavailable. Try again." }),
        searchState === "empty" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 text-sm text-slate-400", children: "No matching accounts found." }),
        searchResults.map((account) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { "aria-pressed": activeAccountId === account.account_id, onClick: () => {
          setShowAccountSearch(false);
          void navigate({
            to: "/mule-ring-investigator",
            search: {
              accountId: account.account_id,
              caseId: account.linked_case_id || void 0,
              alertId: void 0
            }
          });
        }, className: `flex w-full flex-wrap items-center justify-between gap-3 px-3 py-3 text-left hover:bg-slate-800 ${activeAccountId === account.account_id ? "bg-cyan-950/40 ring-1 ring-inset ring-cyan-700/60" : ""}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block font-mono text-sm font-semibold text-slate-100", children: account.account_id_masked }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-slate-400", children: account.holder_name_masked })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex flex-wrap items-center gap-2 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400", children: account.bank }),
            account.risk_tier && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full border border-amber-700/60 bg-amber-950/40 px-2 py-1 text-amber-300", children: account.risk_tier }),
            account.linked_case_id && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full border border-cyan-700/60 bg-cyan-950/40 px-2 py-1 text-cyan-200", children: [
              "Linked to ",
              account.linked_case_id
            ] })
          ] })
        ] }, account.account_id))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "vajra-section-title uppercase tracking-wider", children: "Multi-Hop Transaction Velocity Flow" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 vajra-body-small", children: "Observed transaction evidence. Predictions remain distinct from transfers." })
        ] }),
        requestedId && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: retryTrace, className: "inline-flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5" }),
          "Refresh"
        ] })
      ] }),
      traceState === "loading" && /* @__PURE__ */ jsxRuntimeExports.jsx(FlowSkeleton, {}),
      traceState === "error" && /* @__PURE__ */ jsxRuntimeExports.jsx(RetryPanel, { message: "Unable to load investigation chain.", onRetry: retryTrace }),
      traceState === "idle" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3 rounded-lg border border-dashed border-slate-700 bg-slate-950/50 p-8 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(GitBranch, { className: "h-9 w-9 text-slate-600" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-400", children: "Select an account or open this page from an alert/case." })
      ] }),
      traceState === "empty" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-slate-800 bg-slate-950 p-6 text-center text-sm text-slate-400", children: "No multi-hop transaction flow identified for this account." }),
      traceState === "success" && trace && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-max items-center", children: [
          trace.origin && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RoleNode, { title: roles.victim, account: trace.origin.account_id, bank: trace.transactions[0]?.from_bank ?? null, role: "victim" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex w-12 shrink-0 items-center justify-center text-cyan-400", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-5 w-5" }) })
          ] }),
          trace.hops.map((hop, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RoleNode, { title: roles[hop.role] || hop.role, account: hop.to_account, bank: hop.to_bank, role: hop.role, amount: hop.amount, transactionId: hop.transaction_id, onClick: () => setSelectedTransaction(trace.transactions[index] || null) }),
            (index < trace.hops.length - 1 || Boolean(trace.predicted_terminal) || terminalState === "success" && terminals.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex w-12 shrink-0 items-center justify-center text-cyan-400", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-5 w-5" }) })
          ] }, `${hop.transaction_id || hop.step}-${hop.step}`)),
          (trace.predicted_terminal || (terminalState === "success" ? terminals[0] : null)) && /* @__PURE__ */ jsxRuntimeExports.jsx(RoleNode, { title: "Predicted Cash-Out", account: trace.predicted_terminal?.node_id || terminals[0].node_id, bank: "Physical cash-out node", role: "predicted_terminal" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-2 border-t border-slate-800 pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-mono text-xs font-semibold uppercase tracking-wider text-slate-300", children: "Underlying Transaction Ledger" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Ledger, { transactions: trace.transactions, hops: trace.hops, onSelect: setSelectedTransaction })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 xl:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "vajra-section-title flex items-center gap-2 uppercase tracking-wider", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-4 w-4 text-rose-300" }),
          "Model 8 Syndicate Fingerprint"
        ] }),
        fingerprintState === "loading" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-2/3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" })
        ] }),
        fingerprintState === "idle" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-dashed border-slate-700 bg-slate-950/50 p-4 text-sm text-slate-500", children: "Select an account to begin." }),
        fingerprintState === "error" && /* @__PURE__ */ jsxRuntimeExports.jsx(RetryPanel, { message: fingerprint?.reason || "Model 8 fingerprint analysis is currently unavailable.", onRetry: () => void fingerprintQuery.refetch() }),
        fingerprintState === "empty" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400", children: "No known pattern matched." }),
        fingerprintState === "success" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          fingerprint?.patterns.map((pattern) => /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "group rounded-lg border border-slate-800 bg-slate-950 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { className: "flex cursor-pointer list-none flex-wrap items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex flex-wrap gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-md border border-rose-800/70 bg-rose-950/40 px-2 py-1 text-sm text-rose-200", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { className: "h-3 w-3" }),
                pattern.pattern_name.replace(/_/g, " ")
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-sm font-semibold text-amber-300", children: pattern.match_confidence == null ? "Unavailable" : `${(pattern.match_confidence * 100).toFixed(1)}%` })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-3 space-y-1 border-t border-slate-800 pt-3 text-xs text-slate-400", children: pattern.matching_features.map((feature) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              "• ",
              feature
            ] }, feature)) })
          ] }, pattern.pattern_name)),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "vajra-body-small text-slate-500", children: "Investigative intelligence only. Does not alter SOP action tiers." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "vajra-section-title flex items-center gap-2 uppercase tracking-wider", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-4 w-4 text-pink-300" }),
          "Predicted Physical Cash-Out Terminals"
        ] }),
        terminalState === "loading" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: [0, 1, 2].map((rank) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-14 w-full" }, rank)) }),
        terminalState === "idle" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-dashed border-slate-700 bg-slate-950/50 p-4 text-sm text-slate-500", children: "Select an account to begin." }),
        terminalState === "error" && /* @__PURE__ */ jsxRuntimeExports.jsx(RetryPanel, { message: terminalsQuery.data?.reason || "Physical cash-out prediction is currently unavailable.", onRetry: () => void terminalsQuery.refetch() }),
        terminalState === "empty" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400", children: "No predicted terminals are available." }),
        terminalState === "success" && /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "divide-y divide-slate-800 rounded-lg border border-slate-800 bg-slate-950", children: terminals.slice(0, 3).map((candidate) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex flex-wrap items-center justify-between gap-3 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "grid h-7 w-7 place-items-center rounded-full border border-pink-800/70 font-mono text-xs text-pink-300", children: [
              "#",
              candidate.rank
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-sm font-semibold text-slate-100", children: candidate.node_id }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-400", children: candidate.distance_from_corridor_km == null ? "Distance unavailable" : `${candidate.distance_from_corridor_km.toFixed(1)} km from corridor` })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-sm font-semibold text-pink-300", children: candidate.confidence_pct == null ? "Unavailable" : `${candidate.confidence_pct.toFixed(1)}%` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/heatmap", search: {
              nodeId: candidate.node_id,
              caseId: trace?.case_id || search.caseId
            }, className: "rounded border border-pink-800/70 px-2 py-1 text-xs text-pink-200 hover:bg-pink-950/50", children: "Open Map" })
          ] })
        ] }, candidate.node_id)) })
      ] })
    ] }),
    selectedTransaction && /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "rounded-xl border border-cyan-800/70 bg-slate-900 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "vajra-section-title", children: "Transaction Detail" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSelectedTransaction(null), className: "text-sm text-slate-300", children: "Close" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 grid gap-2 text-sm sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          "From: ",
          selectedTransaction.from_account || "Unavailable"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          "To: ",
          selectedTransaction.to_account || "Unavailable"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          "Amount: ",
          money(selectedTransaction.amount)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          "Transaction: ",
          selectedTransaction.transaction_id || "Unavailable"
        ] })
      ] })
    ] })
  ] });
}
export {
  MuleRingInvestigatorPage as component
};
