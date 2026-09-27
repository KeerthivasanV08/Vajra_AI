import { createFileRoute } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Info, RefreshCw, Scale, Search, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { fetchFairnessRegionDetail, fetchFairnessRegions, recalculateFairnessRegions } from '@/services/api';
import type { FairnessRegion, FairnessRegionDetail } from '@/types/vajra';

export const Route = createFileRoute('/fairness-audit')({ component: FairnessAuditPage });

const MIN_SAMPLE_SIZE = 10;
type SortKey = keyof Pick<FairnessRegion, 'region_name' | 'number_of_predictions' | 'predicted_high_risk_pct' | 'confirmed_fraud_pct' | 'disparate_impact_ratio' | 'governance_flag'>;

function percentage(value: number | null, sampleSize: number) {
  return value === null || sampleSize < MIN_SAMPLE_SIZE ? 'Insufficient data' : `${value.toFixed(1)}%`;
}

function flagStyle(flag: FairnessRegion['governance_flag']) {
  if (flag === 'FLAGGED') return 'border-rose-800 bg-rose-950/70 text-rose-300';
  if (flag === 'REVIEW') return 'border-amber-800 bg-amber-950/70 text-amber-300';
  if (flag === 'OK') return 'border-emerald-800 bg-emerald-950/70 text-emerald-300';
  return 'border-slate-700 bg-slate-800 text-slate-500';
}

