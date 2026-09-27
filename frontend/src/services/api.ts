import type {
  Account,
  Alert,
  AmlCase,
  GraphData,
  ReportsData,
  Transaction,
} from '@/types/api';
import { normalizeCase } from '@/lib/normalizers/caseNormalizer';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';

const API_ENDPOINTS = {
  transactions: '/api/transactions/recent',
  transactionRealtime: '/api/transactions/realtime',
  transactionAnalyze: '/api/transactions/analyze',
  accounts: '/api/accounts',
  alerts: '/api/alerts',
  graph: '/api/graph/network',
  onboardingEvaluate: '/api/onboarding/evaluate',
  onboardingExplain: '/api/onboarding/explain',
  officerReview: '/api/officer/review',
  officerFreeze: '/api/officer/freeze',
  officerSar: '/api/officer/sar',
  reports: '/api/reports',
  reportsExport: '/api/reports/export',
} as const;

function toArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${path}`);
  }

  return (await response.json()) as T;
}

async function requestText(path: string, init: RequestInit = {}): Promise<string> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'text/plain, application/json',
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${path}`);
  }

  return response.text();
}

export async function fetchTransactions(): Promise<Transaction[]> {
  const payload = await requestJson<Transaction[] | { items?: Transaction[] }>(API_ENDPOINTS.transactions);
  return Array.isArray(payload) ? payload : toArray<Transaction>(payload.items);
}

export async function fetchRealtimeTransactions(): Promise<Transaction[]> {
  const payload = await requestJson<Transaction[] | { items?: Transaction[] }>(API_ENDPOINTS.transactionRealtime);
  return Array.isArray(payload) ? payload : toArray<Transaction>(payload.items);
}

export async function fetchAccounts(): Promise<Account[]> {
  const payload = await requestJson<Account[] | { items?: Account[] }>(API_ENDPOINTS.accounts);
  return Array.isArray(payload) ? payload : toArray<Account>(payload.items);
}

export async function fetchAlerts(): Promise<Alert[]> {
  const payload = await requestJson<Alert[] | { items?: Alert[] }>(API_ENDPOINTS.alerts);
  return Array.isArray(payload) ? payload : toArray<Alert>(payload.items);
}

export async function fetchGraphData(): Promise<GraphData> {
  const payload = await requestJson<Partial<GraphData>>(API_ENDPOINTS.graph);
  return {
    nodes: toArray(payload.nodes),
    edges: toArray(payload.edges),
    circularFlows: toArray(payload.circularFlows),
    clusterSummaries: toArray(payload.clusterSummaries),
  };
}

export async function fetchSystemHealth(): Promise<{
  readiness: { status: string; runtime_mode?: string; ml_engine?: string; graph_engine?: string; control_engine?: string };
  modelHealth: { behavioral_model: string; sequence_model: string; graph_engine: string; runtime_mode: string };
}> {
  const [readiness, modelHealth] = await Promise.all([
    requestJson<{ status: string; runtime_mode?: string; ml_engine?: string; graph_engine?: string; control_engine?: string }>('/api/ready'),
    requestJson<{ behavioral_model: string; sequence_model: string; graph_engine: string; runtime_mode: string }>('/api/system/model-health'),
  ]);

  return { readiness, modelHealth };
}

export async function fetchAccountGraph(accountId: string): Promise<GraphData> {
  const payload = await requestJson<Partial<GraphData>>(`/api/graph/account/${encodeURIComponent(accountId)}`);
  return {
    nodes: toArray(payload.nodes),
    edges: toArray(payload.edges),
    circularFlows: toArray(payload.circularFlows),
    clusterSummaries: toArray(payload.clusterSummaries),
  };
}

