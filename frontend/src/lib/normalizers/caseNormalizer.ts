import type { Case } from '@/types';
import { extractList } from './util';

function normalizeDate(value: unknown): number | undefined {
  if (value == null || value === '') return undefined;
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value < 1_000_000_000_000 ? value * 1000 : value;
  }
  const text = String(value).trim();
  if (!text) return undefined;
  const numeric = Number(text);
  if (Number.isFinite(numeric)) return numeric < 1_000_000_000_000 ? numeric * 1000 : numeric;
  const parsed = Date.parse(text);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function normalizeCase(raw: any): Case {
  const id = String(raw?.id ?? raw?.case_id ?? raw?.caseId ?? '');
  const createdAt = normalizeDate(raw?.createdAt ?? raw?.created_at);
  const slaDueAt = normalizeDate(raw?.slaDueAt ?? raw?.sla_due_at ?? raw?.sla_deadline ?? raw?.due_at);
  const sourceAlerts = extractList<string>(raw?.source_alerts ?? raw?.sourceAlerts);
  const sourceAlert = raw?.source_alert_id ?? raw?.source_alert ?? raw?.sourceAlert;
  if (sourceAlert && !sourceAlerts.includes(String(sourceAlert))) sourceAlerts.push(String(sourceAlert));
  const linkedAlerts = raw?.linkedAlerts ?? raw?.linked_alerts;
  return {
    id,
    caseId: raw?.case_id ?? raw?.caseId ?? id,
    userId: raw?.user_id ?? raw?.account_id ?? raw?.userId,
    priority: String(raw?.priority ?? 'P3').toUpperCase() as Case['priority'],
    title: String(raw?.title ?? raw?.reason ?? raw?.summary ?? 'Case title unavailable'),
    linkedAlerts: linkedAlerts != null ? Number(linkedAlerts) : sourceAlerts.length,
    officer: raw?.officer != null ? String(raw.officer) : raw?.assigned_officer != null ? String(raw.assigned_officer) : null,
    status: String(raw?.status ?? 'OPEN').toUpperCase(),
    createdAt,
    slaDueAt,
    escalation: raw?.escalation ?? raw?.escalation_level ?? undefined,
    sourceAlert: sourceAlert != null ? String(sourceAlert) : undefined,
    sourceAlerts: sourceAlerts.length ? sourceAlerts : undefined,
    evidence: Array.isArray(raw?.evidence) ? raw.evidence : raw?.evidence ? [raw.evidence] : undefined,
    sarStatus: raw?.sarStatus ?? raw?.sar_status,
  };
}

export function extractCases(raw: unknown): Case[] {
  const items = extractList<Case>(raw).map(normalizeCase);
  // Deduplicate by case ID - keep latest (last in array)
  const seen = new Set<string>();
  return items.reverse().filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  }).reverse();
}