function FairnessAuditPage() {
  const [rows, setRows] = useState<FairnessRegion[]>([]);
  const [selected, setSelected] = useState<FairnessRegionDetail | null>(null);
  const [search, setSearch] = useState('');
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [ascending, setAscending] = useState(true);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  const loadRows = async () => {
    setLoading(true);
    try { setRows((await fetchFairnessRegions()).results); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Failed to load fairness regions.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void loadRows(); }, []);

  const openDetail = async (row: FairnessRegion) => {
    try { setSelected(await fetchFairnessRegionDetail(row.region_id)); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Failed to load region detail.'); }
  };

  const setSorting = (key: SortKey) => {
    if (sortKey === key) setAscending((value) => !value);
    else { setSortKey(key); setAscending(true); }
  };

  const visibleRows = rows
    .filter((row) => !flaggedOnly || row.governance_flag === 'FLAGGED' || row.governance_flag === 'REVIEW')
    .filter((row) => `${row.region_name} ${row.state}`.toLowerCase().includes(search.toLowerCase()))
    .sort((left, right) => {
      if (!sortKey) {
        const rank = { FLAGGED: 0, REVIEW: 1, 'N/A': 2, OK: 3 };
        return rank[left.governance_flag] - rank[right.governance_flag];
      }
      const comparison = String(left[sortKey] ?? '').localeCompare(String(right[sortKey] ?? ''), undefined, { numeric: true });
      return ascending ? comparison : -comparison;
    });

  const sufficientRows = rows.filter((row) => row.number_of_predictions >= MIN_SAMPLE_SIZE && row.disparate_impact_ratio !== null);
  const flaggedCount = rows.filter((row) => row.governance_flag === 'FLAGGED' || row.governance_flag === 'REVIEW').length;
  const averageDir = sufficientRows.length ? sufficientRows.reduce((sum, row) => sum + (row.disparate_impact_ratio ?? 0), 0) / sufficientRows.length : null;
  const insufficientCount = rows.filter((row) => row.number_of_predictions < MIN_SAMPLE_SIZE).length;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-slate-950 p-4 text-slate-200">
      <div className="mb-4 flex items-start justify-between rounded-xl border border-slate-800 bg-slate-900 p-4"><div className="flex items-start gap-3"><Scale className="mt-0.5 h-6 w-6 text-cyan-400" /><div><h1 className="font-mono text-sm font-bold tracking-wider text-white">FAIRNESS AUDIT &amp; GOVERNANCE CONSOLE</h1><p className="mt-1 text-xs text-slate-400">Regional disparate impact review. Non-scoring governance layer.</p><p className="mt-2 max-w-3xl text-[11px] leading-relaxed text-slate-500"><Info className="mr-1 inline h-3.5 w-3.5 text-cyan-400" />DIR compares each region&apos;s predicted high-risk rate with the overall predicted high-risk baseline. Values outside 0.80 to 1.25 require governance review.</p></div></div><button onClick={async () => { setRecalculating(true); try { const result = await recalculateFairnessRegions(); setRows(result.results); toast.success('Fairness snapshot recalculated.'); } catch (error) { toast.error(error instanceof Error ? error.message : 'Recalculation failed.'); } finally { setRecalculating(false); } }} className="inline-flex items-center gap-2 rounded-md border border-cyan-800 bg-cyan-950/60 px-3 py-2 text-xs font-semibold text-cyan-300"><RefreshCw className={`h-3.5 w-3.5 ${recalculating ? 'animate-spin' : ''}`} /> Recalculate</button></div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">{[['Regions Analyzed', rows.length.toString(), 'text-white'], ['Regions Flagged', flaggedCount.toString(), flaggedCount ? 'text-amber-300' : 'text-emerald-300'], ['Average DIR', averageDir === null ? 'Insufficient data' : averageDir.toFixed(2), 'text-cyan-300'], ['Insufficient Data', insufficientCount.toString(), insufficientCount ? 'text-slate-300' : 'text-emerald-300']].map(([label, value, color]) => <div key={label} className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-3"><div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div><div className={`mt-1 font-mono text-3xl font-bold leading-none ${color}`}>{value}</div></div>)}</div>

      <div className="flex min-h-0 flex-1 gap-4"><section className="min-w-0 flex-1 rounded-xl border border-slate-800 bg-slate-900 p-4"><div className="mb-3 flex flex-wrap items-center justify-between gap-3"><h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-400">Regional Statistics</h2><div className="flex items-center gap-3"><label className="relative"><Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search state or region" className="w-48 rounded-md border border-slate-700 bg-slate-950 py-1.5 pl-8 pr-2 text-xs text-slate-200 outline-none" /></label><label className="flex items-center gap-2 text-xs text-slate-400"><input type="checkbox" checked={flaggedOnly} onChange={(event) => setFlaggedOnly(event.target.checked)} /> Flagged only</label></div></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[50rem] text-left text-sm"><thead><tr className="border-b border-slate-800 text-[13px] font-semibold uppercase tracking-wider text-slate-300">{([['region_name', 'Regional Group'], ['number_of_predictions', 'Predictions'], ['predicted_high_risk_pct', 'Predicted High Risk'], ['confirmed_fraud_pct', 'Confirmed Fraud'], ['disparate_impact_ratio', 'DIR'], ['governance_flag', 'Governance Flag']] as [SortKey, string][]).map(([key, label]) => <th key={key} className="whitespace-nowrap px-3 py-3"><button onClick={() => setSorting(key)} className="inline-flex items-center gap-1">{label}{sortKey === key && (ascending ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />)}</button></th>)}</tr></thead><tbody className="divide-y divide-slate-800/70">{loading ? <tr><td colSpan={6} className="p-8 text-center text-slate-400">Loading fairness snapshot...</td></tr> : visibleRows.map((row) => { const primary = row.region_name || row.state || 'Unknown region'; const subtitle = row.state && row.state !== primary ? row.state : null; return <tr key={row.region_id} onClick={() => void openDetail(row)} className="h-12 cursor-pointer hover:bg-slate-950/70"><td className="px-3 py-3"><div className="text-[15px] font-semibold text-slate-100">{primary}</div>{subtitle && <div className="mt-0.5 text-sm text-slate-400">{subtitle}</div>}</td><td className="px-3 py-3 font-mono text-sm text-slate-200">{row.number_of_predictions.toLocaleString()}</td><td className={`px-3 py-3 font-mono text-sm ${row.number_of_predictions < MIN_SAMPLE_SIZE ? 'text-slate-400' : 'text-slate-200'}`}>{percentage(row.predicted_high_risk_pct, row.number_of_predictions)}</td><td className={`px-3 py-3 font-mono text-sm ${row.number_of_true_cases < MIN_SAMPLE_SIZE ? 'text-slate-400' : 'text-slate-200'}`}>{percentage(row.confirmed_fraud_pct, row.number_of_true_cases)}</td><td className="px-3 py-3 font-mono text-[15px] font-bold text-cyan-300">{row.disparate_impact_ratio === null || row.number_of_predictions < MIN_SAMPLE_SIZE ? 'Insufficient data' : row.disparate_impact_ratio.toFixed(2)}</td><td className="px-3 py-3"><span className={`inline-flex rounded border px-2.5 py-1.5 font-mono text-xs font-semibold ${flagStyle(row.number_of_predictions < MIN_SAMPLE_SIZE ? 'N/A' : row.governance_flag)}`}>{row.number_of_predictions < MIN_SAMPLE_SIZE ? 'N/A' : row.governance_flag}</span></td></tr>; })}</tbody></table></div>
      </section>

      <aside className="hidden w-80 shrink-0 rounded-xl border border-slate-800 bg-slate-900 p-4 xl:block">{selected ? <><div className="mb-4 flex items-start justify-between"><div><div className="text-[10px] uppercase tracking-wider text-slate-500">Selected region</div><h3 className="mt-1 text-lg font-semibold text-white">{selected.region_name}</h3><div className="text-xs text-slate-500">{selected.state}</div></div><ShieldAlert className="h-5 w-5 text-cyan-400" /></div><div className="grid grid-cols-2 gap-2">{[['Predictions', selected.number_of_predictions], ['True cases', selected.number_of_true_cases], ['False positives', selected.number_of_false_positives], ['False negatives', selected.number_of_false_negatives]].map(([label, value]) => <div key={label} className="rounded border border-slate-800 bg-slate-950 p-2"><div className="text-[10px] text-slate-500">{label}</div><div className="mt-1 font-mono text-sm text-slate-200">{Number(value).toLocaleString()}</div></div>)}</div><div className="mt-5 border-t border-slate-800 pt-4"><div className="text-[10px] uppercase tracking-wider text-slate-500">Transparent calculation</div><p className="mt-2 text-[11px] leading-relaxed text-slate-400">DIR = (predicted high-risk rate in this region) / (predicted high-risk rate baseline)</p><p className="mt-2 font-mono text-xs text-cyan-300">{selected.predicted_high_risk_pct === null || selected.disparate_impact_ratio === null ? 'Insufficient data for DIR' : `${(selected.predicted_high_risk_pct / 100).toFixed(4)} / ${(selected.predicted_high_risk_pct / 100 / selected.disparate_impact_ratio).toFixed(4)} = ${selected.disparate_impact_ratio.toFixed(2)}`}</p></div><div className="mt-5 border-t border-slate-800 pt-4"><div className="text-[10px] uppercase tracking-wider text-slate-500">DIR trend, 30 days</div>{selected.dir_trend_30d.length ? <svg viewBox="0 0 240 48" className="mt-3 h-12 w-full" role="img" aria-label="DIR trend"><polyline fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400" points={selected.dir_trend_30d.map((point, index) => `${(index / Math.max(selected.dir_trend_30d.length - 1, 1)) * 240},${48 - ((point.dir ?? 0) / 2) * 48}`).join(' ')} /></svg> : <p className="mt-2 text-xs text-slate-500">No historical snapshots available.</p>}</div></> : <div className="flex h-full min-h-48 items-center justify-center text-center text-xs text-slate-500">Select a region to inspect its raw counts and DIR calculation.</div>}</aside>
      </div>
    </div>
  );
}