export async function evaluateOnboarding(payload: unknown): Promise<unknown> {
  return requestJson(API_ENDPOINTS.onboardingEvaluate, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function explainOnboarding(userId: string): Promise<unknown> {
  return requestJson(`${API_ENDPOINTS.onboardingExplain}/${encodeURIComponent(userId)}`);
}

export async function analyzeTransaction(payload: unknown): Promise<unknown> {
  return requestJson(API_ENDPOINTS.transactionAnalyze, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchOfficerCases(): Promise<AmlCase[]> {
  const payload = await requestJson<unknown>('/api/officer/case/all');
  const records = Array.isArray(payload)
    ? payload
    : toArray<unknown>((payload as { items?: unknown[] } | null)?.items);
  return records.map(normalizeCase);
}

export async function fetchOfficerReviewQueue(): Promise<AmlCase[]> {
  return fetchOfficerCases();
}

export async function submitOfficerFreeze(payload: unknown): Promise<unknown> {
  return requestJson(API_ENDPOINTS.officerFreeze, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function submitOfficerSar(payload: unknown): Promise<unknown> {
  return requestJson(API_ENDPOINTS.officerSar, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchReports(): Promise<ReportsData> {
  const payload = await requestJson<Partial<ReportsData>>(API_ENDPOINTS.reports);
  return {
    officers: toArray<string>(payload.officers),
    auditTrail: toArray(payload.auditTrail),
  };
}

export async function exportReports(format: 'json' | 'csv' | 'pdf' = 'json'): Promise<string> {
  return requestText(`${API_ENDPOINTS.reportsExport}?format=${encodeURIComponent(format)}`);
}

// === VAJRA AI PLATFORM EXTENSIONS ===
import type {
  VajraCaseAnalysis,
  PhysicalPredictionResponse,
  SOPEvaluationResponse,
  WithdrawalNode,
  HighRiskCorridor,
  DispatchResponse,
  LegalDossierResponse,
  DossierVerificationResult,
  CryptographicAuditEvent,
  AuditReverifyResponse,
  FairnessSummary,
  SyndicateMatchResponse,
  MuleRingInvestigationResponse,
  SOPFusionResult,
  SimulationResult,
  ModelMetricsResponse,
  FairnessRegion,
  FairnessRegionDetail,
  FieldDispatch,
  FieldDispatchEvent,
  FieldStatus,
  MuleAccountSearchResult,
  MuleFingerprintResponse,
  MulePredictedTerminalsResponse,
  MuleTraceResponse,
} from '@/types/vajra';

export async function analyzeVajraCase(payload: {
  account_id: string;
  geo_lat: number;
  geo_lon: number;
  session_data?: Record<string, any>;
  complaint_context?: Record<string, any>;
}): Promise<VajraCaseAnalysis> {
  return requestJson<VajraCaseAnalysis>('/api/v1/vajra/analyze', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function predictCashout(payload: {
  account_id: string;
  geo_lat: number;
  geo_lon: number;
  digital_risk_score?: number;
  mule_probability?: number;
  session_data?: Record<string, any>;
}): Promise<PhysicalPredictionResponse> {
  return requestJson<PhysicalPredictionResponse>('/api/v1/prediction/cashout', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchPredictionHistory(): Promise<{ items: any[]; page: number; total: number }> {
  return requestJson<{ items: any[]; page: number; total: number }>('/api/v1/prediction/history');
}

export async function evaluateSOP(payload: {
  digital_risk_score: number;
  physical_prediction_score: number;
  context_score?: number;
  imminent_overseas_shift?: boolean;
  cross_border_risk_score?: number;
}): Promise<SOPEvaluationResponse> {
  return requestJson<SOPEvaluationResponse>('/api/v1/sop/evaluate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function simulateSOP(payload: { digital: number; physical: number; context: number; cross_border_override: boolean }): Promise<SOPFusionResult> {
  return requestJson<SOPFusionResult>('/api/v1/sop/simulate', { method: 'POST', body: JSON.stringify(payload) });
}

export async function fetchCaseSOPFusion(caseId: string): Promise<SOPFusionResult> {
  return requestJson<SOPFusionResult>(`/api/v1/sop/case/${encodeURIComponent(caseId)}/fusion`);
}

export async function applyCaseSOPSimulation(caseId: string, payload: { digital: number; physical: number; context: number; cross_border_override: boolean }): Promise<SOPFusionResult> {
  return requestJson<SOPFusionResult>(`/api/v1/sop/case/${encodeURIComponent(caseId)}/apply-simulation`, { method: 'POST', body: JSON.stringify(payload) });
}

export async function fetchWithdrawalNodes(params?: {
  node_type?: string;
  bank?: string;
  district?: string;
  state?: string;
  risk_min?: number;
  risk_max?: number;
  risk_band?: string;
  search?: string;
  page?: number;
  page_size?: number;
}): Promise<{ items: WithdrawalNode[]; total: number; page: number; page_size: number }> {
  const query = new URLSearchParams();
  if (params?.node_type) query.set('node_type', params.node_type);
  if (params?.bank) query.set('bank', params.bank);
  if (params?.district) query.set('district', params.district);
  if (params?.state) query.set('state', params.state);
  if (params?.risk_min !== undefined) query.set('risk_min', String(params.risk_min));
  if (params?.risk_max !== undefined) query.set('risk_max', String(params.risk_max));
  if (params?.risk_band) query.set('risk_band', params.risk_band);
  if (params?.search) query.set('search', params.search);
  if (params?.page) query.set('page', String(params.page));
  if (params?.page_size) query.set('page_size', String(params.page_size));

  const url = `/api/v1/nodes${query.toString() ? `?${query.toString()}` : ''}`;
  return requestJson<{ items: WithdrawalNode[]; total: number; page: number; page_size: number }>(url);
}

export async function fetchWithdrawalNode(nodeId: string): Promise<WithdrawalNode> {
  return requestJson<WithdrawalNode>(`/api/v1/nodes/${encodeURIComponent(nodeId)}`);
}

export async function fetchCorridors(): Promise<HighRiskCorridor[]> {
  const res = await requestJson<HighRiskCorridor[] | { items?: HighRiskCorridor[]; corridors?: HighRiskCorridor[] }>('/api/v1/corridors');
  if (Array.isArray(res)) return res;
  // Backend returns { items, total, page, page_size }
  if (Array.isArray((res as any).items)) return (res as any).items as HighRiskCorridor[];
  return (res as any).corridors ?? [];
}

export async function fetchCorridorNodes(corridorId: string): Promise<{ corridor_id: string; nodes_count: number; nodes: WithdrawalNode[] }> {
  return requestJson(`/api/v1/corridors/${encodeURIComponent(corridorId)}/nodes`);
}

export async function dispatchPCRPatrol(payload: {
  case_id: string;
  prediction_id?: string;
  target_node_id: string;
  target_lat: number;
  target_lon: number;
}): Promise<DispatchResponse> {
  return requestJson<DispatchResponse>('/api/v1/dispatch/pcr', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function dispatchBankStepUp(payload: {
  account_id: string;
  case_id: string;
}): Promise<DispatchResponse> {
  return requestJson<DispatchResponse>('/api/v1/dispatch/bank-stepup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function generateLegalDossier(payload: { case_id: string; prediction_data?: Record<string, unknown>; sop_data?: Record<string, unknown>; complaint_data?: Record<string, unknown> }): Promise<LegalDossierResponse> {
  return requestJson<LegalDossierResponse>('/api/v1/legal-dossier/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchLegalDossiers(caseId?: string): Promise<{ items: LegalDossierResponse[] }> {
  const query = caseId ? `?case_id=${encodeURIComponent(caseId)}` : '';
  return requestJson<{ items: LegalDossierResponse[] }>(`/api/v1/legal-dossiers${query}`);
}

export async function fetchLegalDossier(dossierId: string): Promise<LegalDossierResponse> {
  return requestJson<LegalDossierResponse>(`/api/v1/legal-dossiers/${encodeURIComponent(dossierId)}`);
}

export async function verifyLegalDossier(dossierId: string): Promise<DossierVerificationResult> {
  return requestJson<DossierVerificationResult>(`/api/v1/legal-dossiers/${encodeURIComponent(dossierId)}/verify`);
}

export async function fetchAuditChain(): Promise<{ events_count: number; chain: CryptographicAuditEvent[] }> {
  return requestJson<{ events_count: number; chain: CryptographicAuditEvent[] }>('/api/v1/audit/chain');
}

export async function reverifyAuditChain(): Promise<AuditReverifyResponse> {
  return requestJson<AuditReverifyResponse>('/api/v1/audit/reverify', {
    method: 'POST',
  });
}

export async function fetchFairnessAudit(): Promise<FairnessSummary> {
  return requestJson<FairnessSummary>('/api/v1/fairness-audit');
}

export async function fetchFairnessRegions(): Promise<{ results: FairnessRegion[] }> {
  return requestJson<{ results: FairnessRegion[] }>('/api/v1/fairness/regions');
}

export async function fetchFairnessRegionDetail(regionId: string): Promise<FairnessRegionDetail> {
  return requestJson<FairnessRegionDetail>(`/api/v1/fairness/regions/${encodeURIComponent(regionId)}/detail`);
}

export async function recalculateFairnessRegions(): Promise<{ results: FairnessRegion[] }> {
  return requestJson<{ results: FairnessRegion[] }>('/api/v1/fairness/regions/recalculate', { method: 'POST' });
}

export async function matchSyndicate(payload: {
  account_id: string;
  hop_count?: number;
  fan_out_factor?: number;
  layering_time_mins?: number;
  average_interhop_velocity_mins?: number;
  terminal_node_risk_reference?: number;
}): Promise<SyndicateMatchResponse> {
  return requestJson<SyndicateMatchResponse>('/api/v1/syndicate/match', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function investigateMuleRing(accountId: string, context?: { case_id?: string; alert_id?: string }): Promise<MuleRingInvestigationResponse> {
  const query = new URLSearchParams({ account_id: accountId });
  if (context?.case_id) query.set('case_id', context.case_id);
  if (context?.alert_id) query.set('alert_id', context.alert_id);
  return requestJson<MuleRingInvestigationResponse>(
    `/api/v1/mule-ring/investigate?${query.toString()}`,
  );
}

export async function searchMuleAccounts(query: string, limit = 10): Promise<MuleAccountSearchResult[]> {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  const response = await requestJson<{ results: MuleAccountSearchResult[] }>(`/api/accounts/search?${params}`);
  return response.results;
}

export async function fetchMuleTrace(identifier: string): Promise<MuleTraceResponse> {
  return requestJson<MuleTraceResponse>(`/api/v1/mule-trace/${encodeURIComponent(identifier)}`);
}

export async function fetchMuleFingerprint(identifier: string): Promise<MuleFingerprintResponse> {
  return requestJson<MuleFingerprintResponse>(`/api/v1/mule-trace/${encodeURIComponent(identifier)}/syndicate-fingerprint`);
}

export async function fetchMulePredictedTerminals(identifier: string): Promise<MulePredictedTerminalsResponse> {
  return requestJson<MulePredictedTerminalsResponse>(`/api/v1/mule-trace/${encodeURIComponent(identifier)}/predicted-terminals`);
}

export async function runLiveAttackSimulation(payload: {
  victim_account_id?: string;
  mule_chain?: string[];
  initial_amount_inr?: number;
  origin_lat?: number;
  origin_lon?: number;
}): Promise<SimulationResult> {
  return requestJson<SimulationResult>('/api/v1/simulation/live-attack', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchModelRegistryMetrics(): Promise<ModelMetricsResponse> {
  return requestJson<ModelMetricsResponse>('/api/v1/metrics/models');
}

export async function fetchActiveFieldDispatch(): Promise<{ active: boolean; dispatch: FieldDispatch | null; latest_event?: FieldDispatchEvent; events?: FieldDispatchEvent[] }> {
  return requestJson('/api/v1/field/active-dispatch');
}

export async function updateFieldDispatchStatus(dispatchId: string, payload: { status: Exclude<FieldStatus, 'DISPATCHED'>; gps_lat?: number; gps_lon?: number; notes?: string; idempotency_key?: string }) {
  return requestJson(`/api/v1/field/dispatch/${encodeURIComponent(dispatchId)}/status`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function submitFieldDispatchOutcome(dispatchId: string, payload: { outcome: 'intercepted' | 'missed' | 'false_alarm'; actual_cashout_confirmed: boolean; notes?: string; actual_action_taken?: string }) {
  return requestJson(`/api/v1/field/dispatch/${encodeURIComponent(dispatchId)}/outcome`, { method: 'POST', body: JSON.stringify(payload) });
}

export async function recalculateNodeVulnerability(nodeId: string) {
  return requestJson(`/api/v1/nodes/${encodeURIComponent(nodeId)}/recalculate-vulnerability`, { method: 'POST' });
}

export async function bulkImportNodes(file: File) {
  const form = new FormData();
  form.append('file', file);
  return requestJson('/api/v1/nodes/bulk-import', {
    method: 'POST',
    body: form,
    headers: { Accept: 'application/json' },
  });
}

