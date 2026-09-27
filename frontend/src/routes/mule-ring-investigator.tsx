import { createFileRoute } from '@tanstack/react-router';
import React, { useState, useEffect } from 'react';
import { matchSyndicate, predictCashout } from '@/services/api';
import type { SyndicateMatchResponse, WithdrawalNode } from '@/types/vajra';
import { GitBranch, User, ArrowRight, ShieldAlert, Tag, Building2 } from 'lucide-react';
import { PredictionCandidateList } from '@/components/vajra/PredictionCandidateList';
import { toast } from 'sonner';

export const Route = createFileRoute('/mule-ring-investigator')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      accountId: typeof search.accountId === 'string' ? search.accountId : undefined,
      caseId: typeof search.caseId === 'string' ? search.caseId : undefined,
    };
  },
  component: MuleRingInvestigatorPage,
});

function MuleRingInvestigatorPage() {
  const search = Route.useSearch();
  const [accountId, setAccountId] = useState(search.accountId || 'ACC_1001_MULE');
  const [syndicateData, setSyndicateData] = useState<SyndicateMatchResponse | null>(null);
  const [candidates, setCandidates] = useState<WithdrawalNode[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async (accId: string) => {
    setLoading(true);
    try {
      const [synRes, predRes] = await Promise.allSettled([
        matchSyndicate({ account_id: accId }),
        predictCashout({
          account_id: accId,
          geo_lat: 28.6139,
          geo_lon: 77.2090,
          digital_risk_score: 0.85,
          mule_probability: 0.78,
        }),
      ]);

      if (synRes.status === 'fulfilled') {
        setSyndicateData(synRes.value);
      } else {
        toast.error(`Syndicate lookup failed: ${synRes.reason?.message || 'Error'}`);
      }

      if (predRes.status === 'fulfilled') {
        const top = predRes.value.top_candidates || predRes.value.candidates || [];
        setCandidates(top);
      }
    } catch (err: any) {
      toast.error(`Investigation data fetch failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(accountId);
  }, [accountId]);

  const dummyChain = [
    { label: 'Victim Account', acc: 'ACC_VICTIM_999', bank: 'State Bank of India', amount: '₹2,50,000', hop: 'Origin' },
    { label: 'Layering Mule 1', acc: 'ACC_MULE_101', bank: 'HDFC Bank', amount: '₹2,10,000', hop: 'Hop 1 (2 mins)' },
    { label: 'Layering Mule 2', acc: 'ACC_MULE_102', bank: 'ICICI Bank', amount: '₹1,85,000', hop: 'Hop 2 (4 mins)' },
    { label: 'Terminal Mule Account', acc: accountId, bank: 'Fino Payments Bank', amount: '₹1,50,000', hop: 'Terminal Cash-Out Mule' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 p-4 space-y-4 overflow-y-auto select-none">
      {/* Header KPI Strip */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <GitBranch className="w-6 h-6 text-rose-500" />
          <div>
            <h1 className="text-sm font-bold text-white font-mono tracking-wider">
              MULE RING HOP-BY-HOP INVESTIGATOR
            </h1>
            <p className="text-xs text-slate-400">Multi-Hop Layering Flow & Syndicate Pattern Analytics</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-right">
            <span className="text-slate-500 block text-[10px]">Hops Traced</span>
            <span className="font-bold text-rose-400 text-sm">3 Hops</span>
          </div>
          <div className="text-right border-l border-slate-800 pl-4">
            <span className="text-slate-500 block text-[10px]">Fan-Out Factor</span>
            <span className="font-bold text-amber-400 text-sm">4.2x</span>
          </div>
          <div className="text-right border-l border-slate-800 pl-4">
            <span className="text-slate-500 block text-[10px]">Total Stolen</span>
            <span className="font-bold text-emerald-400 text-sm">₹2,50,000</span>
          </div>
        </div>
      </div>

      {/* Main Multi-Hop Stepper Canvas */}
      <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h2 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
          Multi-Hop Transaction Velocity Flow
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {dummyChain.map((node, idx) => (
            <React.Fragment key={idx}>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 relative group hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>{node.hop}</span>
                  <User className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div className="text-xs font-bold text-slate-200 font-mono">{node.acc}</div>
                <div className="text-[11px] text-slate-400 truncate">{node.bank}</div>
                <div className="text-xs font-bold text-emerald-400 font-mono pt-1 border-t border-slate-800">
                  {node.amount}
                </div>
              </div>

              {idx < dummyChain.length - 1 && (
                <div className="hidden md:flex justify-center text-slate-600">
                  <ArrowRight className="w-5 h-5 text-rose-500 animate-pulse" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Split Pane: Left Syndicate Fingerprint, Right Predicted Cash-Out Node */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        {/* Syndicate Fingerprints */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-purple-400" />
            Model 8 Syndicate Fingerprint Assessment
          </h3>

          {syndicateData ? (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-xs font-bold text-purple-300 font-mono">
                  {syndicateData.pattern_name || (syndicateData as any).matched_pattern_type || 'PATTERN MATCH'}
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {syndicateData.summary || (syndicateData as any).disclaimer || 'Syndicate pattern detected.'}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Investigative Tags:</span>
                <div className="flex flex-wrap gap-2">
                  {(syndicateData.matched_tags || []).map((tagObj, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-950/80 text-purple-300 border border-purple-800/80 text-xs font-mono"
                    >
                      <Tag className="w-3 h-3 text-purple-400" />
                      <span>{(tagObj.tag || String(tagObj)).replace(/_/g, ' ')}</span>
                      <span className="text-[9px] text-purple-400/80 font-sans ml-1">(investigative_only=true)</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-4">Loading syndicate fingerprint...</div>
          )}
        </div>

        {/* Predicted Cash-Out Node Candidates */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-emerald-400" />
            Predicted Physical Cash-Out Terminals
          </h3>

          <PredictionCandidateList
            candidates={candidates}
          />
        </div>
      </div>
    </div>
  );
}
