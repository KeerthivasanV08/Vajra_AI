import type {
  Account,
  Alert,
  AmlCase,
  GraphData,
  ReportsData,
  Transaction,
} from '@/types/api';

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
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
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
  const payload = await requestJson<AmlCase[] | { items?: AmlCase[] }>('/api/officer/case/all');
  return Array.isArray(payload) ? payload : toArray<AmlCase>(payload.items);
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
  CryptographicAuditEvent,
  AuditReverifyResponse,
  FairnessSummary,
  SyndicateMatchResponse,
  SimulationResult,
  ModelMetricsResponse,
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

export async function fetchWithdrawalNodes(params?: {
  node_type?: string;
  bank?: string;
  district?: string;
  state?: string;
  risk_min?: number;
  risk_max?: number;
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
  if (params?.page) query.set('page', String(params.page));
  if (params?.page_size) query.set('page_size', String(params.page_size));

  const url = `/api/v1/nodes${query.toString() ? `?${query.toString()}` : ''}`;
  return requestJson<{ items: WithdrawalNode[]; total: number; page: number; page_size: number }>(url);
}

export async function fetchCorridors(): Promise<HighRiskCorridor[]> {
  const res = await requestJson<HighRiskCorridor[] | { items?: HighRiskCorridor[]; corridors?: HighRiskCorridor[] }>('/api/v1/corridors');
  if (Array.isArray(res)) return res;
  // Backend returns { items, total, page, page_size }
  if (Array.isArray((res as any).items)) return (res as any).items as HighRiskCorridor[];
  return (res as any).corridors ?? [];
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

export async function generateLegalDossier(payload: {
  case_id: string;
  prediction_data: Record<string, any>;
  sop_data: Record<string, any>;
  complaint_data?: Record<string, any>;
}): Promise<LegalDossierResponse> {
  return requestJson<LegalDossierResponse>('/api/v1/legal-dossier/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
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

export async function matchSyndicate(payload: { account_id: string }): Promise<SyndicateMatchResponse> {
  return requestJson<SyndicateMatchResponse>('/api/v1/syndicate/match', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
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

