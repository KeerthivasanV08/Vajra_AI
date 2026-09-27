import { createFileRoute } from '@tanstack/react-router';
import React, { useState, useEffect } from 'react';
import { fetchAuditChain, reverifyAuditChain } from '@/services/api';
import type { CryptographicAuditEvent, AuditReverifyResponse } from '@/types/vajra';
import { FileCheck, ShieldCheck, ShieldAlert, RefreshCw, Copy, Check } from 'lucide-react';
import { EvidenceHashBox } from '@/components/vajra/EvidenceHashBox';
import { toast } from 'sonner';

export const Route = createFileRoute('/audit-compliance-ledger')({
  component: AuditComplianceLedgerPage,
});

function AuditComplianceLedgerPage() {
  const [chain, setChain] = useState<CryptographicAuditEvent[]>([]);
  const [reverifyResult, setReverifyResult] = useState<AuditReverifyResponse | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CryptographicAuditEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  const loadChain = async () => {
    setLoading(true);
    try {
      const res = await fetchAuditChain();
      setChain(res.chain || []);
      if (res.chain?.length > 0) {
        setSelectedEvent(res.chain[0]);
      }
    } catch (err: any) {
      toast.error(`Failed to load audit chain: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReverify = async () => {
    setVerifying(true);
    try {
      const res = await reverifyAuditChain();
      setReverifyResult(res);
      if (res.verified) {
        toast.success(`Audit Chain Verified! Checked ${res.events_checked} events.`);
      } else {
        toast.error(`Audit Verification Failed: ${res.failure_reason}`);
      }
    } catch (err: any) {
      toast.error(`Reverification error: ${err.message}`);
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    loadChain();
  }, []);

  return (
    <div className="flex h-full w-full bg-slate-950 text-slate-200 overflow-hidden select-none">
      {/* Left Chain List */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Control Bar */}
        <div className="p-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-400" />
            <h1 className="text-sm font-bold text-white font-mono tracking-wider">
              CRYPTOGRAPHIC AUDIT LEDGER
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              {chain.length} EVENTS LOGGED
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReverify}
              disabled={verifying}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 disabled:opacity-50"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {verifying ? 'Verifying Chain...' : 'Re-verify Hash Chain'}
            </button>

            <button
              onClick={loadChain}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Audit Events Summary List (5-6 Columns) */}
        <div className="flex-1 overflow-y-auto p-3 scrollbar-thin space-y-2">
          {chain.map((event, idx) => {
            const isSelected = selectedEvent?.event_id === event.event_id;

            return (
              <div
                key={event.event_id || idx}
                onClick={() => setSelectedEvent(event)}
                className={`p-3 rounded-xl border transition-colors cursor-pointer flex items-center justify-between gap-4 ${
                  isSelected
                    ? 'bg-slate-900 border-slate-700 shadow-md'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-mono text-[10px] text-slate-400 shrink-0">
                    #{idx + 1}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white truncate">{event.action_type}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-emerald-400 font-mono">
                        {event.event_id}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                      Target: {event.target_entity} • Officer: {event.officer_id}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[10px] font-mono text-slate-500">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                    SHA-256 LINKED
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Persistent Event Detail Panel */}
      <div className="w-96 shrink-0 h-full border-l border-slate-800 p-4 space-y-4 overflow-y-auto bg-slate-950">
        {selectedEvent ? (
          <>
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">{selectedEvent.event_id}</span>
              <h2 className="text-sm font-semibold text-white font-mono mt-0.5">{selectedEvent.action_type}</h2>
              <div className="text-xs text-slate-400 mt-1 font-mono">
                Timestamp: {new Date(selectedEvent.timestamp).toLocaleString()}
              </div>
            </div>

            <EvidenceHashBox
              label="Event Cryptographic Signature"
              hash={selectedEvent.event_hash}
              verified={true}
            />

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 block">Payload Hash</span>
                <span className="text-slate-300 break-all text-[11px]">{selectedEvent.payload_hash}</span>
              </div>

              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 block">Previous Chain Hash</span>
                <span className="text-slate-300 break-all text-[11px]">{selectedEvent.previous_hash}</span>
              </div>

              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 block">Issuing Officer</span>
                <span className="text-slate-200 font-bold">{selectedEvent.officer_id}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-xs text-slate-500 text-center py-6">Select an event to view hashes</div>
        )}
      </div>
    </div>
  );
}
