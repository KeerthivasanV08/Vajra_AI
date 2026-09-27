import React, { useState } from 'react';
import { Search, Radio, Wifi, WifiOff, Bell, User, Smartphone, ShieldCheck } from 'lucide-react';
import { useStore } from '@/store/realtime';
import { Link, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

export function Header() {
  const connected = useStore((s) => s.connected);
  const connectionStatus = useStore((s) => s.connectionStatus);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.trim().toUpperCase();
    if (query.startsWith('CASE-') || query.startsWith('CASE_')) {
      navigate({ to: '/mule-ring-investigator', search: { caseId: query, accountId: undefined, alertId: undefined } });
      toast.info(`Opening case investigation ${query}`);
    } else if (query.startsWith('ALERT-') || query.startsWith('ALERT_')) {
      navigate({ to: '/mule-ring-investigator', search: { alertId: query, accountId: undefined, caseId: undefined } });
      toast.info(`Opening alert investigation ${query}`);
    } else if (query.startsWith('ACC') || /^U\d+$/.test(query) || /^M-\d+$/.test(query)) {
      navigate({ to: '/mule-ring-investigator', search: { accountId: query, caseId: undefined, alertId: undefined } });
      toast.info(`Opening account investigation ${query}`);
    } else if (query.startsWith('CASE')) {
      navigate({ to: '/cases' });
      toast.info(`Searching case ${query}`);
    } else if (query.startsWith('NODE')) {
      navigate({ to: '/node-management' });
      toast.info(`Searching node ${query}`);
    } else {
      navigate({ to: '/alerts' });
      toast.info(`Global search for "${query}"`);
    }
  };

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950 px-4 flex items-center justify-between gap-4 shrink-0 select-none text-slate-200">
      {/* Global Search Bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Account, Case ID, Node ID, Alert, or SHA-256 Hash..."
          className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-slate-700 font-sans"
        />
      </form>

      {/* Connection Indicator & Controls */}
      <div className="flex items-center gap-3">
        {/* SSE Stream Status Badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full vajra-status font-mono border ${
            connected
              ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800/80'
              : 'bg-rose-950/80 text-rose-300 border-rose-800/80 animate-pulse'
          }`}
        >
          {connected ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>LIVE FEED CONNECTED</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>LIVE FEED DISCONNECTED ({connectionStatus})</span>
            </>
          )}
        </div>

        {/* Field Mode Shortcut */}
        <Link
          to="/field"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-sm font-mono text-slate-200 hover:text-white hover:border-slate-700 transition-colors"
          title="Switch to Mobile Beat Officer Field Mode"
        >
          <Smartphone className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden sm:inline">FIELD MODE</span>
        </Link>

        {/* Officer Context */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-rose-400">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden md:block leading-tight text-right">
            <div className="text-xs font-semibold text-slate-200 font-sans">Officer Keerthivasan</div>
            <div className="vajra-micro font-mono text-slate-300 flex items-center justify-end gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>LEA_OFFICER_001</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
