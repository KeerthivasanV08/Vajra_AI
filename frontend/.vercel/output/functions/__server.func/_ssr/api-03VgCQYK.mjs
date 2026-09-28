import { n as normalizeCase } from "./caseNormalizer-BzVobBFG.mjs";
const API_BASE_URL = "http://127.0.0.1:8000";
function toArray(value) {
  return Array.isArray(value) ? value : [];
}
async function requestJson(path, init = {}) {
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...isFormData ? {} : { "Content-Type": "application/json" },
      ...init.headers ?? {}
    }
  });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${path}`);
  }
  return await response.json();
}
async function fetchOfficerCases() {
  const payload = await requestJson("/api/officer/case/all");
  const records = Array.isArray(payload) ? payload : toArray(payload?.items);
  return records.map(normalizeCase);
}
async function simulateSOP(payload) {
  return requestJson("/api/v1/sop/simulate", { method: "POST", body: JSON.stringify(payload) });
}
async function fetchCaseSOPFusion(caseId) {
  return requestJson(`/api/v1/sop/case/${encodeURIComponent(caseId)}/fusion`);
}
async function applyCaseSOPSimulation(caseId, payload) {
  return requestJson(`/api/v1/sop/case/${encodeURIComponent(caseId)}/apply-simulation`, { method: "POST", body: JSON.stringify(payload) });
}
async function fetchWithdrawalNodes(params) {
  const query = new URLSearchParams();
  if (params?.node_type) query.set("node_type", params.node_type);
  if (params?.bank) query.set("bank", params.bank);
  if (params?.district) query.set("district", params.district);
  if (params?.state) query.set("state", params.state);
  if (params?.risk_min !== void 0) query.set("risk_min", String(params.risk_min));
  if (params?.risk_max !== void 0) query.set("risk_max", String(params.risk_max));
  if (params?.risk_band) query.set("risk_band", params.risk_band);
  if (params?.search) query.set("search", params.search);
  if (params?.page) query.set("page", String(params.page));
  if (params?.page_size) query.set("page_size", String(params.page_size));
  const url = `/api/v1/nodes${query.toString() ? `?${query.toString()}` : ""}`;
  return requestJson(url);
}
async function fetchWithdrawalNode(nodeId) {
  return requestJson(`/api/v1/nodes/${encodeURIComponent(nodeId)}`);
}
async function fetchCorridors() {
  const res = await requestJson("/api/v1/corridors");
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.items)) return res.items;
  return res.corridors ?? [];
}
async function fetchCorridorNodes(corridorId) {
  return requestJson(`/api/v1/corridors/${encodeURIComponent(corridorId)}/nodes`);
}
async function dispatchPCRPatrol(payload) {
  return requestJson("/api/v1/dispatch/pcr", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
async function dispatchBankStepUp(payload) {
  return requestJson("/api/v1/dispatch/bank-stepup", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
async function generateLegalDossier(payload) {
  return requestJson("/api/v1/legal-dossier/generate", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
async function fetchLegalDossiers(caseId) {
  const query = caseId ? `?case_id=${encodeURIComponent(caseId)}` : "";
  return requestJson(`/api/v1/legal-dossiers${query}`);
}
async function fetchLegalDossier(dossierId) {
  return requestJson(`/api/v1/legal-dossiers/${encodeURIComponent(dossierId)}`);
}
async function verifyLegalDossier(dossierId) {
  return requestJson(`/api/v1/legal-dossiers/${encodeURIComponent(dossierId)}/verify`);
}
async function fetchAuditChain() {
  return requestJson("/api/v1/audit/chain");
}
async function reverifyAuditChain() {
  return requestJson("/api/v1/audit/reverify", {
    method: "POST"
  });
}
async function fetchFairnessRegions() {
  return requestJson("/api/v1/fairness/regions");
}
async function fetchFairnessRegionDetail(regionId) {
  return requestJson(`/api/v1/fairness/regions/${encodeURIComponent(regionId)}/detail`);
}
async function recalculateFairnessRegions() {
  return requestJson("/api/v1/fairness/regions/recalculate", { method: "POST" });
}
async function searchMuleAccounts(query, limit = 10) {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  const response = await requestJson(`/api/accounts/search?${params}`);
  return response.results;
}
async function fetchMuleTrace(identifier) {
  return requestJson(`/api/v1/mule-trace/${encodeURIComponent(identifier)}`);
}
async function fetchMuleFingerprint(identifier) {
  return requestJson(`/api/v1/mule-trace/${encodeURIComponent(identifier)}/syndicate-fingerprint`);
}
async function fetchMulePredictedTerminals(identifier) {
  return requestJson(`/api/v1/mule-trace/${encodeURIComponent(identifier)}/predicted-terminals`);
}
async function runLiveAttackSimulation(payload) {
  return requestJson("/api/v1/simulation/live-attack", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
async function fetchModelRegistryMetrics() {
  return requestJson("/api/v1/metrics/models");
}
async function fetchActiveFieldDispatch() {
  return requestJson("/api/v1/field/active-dispatch");
}
async function updateFieldDispatchStatus(dispatchId, payload) {
  return requestJson(`/api/v1/field/dispatch/${encodeURIComponent(dispatchId)}/status`, { method: "PATCH", body: JSON.stringify(payload) });
}
async function submitFieldDispatchOutcome(dispatchId, payload) {
  return requestJson(`/api/v1/field/dispatch/${encodeURIComponent(dispatchId)}/outcome`, { method: "POST", body: JSON.stringify(payload) });
}
async function recalculateNodeVulnerability(nodeId) {
  return requestJson(`/api/v1/nodes/${encodeURIComponent(nodeId)}/recalculate-vulnerability`, { method: "POST" });
}
async function bulkImportNodes(file) {
  const form = new FormData();
  form.append("file", file);
  return requestJson("/api/v1/nodes/bulk-import", {
    method: "POST",
    body: form,
    headers: { Accept: "application/json" }
  });
}
export {
  simulateSOP as A,
  submitFieldDispatchOutcome as B,
  updateFieldDispatchStatus as C,
  verifyLegalDossier as D,
  applyCaseSOPSimulation as a,
  bulkImportNodes as b,
  dispatchPCRPatrol as c,
  dispatchBankStepUp as d,
  fetchAuditChain as e,
  fetchActiveFieldDispatch as f,
  fetchCaseSOPFusion as g,
  fetchCorridorNodes as h,
  fetchCorridors as i,
  fetchFairnessRegionDetail as j,
  fetchFairnessRegions as k,
  fetchLegalDossier as l,
  fetchLegalDossiers as m,
  fetchModelRegistryMetrics as n,
  fetchMuleFingerprint as o,
  fetchMulePredictedTerminals as p,
  fetchMuleTrace as q,
  fetchOfficerCases as r,
  fetchWithdrawalNode as s,
  fetchWithdrawalNodes as t,
  generateLegalDossier as u,
  recalculateFairnessRegions as v,
  recalculateNodeVulnerability as w,
  reverifyAuditChain as x,
  runLiveAttackSimulation as y,
  searchMuleAccounts as z
};
