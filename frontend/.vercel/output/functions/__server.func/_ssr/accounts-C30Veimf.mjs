import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { P as Panel } from "./Panel-CZ70JnZT.mjs";
import { R as RiskScoreBadge } from "./Badges-CsqHi44P.mjs";
import { a as useAccountList, u as useAccount } from "./useAccounts-C9su_RZA.mjs";
import "../_libs/sonner.mjs";
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
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tanstack__query-core.mjs";
import "./router-DXMls9-H.mjs";
import "../_libs/lucide-react.mjs";
function AccountsPage() {
  const [q, setQ] = reactExports.useState("");
  const [tier, setTier] = reactExports.useState("ALL");
  const [selectedAccountId, setSelectedAccountId] = reactExports.useState(null);
  const listQuery = useAccountList({
    limit: 50,
    search: q || void 0,
    risk: tier === "ALL" ? void 0 : tier,
    offset: 0
  });
  const selectedQuery = useAccount(selectedAccountId ?? void 0);
  const accounts = listQuery.data?.results ?? [];
  const selected = selectedQuery.data;
  const selectedAccount = selected ?? accounts.find((a) => a.id === selectedAccountId);
  const isLoading = listQuery.isLoading;
  const isError = listQuery.isError;
  const placeholderAccounts = Array.from({
    length: 10
  }, (_, idx) => ({
    id: `loading-${idx}`,
    name: "Loading…",
    country: "",
    riskScore: 0,
    sanctionsHit: false,
    pep: false,
    riskTier: ""
  }));
  const list = isLoading ? placeholderAccounts : accounts;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-3 h-[calc(100vh-120px)] min-h-0 flex flex-col overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-semibold tracking-tight", children: "Account 360 Intelligence" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Unified KYC · device · graph · transaction surface" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1.5", children: ["ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTier(t), className: `h-7 px-2.5 mono text-[10px] rounded border ${tier === t ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card/60"}`, children: t }, t)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-12 gap-3 flex-1 min-h-0 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Account Directory", className: "col-span-4 min-h-0 h-full", dense: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full min-h-0 flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 border-b border-border shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Search account…", className: "w-full h-8 px-3 rounded-md bg-input/60 border border-border text-xs focus:outline-none focus:border-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-2 border-b border-border text-[11px] uppercase tracking-[0.18em] text-muted-foreground", children: isLoading ? "Loading accounts…" : isError ? "Failed to load accounts" : `${accounts.length} accounts` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "min-h-0 flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin divide-y divide-border/50", children: list.slice(0, 60).map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { onClick: () => setSelectedAccountId(a.id), className: `p-2.5 cursor-pointer hover:bg-accent/30 ${selected?.id === a.id ? "bg-accent/40" : ""}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium whitespace-normal break-words leading-relaxed", children: a.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mono text-[10px] text-muted-foreground whitespace-normal break-words", children: [
                a.id,
                " · ",
                a.country
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RiskScoreBadge, { score: a.riskScore ?? 0 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex gap-1", children: [
            a.sanctionsHit && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] mono px-1 py-0.5 rounded bg-critical/10 text-critical border border-critical/40", children: "SANCTIONS" }),
            a.pep && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] mono px-1 py-0.5 rounded bg-warning/10 text-warning border border-warning/40", children: "PEP" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] mono px-1 py-0.5 rounded bg-muted text-muted-foreground border border-border", children: a.riskTier })
          ] })
        ] }, a.id)) })
      ] }) }),
      selectedAccount && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-8 min-h-0 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full min-h-0 overflow-y-auto overflow-x-hidden pr-1 scrollbar-thin", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 min-h-0 pb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "col-span-2 rounded-lg border border-border bg-card/60 overflow-hidden flex flex-col", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-2 border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-[0.18em] font-medium whitespace-normal break-words leading-relaxed text-warning", children: "Profile Summary" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 space-y-4 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-semibold whitespace-normal break-words leading-relaxed", children: selectedAccount.name ?? selectedAccount.id }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mono text-[10px] text-muted-foreground uppercase tracking-[0.18em] whitespace-normal break-words", children: selectedAccount.id })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(RiskScoreBadge, { score: selectedAccount.riskScore ?? 0 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border", children: safeValue(selectedAccount.risk_level ?? selectedAccount.riskTier) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/mule-ring-investigator", search: {
                  accountId: selectedAccount.id,
                  caseId: void 0,
                  alertId: void 0
                }, className: "rounded-md border border-rose-800/70 bg-rose-950/30 px-3 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-950/60", children: "Investigate Mule Ring" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "KYC Status", value: selectedAccount.kyc_status }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "KYC City", value: selectedAccount.kyc_city }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "Created At", value: formatDate(selectedAccount.created_at ?? selectedAccount.createdAt) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "Risk Score", value: formatScore(deriveOnboardingRisk(selectedAccount)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "Risk Level", value: safeValue(selectedAccount.risk_level ?? selectedAccount.riskTier) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "Decision", value: selectedAccount.decision }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "Confidence", value: formatScore(selectedAccount.confidence) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-lg border border-border bg-card/60 overflow-hidden flex flex-col min-h-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-2 border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-[0.18em] font-medium whitespace-normal break-words leading-relaxed text-warning", children: "Device Intelligence" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 grid grid-cols-1 gap-3 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "Device ID", value: selectedAccount.device_id }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "Device Model", value: selectedAccount.device_model_name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "Device Year", value: selectedAccount.device_year }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "Device Age Years", value: selectedAccount.device_age_years }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "Device Age Days", value: selectedAccount.device_age_days }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "Device Trust Score", value: formatScore(selectedAccount.device_trust_score) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "Device Shared Count", value: selectedAccount.device_shared_count }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "Root Status", value: formatBoolean(selectedAccount.root_status) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "Emulator Flag", value: formatBoolean(selectedAccount.emulator_flag) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "App Cloner Flag", value: formatBoolean(selectedAccount.app_cloner_flag) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "Biometric Enabled", value: formatBoolean(selectedAccount.biometric_enabled) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-lg border border-border bg-card/60 overflow-hidden flex flex-col min-h-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-2 border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-[0.18em] font-medium whitespace-normal break-words leading-relaxed text-warning", children: "SIM Intelligence" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 grid grid-cols-1 gap-3 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "Registered IMSI", value: selectedAccount.registered_imsi }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "Current IMSI", value: selectedAccount.current_imsi }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "SIM Present", value: formatBoolean(selectedAccount.sim_present) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "SIM Slot Count", value: selectedAccount.sim_slot_count }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "SIM Binding OK", value: formatBoolean(selectedAccount.sim_binding_ok) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "SIM Swap Flag", value: formatBoolean(selectedAccount.sim_swap_flag) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "SIM Age Days", value: selectedAccount.sim_age_days }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "Multi SIM Flag", value: formatBoolean(selectedAccount.multi_sim_flag) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-lg border border-border bg-card/60 overflow-hidden flex flex-col min-h-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-2 border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-[0.18em] font-medium whitespace-normal break-words leading-relaxed text-warning", children: "Network / IP Intelligence" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 grid grid-cols-1 gap-3 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "IP Address", value: selectedAccount.ip_address }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "ISP Name", value: selectedAccount.isp_name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "VPN Detected", value: formatBoolean(selectedAccount.vpn_detected) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "VPN Flag", value: formatBoolean(selectedAccount.vpn_flag) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "IP Risk Score", value: formatScore(selectedAccount.ip_risk_score) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-lg border border-border bg-card/60 overflow-hidden flex flex-col min-h-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-2 border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-[0.18em] font-medium whitespace-normal break-words leading-relaxed text-warning", children: "KYC / Identity Intelligence" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 grid grid-cols-1 gap-3 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "Identity Trust Score", value: formatScore(selectedAccount.identity_trust_score) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "Face Match Score", value: formatScore(selectedAccount.face_match_score) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "Sanction Hit", value: formatBoolean(selectedAccount.sanction_hit) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "PEP Hit", value: formatBoolean(selectedAccount.pep_hit) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "Requires Review", value: formatBoolean(selectedAccount.requires_review) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "Requires Block", value: formatBoolean(selectedAccount.requires_block) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "Requires EDD", value: formatBoolean(selectedAccount.requires_edd) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "Officer Recommendation", value: selectedAccount.officer_recommendation })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-lg border border-border bg-card/60 overflow-hidden flex flex-col min-h-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-2 border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-[0.18em] font-medium whitespace-normal break-words leading-relaxed text-warning", children: "Behavioral Onboarding Signals" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 grid grid-cols-1 gap-3 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "Typing Speed", value: formatScore(selectedAccount.typing_speed) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "Form Completion Time", value: formatScore(selectedAccount.form_completion_time) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "Onboarding Speed MS", value: selectedAccount.onboarding_speed_ms }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "Copy Paste Ratio", value: formatScore(selectedAccount.copy_paste_ratio) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatRow, { label: "OTP Retry Count", value: selectedAccount.otp_retry_count })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "col-span-2 rounded-lg border border-border bg-card/60 overflow-hidden flex flex-col min-h-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-2 border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-[0.18em] font-medium whitespace-normal break-words leading-relaxed text-warning", children: "Onboarding Explainability" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 text-xs space-y-2 break-words leading-relaxed", children: [
            buildExplainability(selectedAccount).map((reason, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border/50 bg-card/80 p-2 break-words", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-[10px] uppercase tracking-[0.18em] text-muted-foreground", children: "Signal" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 whitespace-normal break-words leading-relaxed", children: reason })
            ] }, index)),
            buildExplainability(selectedAccount).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-border/50 bg-card/80 p-3 text-muted-foreground", children: "No major onboarding risk indicators detected." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "col-span-2 rounded-lg border border-border bg-card/60 overflow-hidden flex flex-col min-h-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-2 border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-[0.18em] font-medium whitespace-normal break-words text-warning", children: "Suspicious Relationships" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 text-xs min-h-0", children: Array.isArray(selectedAccount.suspicious_relationships) && selectedAccount.suspicious_relationships.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: selectedAccount.suspicious_relationships.map((relationship, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "rounded-md border border-border/50 bg-card/80 p-2 break-words", children: renderRelationship(relationship) }, idx)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-border/50 bg-card/80 p-3 text-muted-foreground", children: "No suspicious account relationships available from account CSV data." }) })
        ] })
      ] }) }) })
    ] })
  ] });
}
function safeValue(value) {
  if (value === null || value === void 0) return "N/A";
  if (typeof value === "number") return Number.isFinite(value) ? value.toString() : "N/A";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed.toLowerCase() === "nan") return "N/A";
    return trimmed;
  }
  return String(value);
}
function formatBoolean(value) {
  if (value === null || value === void 0) return "N/A";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return value === 1 ? "Yes" : value === 0 ? "No" : "N/A";
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") return "Yes";
    if (normalized === "false" || normalized === "0") return "No";
  }
  return "N/A";
}
function formatScore(value) {
  if (value === null || value === void 0) return "N/A";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "N/A";
    return Math.round(value).toString();
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return "N/A";
    return Math.round(parsed).toString();
  }
  return "N/A";
}
function formatDate(value) {
  if (value === null || value === void 0) return "N/A";
  if (typeof value === "number") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString();
  }
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (Number.isNaN(parsed)) return "N/A";
    return new Date(parsed).toLocaleDateString();
  }
  return "N/A";
}
function deriveOnboardingRisk(account) {
  if (account.onboarding_risk_score != null && Number.isFinite(account.onboarding_risk_score)) {
    return account.onboarding_risk_score;
  }
  if (account.final_risk_score != null && Number.isFinite(account.final_risk_score)) {
    return account.final_risk_score;
  }
  if (account.identity_trust_score != null && Number.isFinite(account.identity_trust_score)) {
    return Math.round(Math.max(0, Math.min(100, 100 - account.identity_trust_score)));
  }
  return void 0;
}
function buildExplainability(account) {
  const reasons = [];
  if (account.sanction_hit === 1) reasons.push("Sanction screening hit detected");
  if (account.pep_hit === 1) reasons.push("PEP escalation required");
  if (account.device_shared_count != null && account.device_shared_count > 3) reasons.push("Device reused across multiple onboarding accounts");
  if (account.sim_swap_flag === 1 || account.sim_swap_flag === true) reasons.push("SIM swap risk detected");
  if (account.sim_binding_ok === 0 || account.sim_binding_ok === false) reasons.push("SIM binding mismatch detected");
  if (account.vpn_flag === 1 || account.vpn_flag === true || account.vpn_detected === true) reasons.push("VPN detected during onboarding");
  if (account.face_match_score != null && Number.isFinite(account.face_match_score) && account.face_match_score < 0.8) reasons.push("Low face match score detected during onboarding");
  if (account.otp_retry_count != null && account.otp_retry_count >= 3) reasons.push("Multiple OTP retries observed");
  if (account.emulator_flag === 1 || account.emulator_flag === true) reasons.push("Emulator environment detected");
  if (account.root_status === 1 || account.root_status === true) reasons.push("Rooted device detected");
  if (account.app_cloner_flag === 1 || account.app_cloner_flag === true) reasons.push("App cloner detected");
  if (account.ip_risk_score != null && Number.isFinite(account.ip_risk_score) && account.ip_risk_score > 60) reasons.push("High-risk IP reputation");
  if (account.multi_sim_flag === 1 || account.multi_sim_flag === true) reasons.push("Multiple SIM usage detected");
  return reasons;
}
function renderRelationship(item) {
  if (item == null) return "Unknown relationship";
  if (typeof item === "string") return item;
  if (typeof item === "object") {
    const obj = item;
    if (obj.user_id) return String(obj.user_id);
    if (obj.id) return String(obj.id);
    if (obj.name) return String(obj.name);
    return JSON.stringify(obj);
  }
  return String(item);
}
function StatRow({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border/50 bg-card/80 p-2 min-w-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-[0.18em] text-muted-foreground whitespace-normal break-words leading-relaxed", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 mono text-sm whitespace-normal break-words leading-relaxed", children: safeValue(value) })
  ] });
}
export {
  AccountsPage as component
};
