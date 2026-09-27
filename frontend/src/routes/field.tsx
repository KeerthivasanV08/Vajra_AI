import { createFileRoute } from '@tanstack/react-router';
import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock3, Navigation, Phone, Radio, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { fetchActiveFieldDispatch, submitFieldDispatchOutcome, updateFieldDispatchStatus } from '@/services/api';
import { OperationsMapCanvas } from '@/components/vajra/OperationsMapCanvas';
import type { FieldDispatch, FieldDispatchEvent, FieldStatus, WithdrawalNode } from '@/types/vajra';

export const Route = createFileRoute('/field')({ component: BeatOfficerFieldPage });

const steps = ['DISPATCHED', 'EN_ROUTE', 'ON_SITE', 'ACTION_TAKEN'] as const;
type Step = typeof steps[number];

function toCoordinate(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function BeatOfficerFieldPage() {
  const [dispatch, setDispatch] = useState<FieldDispatch | null>(null);
  const [events, setEvents] = useState<FieldDispatchEvent[]>([]);
  const [status, setStatus] = useState<Step>('DISPATCHED');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [seconds, setSeconds] = useState<number | null>(null);
  const [outcomeOpen, setOutcomeOpen] = useState(false);
  const [offline, setOffline] = useState(() => typeof navigator !== 'undefined' && !navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'ACTIVE' | 'UNAVAILABLE'>('UNAVAILABLE');
  const [officerPosition, setOfficerPosition] = useState<[number, number] | undefined>();

  const loadDispatch = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const result = await fetchActiveFieldDispatch();
      setDispatch(result.dispatch);
      setEvents(result.events ?? []);
      setStatus((result.dispatch?.field_status as Step | undefined) ?? 'DISPATCHED');
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadDispatch(); }, []);
  useEffect(() => {
    const online = () => setOffline(false);
    const offlineEvent = () => setOffline(true);
    window.addEventListener('online', online);
    window.addEventListener('offline', offlineEvent);
    return () => { window.removeEventListener('online', online); window.removeEventListener('offline', offlineEvent); };
  }, []);
  useEffect(() => {
    if (!navigator.geolocation) return undefined;
    const watch = navigator.geolocation.watchPosition(
      (position) => { setGpsStatus('ACTIVE'); setOfficerPosition([position.coords.latitude, position.coords.longitude]); },
      () => { setGpsStatus('UNAVAILABLE'); setOfficerPosition(undefined); },
      { enableHighAccuracy: true, maximumAge: 30_000, timeout: 10_000 },
    );
    return () => navigator.geolocation.clearWatch(watch);
  }, []);
  useEffect(() => {
    if (!dispatch?.deadline) { setSeconds(null); return undefined; }
    const tick = () => setSeconds(Math.max(0, Math.floor((new Date(dispatch.deadline as string).getTime() - Date.now()) / 1000)));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [dispatch]);

  const target = dispatch?.node ?? null;
  const latitude = toCoordinate(dispatch?.target_coordinates?.latitude ?? target?.latitude);
  const longitude = toCoordinate(dispatch?.target_coordinates?.longitude ?? target?.longitude);
  const hasTargetCoordinates = latitude !== null && longitude !== null;
  const targetNode: WithdrawalNode | null = target ?? (hasTargetCoordinates && dispatch?.target_node_id ? { node_id: dispatch.target_node_id, node_type: 'UNKNOWN', latitude, longitude } : null);
  const countdown = useMemo(() => seconds === null ? 'NO DEADLINE ASSIGNED' : seconds === 0 ? 'EXPIRED' : `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`, [seconds]);
  const countdownState = seconds === null ? 'NO DEADLINE' : seconds === 0 ? 'EXPIRED' : seconds <= 300 ? 'NEARING DEADLINE' : 'ACTIVE';

  const advance = async (next: Step) => {
    if (!dispatch) return;
    const idempotency_key = globalThis.crypto?.randomUUID?.() || `${dispatch.dispatch_id}-${next}-${Date.now()}`;
    const payload = { status: next as Exclude<FieldStatus, 'DISPATCHED'>, gps_lat: officerPosition?.[0], gps_lon: officerPosition?.[1], idempotency_key };
    if (offline) {
      const queue = JSON.parse(localStorage.getItem('vajra.field.queue') || '[]');
      localStorage.setItem('vajra.field.queue', JSON.stringify([...queue, { dispatchId: dispatch.dispatch_id, payload }]));
      toast.warning('Saved offline - will sync');
      return;
    }
    try { await updateFieldDispatchStatus(dispatch.dispatch_id, payload); setStatus(next); await loadDispatch(); toast.success(`Status updated: ${next.replace('_', ' ')}`); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Status update failed.'); }
  };

  useEffect(() => {
    const sync = async () => {
      if (!navigator.onLine) return;
      const queue = JSON.parse(localStorage.getItem('vajra.field.queue') || '[]');
      if (!queue.length) return;
      setSyncing(true);
      const remaining = [];
      for (const item of queue) { try { await updateFieldDispatchStatus(item.dispatchId, item.payload); } catch { remaining.push(item); } }
      localStorage.setItem('vajra.field.queue', JSON.stringify(remaining));
      setSyncing(false);
      if (queue.length !== remaining.length) { toast.success('Offline field updates synchronized.'); void loadDispatch(); }
    };
    window.addEventListener('online', sync);
    void sync();
    return () => window.removeEventListener('online', sync);
  }, []);

  const report = async (outcome: 'intercepted' | 'missed' | 'false_alarm') => {
    if (!dispatch) return;
    try { await submitFieldDispatchOutcome(dispatch.dispatch_id, { outcome, actual_cashout_confirmed: outcome === 'intercepted', notes: 'Reported from Beat Officer Mode' }); setOutcomeOpen(false); await loadDispatch(); toast.success('Outcome synchronized to dispatch events.'); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Outcome submission failed.'); }
  };

  if (loading) return <div className="flex min-h-full items-center justify-center bg-slate-950 p-6 text-sm text-slate-300">Loading active dispatch...</div>;
  if (loadError) return <div className="flex min-h-full flex-col items-center justify-center gap-3 bg-slate-950 p-6 text-center text-slate-300"><p className="text-lg font-semibold">Unable to load dispatch</p><p className="text-sm text-slate-500">The field assignment could not be retrieved.</p><button onClick={() => void loadDispatch()} className="min-h-12 rounded-xl bg-rose-600 px-5 text-sm font-bold text-white">Retry</button></div>;
  if (!dispatch) return <div className="flex min-h-full flex-col items-center justify-center gap-3 bg-slate-950 p-6 text-center text-slate-300"><Radio className="h-10 w-10 text-slate-600" /><p className="text-lg font-semibold">No active dispatch</p><p className="text-sm text-slate-500">No current field assignment is available for this officer.</p></div>;

  const caseReference = dispatch.case_id ? `CASE ${dispatch.case_id}` : dispatch.alert_id ? `ALERT ${dispatch.alert_id} - Case not created` : 'CASE NOT LINKED';
  const destination = target?.district || target?.state || (hasTargetCoordinates ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` : 'DESTINATION LOCATION UNAVAILABLE');

  return <div className="mx-auto flex min-h-full max-w-lg flex-col gap-4 overflow-y-auto bg-slate-950 p-4 text-slate-100"><div className="rounded-2xl border-2 border-rose-600 bg-rose-950 p-4 text-center shadow-2xl"><div className="inline-flex items-center gap-2 rounded-full border border-rose-500 bg-rose-900 px-3 py-1 text-sm font-mono font-bold"><ShieldAlert className="h-4 w-4" /> HIGH PRIORITY PATROL DISPATCH</div><h1 className="mt-2 text-2xl font-extrabold">{dispatch.target_node_id || 'Target node unavailable'}</h1><p className="mt-1 text-sm text-rose-200">{caseReference}</p></div>
    <div className="overflow-hidden rounded-2xl border border-slate-800">{targetNode && hasTargetCoordinates ? <OperationsMapCanvas nodes={[targetNode]} center={[latitude, longitude]} zoom={13} officerPosition={officerPosition} /> : <div className="flex h-52 items-center justify-center bg-slate-900 p-6 text-center text-sm text-slate-400">DESTINATION LOCATION UNAVAILABLE</div>}</div>
    <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4"><div><span className="block text-sm text-slate-400">LIVE COUNTDOWN</span><span className={`font-mono text-xl font-bold ${seconds === 0 ? 'text-rose-500' : 'text-amber-400'}`}><Clock3 className="mr-1 inline h-5 w-5" />{countdown}</span><span className="mt-1 block text-xs text-slate-500">{countdownState}</span></div><div><span className="block text-sm text-slate-400">DESTINATION</span><span className="mt-1 block text-sm text-emerald-300">{destination}</span>{hasTargetCoordinates && <span className="mt-1 block font-mono text-xs text-slate-500">{latitude.toFixed(6)}, {longitude.toFixed(6)}</span>}</div></div>
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-sm text-slate-300">{gpsStatus === 'ACTIVE' ? 'GPS ACTIVE' : 'GPS UNAVAILABLE'}{offline && ' - SAVED OFFLINE ACTIONS WILL SYNC'}{syncing && ' - SYNCING'}</div>
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4"><div className="flex items-center justify-between gap-1">{steps.map((step, index) => <React.Fragment key={step}><button disabled={index !== steps.indexOf(status) + 1} onClick={() => void advance(step)} className={`flex min-h-14 flex-1 flex-col items-center justify-center rounded-xl px-1 text-xs font-bold disabled:cursor-default ${steps.indexOf(step) <= steps.indexOf(status) ? 'bg-emerald-900 text-emerald-300' : 'bg-slate-950 text-slate-400'}`}><span>{index + 1}</span>{step.replace('_', ' ')}</button>{index < steps.length - 1 && <span className="text-slate-600">›</span>}</React.Fragment>)}</div><div className="mt-4 space-y-2 border-t border-slate-800 pt-3">{events.map((event) => <div key={`${event.dispatch_id}-${event.status}-${event.status_timestamp}`} className="flex justify-between gap-3 text-sm"><span className="font-medium text-slate-300">{event.status.replace('_', ' ')}</span><span className="font-mono text-slate-500">{event.status_timestamp ? new Date(event.status_timestamp).toLocaleString() : 'Time unavailable'}</span></div>)}</div></div>
    <div className="space-y-3"><button disabled={!hasTargetCoordinates} onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`, '_blank', 'noopener,noreferrer')} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"><Navigation className="h-5 w-5" />{hasTargetCoordinates ? 'START GOOGLE MAPS NAVIGATION' : 'DESTINATION UNAVAILABLE'}</button>{dispatch.bank_nodal_phone ? <a href={`tel:${dispatch.bank_nodal_phone}`} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-800 text-sm font-extrabold"><Phone className="h-5 w-5" /> CALL BANK NODAL OFFICER</a> : <div className="rounded-xl border border-slate-800 p-3 text-center text-sm text-slate-500">BANK NODAL CONTACT UNAVAILABLE</div>}{(status === 'ON_SITE' || status === 'ACTION_TAKEN') && <button onClick={() => setOutcomeOpen(true)} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 text-sm font-extrabold"><CheckCircle2 className="h-5 w-5" /> REPORT OUTCOME</button>}</div>
    {outcomeOpen && <div className="fixed inset-0 z-20 flex items-end bg-black/70 p-4"><div className="mx-auto w-full max-w-lg space-y-3 rounded-2xl border border-slate-700 bg-slate-900 p-4"><h2 className="text-xl font-bold">Report Outcome</h2>{(['intercepted', 'missed', 'false_alarm'] as const).map((outcome) => <button key={outcome} onClick={() => void report(outcome)} className="min-h-12 w-full rounded-xl bg-slate-800 text-sm font-bold uppercase">{outcome.replace('_', ' ')}</button>)}<button onClick={() => setOutcomeOpen(false)} className="w-full p-3 text-sm text-slate-400">Cancel</button></div></div>}</div>;
}