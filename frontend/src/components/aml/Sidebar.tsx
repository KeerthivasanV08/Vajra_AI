import React from 'react';
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity, AlertTriangle, FileText, Network, Settings, ShieldAlert,
  Users, Briefcase, UserCog, Radar, Map, Layers, Cpu, Gavel, FileCheck,
  Scale, Smartphone, Zap, GitBranch, Building2
} from "lucide-react";
import { useStore } from "@/store/realtime";

interface NavSection {
  title: string;
  items: Array<{
    to: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    exact?: boolean;
    badge?: string;
  }>;
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "COMMAND",
    items: [
      { to: "/", label: "Dashboard", icon: Radar, exact: true },
      { to: "/heatmap", label: "Operations Map", icon: Map },
    ],
  },
  {
    title: "MONITORING",
    items: [
      { to: "/transaction-flow", label: "Transaction Monitor", icon: Activity },
      { to: "/alerts", label: "Alert Center", icon: AlertTriangle, badge: "p1" },
    ],
  },
  {
    title: "INVESTIGATION",
    items: [
      { to: "/mule-ring-investigator", label: "Mule Ring Investigator", icon: GitBranch },
      { to: "/graph", label: "Graph Explorer", icon: Network },
      { to: "/cases", label: "Cases", icon: Briefcase },
      { to: "/accounts", label: "Account 360", icon: Users },
    ],
  },
  {
    title: "PHYSICAL INTELLIGENCE",
    items: [
      { to: "/node-management", label: "Node Management", icon: Building2 },
      { to: "/corridors", label: "High-Risk Corridors", icon: Layers },
    ],
  },
  {
    title: "RESPONSE",
    items: [
      { to: "/sop-triage", label: "SOP Triage", icon: Cpu },
      { to: "/officer-review", label: "Officer Review", icon: UserCog },
      { to: "/field", label: "Beat Officer Mode", icon: Smartphone },
    ],
  },
  {
    title: "COMPLIANCE",
    items: [
      { to: "/legal-dossier-vault", label: "Legal Dossier Vault", icon: Gavel },
      { to: "/audit-compliance-ledger", label: "Audit Ledger", icon: FileCheck },
      { to: "/fairness-audit", label: "Fairness Audit", icon: Scale },
    ],
  },
  {
    title: "ANALYTICS & SYSTEM",
    items: [
      { to: "/reports", label: "Reports", icon: FileText },
      { to: "/model-performance", label: "Model Performance", icon: Cpu },
      { to: "/simulation", label: "Live Simulation", icon: Zap },
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const p1 = useStore((s) => s.metrics.p1);

  return (
    <aside
      aria-label="Sidebar Navigation"
      className="w-72 shrink-0 border-r border-slate-800 bg-slate-950 text-slate-200 flex flex-col h-screen select-none shadow-xl"
    >
      {/* Branding */}
      <div className="h-14 px-4 flex items-center gap-3 border-b border-slate-800 bg-slate-900/60 shrink-0">
        <div className="relative">
          <ShieldAlert className="h-6 w-6 text-rose-500" />
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-bold tracking-wider font-mono text-white flex items-center gap-1.5">
            <span>VAJRA</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 font-sans font-bold">
              AI
            </span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-slate-400 font-mono font-medium">
            Predictive Interception
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav
        aria-label="Main Operations Navigation"
        className="flex-1 overflow-y-auto py-3.5 px-3 space-y-4 scrollbar-thin"
      >
        {NAV_SECTIONS.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-3 pt-2 pb-1 text-[11px] uppercase tracking-[0.14em] font-mono text-slate-400 font-bold">
              {section.title}
            </div>
            {section.items.map((item) => {
              const active = item.exact
                ? path === item.to
                : path === item.to || path.startsWith(item.to + "/");
              const Icon = item.icon;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] min-h-[38px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500 ${
                    active
                      ? "bg-slate-800/90 text-white font-semibold shadow-sm border border-slate-700/80"
                      : "text-slate-300 font-medium hover:bg-slate-900/80 hover:text-white"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-rose-500 rounded-r shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                  )}
                  <Icon
                    className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                      active ? "text-rose-400" : "text-slate-400 group-hover:text-slate-200"
                    }`}
                  />
                  <span className="flex-1 truncate tracking-normal">{item.label}</span>
                  {item.badge === "p1" && p1 > 0 && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 font-bold shadow-sm">
                      {p1}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 px-4 py-3 text-[11px] font-mono text-slate-400 bg-slate-900/40 flex items-center justify-between shrink-0">
        <span className="font-medium text-slate-400">VAJRA v2.4-PROD</span>
        <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          ACTIVE
        </span>
      </div>
    </aside>
  );
}
