import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  GitBranch,
  RefreshCw,
  Search,
  ShieldAlert,
  Tag,
  User,
} from "lucide-react";
import {
  fetchMuleFingerprint,
  fetchMulePredictedTerminals,
  fetchMuleTrace,
  searchMuleAccounts,
} from "@/services/api";
import type { MuleRingTransaction, MuleTraceHop } from "@/types/vajra";

export const Route = createFileRoute("/mule-ring-investigator")({
  validateSearch: (search: Record<string, unknown>) => ({
    accountId:
      typeof search.accountId === "string"
        ? search.accountId
        : typeof search.account_id === "string"
          ? search.account_id
          : undefined,
    caseId:
      typeof search.caseId === "string"
        ? search.caseId
        : typeof search.case_id === "string"
          ? search.case_id
          : undefined,
    alertId:
      typeof search.alertId === "string"
        ? search.alertId
        : typeof search.alert_id === "string"
          ? search.alert_id
          : undefined,
  }),
  component: MuleRingInvestigatorPage,
});

type PanelState = "idle" | "loading" | "success" | "empty" | "error";
const money = (value: number | null | undefined) =>
  value == null ? "Unavailable" : `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const minutes = (value: number | null | undefined) =>
  value == null ? "Unavailable" : `${value.toFixed(1)} min`;

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-700/70 ${className}`} />;
}

function Kpi({
  label,
  value,
  detail,
  tone,
  loading,
  idle,
}: {
  label: string;
  value?: string;
  detail: string;
  tone: string;
  loading: boolean;
  idle: boolean;
}) {
  return (
    <div className={`min-w-36 flex-1 rounded-lg border p-3 ${idle ? "border-dashed border-slate-700 bg-slate-950/40" : "border-slate-800 bg-slate-950"}`}>
      <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</div>
      {loading ? <Skeleton className="mt-2 h-6 w-20" /> : (
        <div className={`mt-1 font-mono text-xl font-bold ${idle ? "text-slate-500" : tone}`}>{value || "Unavailable"}</div>
      )}
      <div className={`mt-1 text-xs ${idle ? "text-slate-600" : "text-slate-400"}`}>{detail}</div>
    </div>
  );
}

function RoleNode({
  title,
  account,
  bank,
  role,
  amount,
  transactionId,
  onClick,
}: {
  title: string;
  account: string | null;
  bank: string | null;
  role: string;
  amount?: number | null;
  transactionId?: string | null;
  onClick?: () => void;
}) {
  const roleStyle: Record<string, string> = {
    victim: "border-emerald-500/70 text-emerald-300",
    layer_mule: "border-amber-500/70 text-amber-300",
    terminal_mule: "border-rose-500/80 text-rose-300",
    predicted_terminal: "border-pink-500/80 text-pink-300",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-56 shrink-0 space-y-2 rounded-lg border bg-slate-950 p-4 text-left ${roleStyle[role] || roleStyle.layer_mule}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase">{title}</span>
        <User className="h-4 w-4 shrink-0" />
      </div>
      <div className="break-all font-mono text-sm font-bold text-slate-100">{account || "Unavailable"}</div>
      <div className="text-xs text-slate-400">{bank || "Bank unavailable"}</div>
      {amount != null && <div className="border-t border-slate-800 pt-2 font-mono text-sm font-semibold">{money(amount)}</div>}
      {transactionId && <div className="text-xs text-slate-500">{transactionId}</div>}
    </button>
  );
}

function FlowSkeleton() {
  return <div className="flex items-center overflow-hidden py-2"><Skeleton className="h-32 w-56 shrink-0" /><div className="w-12 shrink-0 border-t-2 border-dashed border-slate-700" /><Skeleton className="h-32 w-56 shrink-0" /><div className="w-12 shrink-0 border-t-2 border-dashed border-slate-700" /><Skeleton className="h-32 w-56 shrink-0" /></div>;
}

