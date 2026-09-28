import { extractList } from "./router-DXMls9-H.mjs";
function normalizeDate(value) {
  if (value == null || value === "") return void 0;
  if (typeof value === "number" && Number.isFinite(value)) {
    return value < 1e12 ? value * 1e3 : value;
  }
  const text = String(value).trim();
  if (!text) return void 0;
  const numeric = Number(text);
  if (Number.isFinite(numeric)) return numeric < 1e12 ? numeric * 1e3 : numeric;
  const parsed = Date.parse(text);
  return Number.isFinite(parsed) ? parsed : void 0;
}
function normalizeCase(raw) {
  const id = String(raw?.id ?? raw?.case_id ?? raw?.caseId ?? "");
  const createdAt = normalizeDate(raw?.createdAt ?? raw?.created_at);
  const slaDueAt = normalizeDate(raw?.slaDueAt ?? raw?.sla_due_at ?? raw?.sla_deadline ?? raw?.due_at);
  const sourceAlerts = extractList(raw?.source_alerts ?? raw?.sourceAlerts);
  const sourceAlert = raw?.source_alert_id ?? raw?.source_alert ?? raw?.sourceAlert;
  if (sourceAlert && !sourceAlerts.includes(String(sourceAlert))) sourceAlerts.push(String(sourceAlert));
  const linkedAlerts = raw?.linkedAlerts ?? raw?.linked_alerts;
  return {
    id,
    caseId: raw?.case_id ?? raw?.caseId ?? id,
    userId: raw?.user_id ?? raw?.account_id ?? raw?.userId,
    priority: String(raw?.priority ?? "P3").toUpperCase(),
    title: String(raw?.title ?? raw?.reason ?? raw?.summary ?? "Case title unavailable"),
    linkedAlerts: linkedAlerts != null ? Number(linkedAlerts) : sourceAlerts.length,
    officer: raw?.officer != null ? String(raw.officer) : raw?.assigned_officer != null ? String(raw.assigned_officer) : null,
    status: String(raw?.status ?? "OPEN").toUpperCase(),
    createdAt,
    slaDueAt,
    escalation: raw?.escalation ?? raw?.escalation_level ?? void 0,
    sourceAlert: sourceAlert != null ? String(sourceAlert) : void 0,
    sourceAlerts: sourceAlerts.length ? sourceAlerts : void 0,
    evidence: Array.isArray(raw?.evidence) ? raw.evidence : raw?.evidence ? [raw.evidence] : void 0,
    sarStatus: raw?.sarStatus ?? raw?.sar_status
  };
}
function extractCases(raw) {
  const items = extractList(raw).map(normalizeCase);
  const seen = /* @__PURE__ */ new Set();
  return items.reverse().filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  }).reverse();
}
export {
  extractCases as e,
  normalizeCase as n
};