function RetryPanel({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="rounded-lg border border-rose-900/70 bg-slate-950 p-4 text-center"><p className="text-sm text-rose-200">{message}</p><button onClick={onRetry} className="mt-3 rounded-md bg-slate-800 px-4 py-2 text-sm text-white">Retry</button></div>;
}

function Ledger({ transactions, onSelect }: { transactions: MuleRingTransaction[]; onSelect: (transaction: MuleRingTransaction) => void }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-800">
      <table className="vajra-readable-table w-full min-w-[54rem] text-left text-[15px]">
        <thead className="bg-slate-950 font-mono text-xs uppercase text-slate-300"><tr>{["From → To", "Banks", "Amount", "Velocity", "Elapsed"].map((heading) => <th key={heading} className="px-3 py-3 font-semibold">{heading}</th>)}</tr></thead>
        <tbody>{transactions.map((transaction) => <tr key={transaction.transaction_id || `${transaction.from_account}-${transaction.to_account}-${transaction.timestamp}`} onClick={() => onSelect(transaction)} className="cursor-pointer border-t border-slate-800 bg-slate-900/60 text-slate-200 hover:bg-slate-800">
          <td className="px-3 py-3 font-mono">{transaction.from_account || "Unavailable"} → {transaction.to_account || "Unavailable"}</td>
          <td className="px-3 py-3 text-slate-400">{transaction.from_bank || "Unavailable"} → {transaction.to_bank || "Unavailable"}</td>
          <td className="px-3 py-3 font-mono text-emerald-300">{money(transaction.amount)}</td>
          <td className="px-3 py-3">{minutes(transaction.velocity_mins)}</td>
          <td className="px-3 py-3">{minutes(transaction.elapsed_mins)}</td>
        </tr>)}</tbody>
      </table>
    </div>
  );
}

function MuleRingInvestigatorPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showAccountSearch, setShowAccountSearch] = useState(!search.accountId && !search.caseId && !search.alertId);
  const [selectedTransaction, setSelectedTransaction] = useState<MuleRingTransaction | null>(null);
  // Case/alert IDs resolve server-side to their account and preserve the
  // investigation context when a search result is already linked.
  const requestedId = search.caseId || search.alertId || search.accountId;
  const accountSearchQuery = useQuery({
    queryKey: ["mule-ring", "account-search", debouncedQuery],
    queryFn: () => searchMuleAccounts(debouncedQuery),
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 30_000,
    retry: false,
  });
  const traceQuery = useQuery({
    queryKey: ["mule-ring", "trace", requestedId],
    queryFn: () => fetchMuleTrace(requestedId as string),
    enabled: Boolean(requestedId),
    retry: false,
  });
  const fingerprintQuery = useQuery({
    queryKey: ["mule-ring", "fingerprint", requestedId],
    queryFn: () => fetchMuleFingerprint(requestedId as string),
    enabled: Boolean(requestedId),
    retry: false,
  });
  const terminalsQuery = useQuery({
    queryKey: ["mule-ring", "terminals", requestedId],
    queryFn: () => fetchMulePredictedTerminals(requestedId as string),
    enabled: Boolean(requestedId),
    retry: false,
  });
  const trace = traceQuery.data;
  const fingerprint = fingerprintQuery.data;
  const terminals = terminalsQuery.data?.candidates ?? [];
  const searchResults = accountSearchQuery.data ?? [];
  const traceState: PanelState = !requestedId ? "idle" : traceQuery.isPending ? "loading" : traceQuery.isError ? "error" : trace?.status === "SUCCESS" ? "success" : "empty";
  const fingerprintState: PanelState = !requestedId ? "idle" : fingerprintQuery.isPending ? "loading" : fingerprintQuery.isError ? "error" : fingerprint?.status === "UNAVAILABLE" ? "error" : fingerprint?.patterns.length ? "success" : "empty";
  const terminalState: PanelState = !requestedId ? "idle" : terminalsQuery.isPending ? "loading" : terminalsQuery.isError || terminalsQuery.data?.status === "UNAVAILABLE" ? "error" : terminals.length ? "success" : "empty";
  const isSearchDebouncing = query.trim().length >= 2 && query.trim() !== debouncedQuery.trim();
  const searchState: PanelState = query.trim().length < 2 ? "idle" : isSearchDebouncing || accountSearchQuery.isFetching ? "loading" : accountSearchQuery.isError ? "error" : searchResults.length ? "success" : "empty";
  const activeAccountId = trace?.account_id || search.accountId;
  const isLinked = Boolean(requestedId);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const retryTrace = () => void traceQuery.refetch();
  const idle = !isLinked;
  const kpis = trace?.kpis;
  const roles: Record<string, string> = { victim: "Victim / Origin", layer_mule: "Layer Mule", terminal_mule: "Terminal Mule" };
  const backLink = search.alertId ? { to: "/alerts" as const, label: "Back to Alert Center" } : search.caseId ? { to: "/cases" as const, label: "Back to Cases" } : null;

  return (
    <div className="flex min-h-full flex-col gap-4 overflow-y-auto bg-slate-950 p-4 text-slate-200">
      <header className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <GitBranch className="mt-1 h-6 w-6 shrink-0 text-rose-500" />
            <div>
              <h1 className="vajra-page-title font-mono uppercase tracking-wider">Mule Ring Hop-by-Hop Investigator</h1>
              <p className="mt-1 vajra-body">Multi-hop layering flow and syndicate pattern analytics</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-mono uppercase">
                {backLink && <Link to={backLink.to} className="inline-flex items-center gap-1 text-rose-300 hover:text-rose-200"><ArrowLeft className="h-3.5 w-3.5" />{backLink.label}</Link>}
                {[ ["CASE", trace?.case_id || search.caseId], ["ALERT", trace?.alert_id || search.alertId], ["ACCOUNT", activeAccountId] ].map(([label, value]) => <span key={label} className={`rounded-full border px-3 py-1.5 ${value ? "border-cyan-700/70 bg-cyan-950/50 text-cyan-200" : "border-dashed border-slate-700 bg-slate-950 text-slate-500"}`}>{label} · {value || "Not linked"}</span>)}
              </div>
            </div>
            {activeAccountId && <div className="flex shrink-0 gap-2"><button onClick={() => setShowAccountSearch((visible) => !visible)} className="rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800">{showAccountSearch ? "Hide Search" : "Change Account"}</button><button onClick={() => { setShowAccountSearch(true); setQuery(""); setDebouncedQuery(""); void navigate({ to: "/mule-ring-investigator", search: { accountId: undefined, caseId: undefined, alertId: undefined } }); }} className="rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-400 hover:bg-slate-800">Clear Selection</button></div>}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-5">
          <Kpi label="Hops Traced" value={kpis ? String(kpis.hops_traced) : undefined} detail="Observed transfers in chain" tone="text-rose-300" loading={traceState === "loading"} idle={idle} />
          <Kpi label="Fan-Out Factor" value={kpis?.fan_out_factor == null ? undefined : `${kpis.fan_out_factor.toFixed(1)}×`} detail="Peak outgoing branches" tone="text-amber-300" loading={traceState === "loading"} idle={idle} />
          <Kpi label="Total Flow Value" value={money(kpis?.total_flow_value)} detail="Sum of observed transfers" tone="text-emerald-300" loading={traceState === "loading"} idle={idle} />
          <Kpi label="Layering Time" value={minutes(kpis?.layering_time_min)} detail="First to last observed hop" tone="text-cyan-300" loading={traceState === "loading"} idle={idle} />
          <Kpi label="Terminal Mules" value={kpis ? String(kpis.terminal_mule_count) : undefined} detail="Observed terminal accounts" tone="text-rose-300" loading={traceState === "loading"} idle={idle} />
        </div>
      </header>

      {(showAccountSearch || (!activeAccountId && !search.caseId && !search.alertId)) && <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="vajra-section-title">Search Account</h2>
        <p className="mt-1 vajra-body-small">Search seeded account records by masked ID or holder name.</p>
        <div className="relative mt-3"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search account ID or name" className="w-full rounded-md border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500" /></div>
        <div className="mt-2 divide-y divide-slate-800 overflow-hidden rounded-md border border-slate-800">
          {query.trim().length < 2 && <div className="p-3 text-sm text-slate-400">Type at least 2 characters to search.</div>}
          {query.trim().length >= 2 && searchState === "loading" && <div className="space-y-2 p-3"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>}
          {searchState === "error" && <div className="p-3 text-sm text-rose-300">Account search is unavailable. Try again.</div>}
          {searchState === "empty" && <div className="p-3 text-sm text-slate-400">No matching accounts found.</div>}
          {searchResults.map((account) => <button key={account.account_id} aria-pressed={activeAccountId === account.account_id} onClick={() => { setShowAccountSearch(false); void navigate({ to: "/mule-ring-investigator", search: { accountId: account.account_id, caseId: account.linked_case_id || undefined, alertId: undefined } }); }} className={`flex w-full flex-wrap items-center justify-between gap-3 px-3 py-3 text-left hover:bg-slate-800 ${activeAccountId === account.account_id ? "bg-cyan-950/40 ring-1 ring-inset ring-cyan-700/60" : ""}`}>
            <span className="min-w-0"><span className="block font-mono text-sm font-semibold text-slate-100">{account.account_id_masked}</span><span className="text-sm text-slate-400">{account.holder_name_masked}</span></span>
            <span className="flex flex-wrap items-center gap-2 text-xs"><span className="text-slate-400">{account.bank}</span>{account.risk_tier && <span className="rounded-full border border-amber-700/60 bg-amber-950/40 px-2 py-1 text-amber-300">{account.risk_tier}</span>}{account.linked_case_id && <span className="rounded-full border border-cyan-700/60 bg-cyan-950/40 px-2 py-1 text-cyan-200">Linked to {account.linked_case_id}</span>}</span>
          </button>)}
        </div>
      </section>}

      <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex items-center justify-between gap-3"><div><h2 className="vajra-section-title uppercase tracking-wider">Multi-Hop Transaction Velocity Flow</h2><p className="mt-1 vajra-body-small">Observed transaction evidence. Predictions remain distinct from transfers.</p></div>{requestedId && <button onClick={retryTrace} className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700"><RefreshCw className="h-3.5 w-3.5" />Refresh</button>}</div>
        {traceState === "loading" && <FlowSkeleton />}
        {traceState === "error" && <RetryPanel message="Unable to load investigation chain." onRetry={retryTrace} />}
        {traceState === "idle" && <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-slate-700 bg-slate-950/50 p-8 text-center"><GitBranch className="h-9 w-9 text-slate-600" /><p className="text-sm text-slate-400">Select an account or open this page from an alert/case.</p></div>}
        {traceState === "empty" && <div className="rounded-lg border border-slate-800 bg-slate-950 p-6 text-center text-sm text-slate-400">No multi-hop transaction flow identified for this account.</div>}
        {traceState === "success" && trace && <>
          <div className="overflow-x-auto pb-2"><div className="flex min-w-max items-center">
            {trace.origin && <><RoleNode title={roles.victim} account={trace.origin.account_id} bank={null} role="victim" /><div className="flex w-12 shrink-0 items-center justify-center text-cyan-400"><ArrowRight className="h-5 w-5" /></div></>}
            {trace.hops.map((hop, index) => <div key={`${hop.transaction_id || hop.step}-${hop.step}`} className="flex items-center"><RoleNode title={roles[hop.role] || hop.role} account={hop.to_account} bank={hop.to_bank} role={hop.role} amount={hop.amount} transactionId={hop.transaction_id} onClick={() => setSelectedTransaction(trace.transactions[index] || null)} />{(index < trace.hops.length - 1 || Boolean(trace.predicted_terminal) || (terminalState === "success" && terminals.length > 0)) && <div className="flex w-12 shrink-0 items-center justify-center text-cyan-400"><ArrowRight className="h-5 w-5" /></div>}</div>)}
            {(trace.predicted_terminal || (terminalState === "success" ? terminals[0] : null)) && <RoleNode title="Predicted Cash-Out" account={trace.predicted_terminal?.node_id || terminals[0].node_id} bank="Physical cash-out node" role="predicted_terminal" />}
          </div></div>
          <section className="space-y-2 border-t border-slate-800 pt-4"><h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-300">Underlying Transaction Ledger</h3><Ledger transactions={trace.transactions} onSelect={setSelectedTransaction} /></section>
        </>}
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-4"><h3 className="vajra-section-title flex items-center gap-2 uppercase tracking-wider"><ShieldAlert className="h-4 w-4 text-rose-300" />Model 8 Syndicate Fingerprint</h3>
          {fingerprintState === "loading" && <div className="space-y-2"><Skeleton className="h-8 w-2/3" /><Skeleton className="h-12 w-full" /></div>}
          {fingerprintState === "idle" && <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950/50 p-4 text-sm text-slate-500">Select an account to begin.</div>}
          {fingerprintState === "error" && <RetryPanel message={fingerprint?.reason || "Model 8 fingerprint analysis is currently unavailable."} onRetry={() => void fingerprintQuery.refetch()} />}
          {fingerprintState === "empty" && <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">No known pattern matched.</div>}
          {fingerprintState === "success" && <div className="space-y-3">{fingerprint?.patterns.map((pattern) => <details key={pattern.pattern_name} className="group rounded-lg border border-slate-800 bg-slate-950 p-3"><summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2"><span className="flex flex-wrap gap-2"><span className="inline-flex items-center gap-1 rounded-md border border-rose-800/70 bg-rose-950/40 px-2 py-1 text-sm text-rose-200"><Tag className="h-3 w-3" />{pattern.pattern_name.replace(/_/g, " ")}</span></span><span className="font-mono text-sm font-semibold text-amber-300">{pattern.match_confidence == null ? "Unavailable" : `${(pattern.match_confidence * 100).toFixed(1)}%`}</span></summary><ul className="mt-3 space-y-1 border-t border-slate-800 pt-3 text-xs text-slate-400">{pattern.matching_features.map((feature) => <li key={feature}>• {feature}</li>)}</ul></details>)}<p className="vajra-body-small text-slate-500">Investigative intelligence only. Does not alter SOP action tiers.</p></div>}
        </section>
        <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-4"><h3 className="vajra-section-title flex items-center gap-2 uppercase tracking-wider"><Building2 className="h-4 w-4 text-pink-300" />Predicted Physical Cash-Out Terminals</h3>
          {terminalState === "loading" && <div className="space-y-2">{[0, 1, 2].map((rank) => <Skeleton key={rank} className="h-14 w-full" />)}</div>}
          {terminalState === "idle" && <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950/50 p-4 text-sm text-slate-500">Select an account to begin.</div>}
          {terminalState === "error" && <RetryPanel message={terminalsQuery.data?.reason || "Physical cash-out prediction is currently unavailable."} onRetry={() => void terminalsQuery.refetch()} />}
          {terminalState === "empty" && <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">No predicted terminals are available.</div>}
          {terminalState === "success" && <ol className="divide-y divide-slate-800 rounded-lg border border-slate-800 bg-slate-950">{terminals.slice(0, 3).map((candidate) => <li key={candidate.node_id} className="flex flex-wrap items-center justify-between gap-3 p-3"><div className="flex items-center gap-3"><span className="grid h-7 w-7 place-items-center rounded-full border border-pink-800/70 font-mono text-xs text-pink-300">#{candidate.rank}</span><div><div className="font-mono text-sm font-semibold text-slate-100">{candidate.node_id}</div><div className="text-xs text-slate-400">{candidate.distance_from_corridor_km == null ? "Distance unavailable" : `${candidate.distance_from_corridor_km.toFixed(1)} km from corridor`}</div></div></div><div className="flex items-center gap-3"><div className="font-mono text-sm font-semibold text-pink-300">{candidate.confidence_pct == null ? "Unavailable" : `${candidate.confidence_pct.toFixed(1)}%`}</div><Link to="/heatmap" search={{ nodeId: candidate.node_id, caseId: trace?.case_id || search.caseId }} className="rounded border border-pink-800/70 px-2 py-1 text-xs text-pink-200 hover:bg-pink-950/50">Open Map</Link></div></li>)}</ol>}
        </section>
      </div>
      {selectedTransaction && <aside className="rounded-xl border border-cyan-800/70 bg-slate-900 p-4"><div className="flex items-center justify-between"><h2 className="vajra-section-title">Transaction Detail</h2><button onClick={() => setSelectedTransaction(null)} className="text-sm text-slate-300">Close</button></div><div className="mt-3 grid gap-2 text-sm sm:grid-cols-2"><div>From: {selectedTransaction.from_account || "Unavailable"}</div><div>To: {selectedTransaction.to_account || "Unavailable"}</div><div>Amount: {money(selectedTransaction.amount)}</div><div>Transaction: {selectedTransaction.transaction_id || "Unavailable"}</div></div></aside>}
    </div>
  );
}
