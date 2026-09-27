// VAJRA Platform Core TypeScript Interfaces & Schemas

export type SOPTier = 
  | 'MONITOR'
  | 'SOFT-ALERT'
  | 'RECOMMEND-HOLD'
  | 'ESCALATE-FREEZE'
  | 'INTERNATIONAL_ALERT_OVERRIDE';

export type NodeType = 'ATM' | 'MICRO_ATM' | 'AEPS_CSP' | 'POS' | 'CDM';

export interface DataProvenance {
  type: string;
  is_synthetic: number;
  source: string;
  disclaimer: string;
}

export interface WithdrawalNode {
  node_id: string;
  node_type: NodeType | string;
  bank_or_aggregator_id?: string | null;
  bank_name?: string | null;
  bc_id?: string | null;
  latitude: number;
  longitude: number;
  pincode?: number;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  historical_txn_volume?: number;
  average_daily_transactions?: number;
  average_transaction_amount?: number;
  off_hour_withdrawal_ratio?: number;
  historical_cash_withdrawals?: number;
  historical_fraud_cashouts?: number;
  previous_fraud_flags?: number;
  distance_to_known_corridor_km?: number;
  corridor_id?: string;
  cash_limit_daily?: number;
  operating_hours_start?: string;
  operating_hours_end?: string;
  weekend_active?: number;
  vulnerability_score_reference?: number;
  is_active?: number;
  is_synthetic?: number;
  node_vulnerability_score?: number;
  candidate_distance_km?: number;
  candidate_distance_rank?: number;
  ranker_score?: number;
  final_rank?: number;
}

export interface PhysicalPredictionResponse {
  prediction_id: string;
  account_id: string;
  predicted_region: string;
  region_confidence: number;
  trajectory: {
    predicted_cell_id: string;
    predicted_lat: number;
    predicted_lon: number;
    trajectory_confidence: number;
    historical_points_count: number;
  };
  candidates_count: number;
  candidates: WithdrawalNode[];
  top_candidates: WithdrawalNode[];
  top_prediction: WithdrawalNode;
  physical_prediction_score: number;
  predicted_time_window_mins: number;
  data_provenance: DataProvenance;
  model_versions: Record<string, string>;
}

export interface CrossBorderRisk {
  cross_border_risk_score: number;
  imminent_overseas_shift: number | boolean;
  foreign_country?: string;
  transition_timestamp?: string;
  risk_reasons: string[];
  model_version: string;
}

export interface SOPEvaluationResponse {
  raw_fusion_score: number;
  calibrated_score: number;
  sop_tier: SOPTier;
  action_description: string;
  cross_border_override: boolean;
  fusion_weights: {
    digital: number;
    physical: number;
    context: number;
  };
  explanations: string[];
  legal_authority_disclaimer: string;
  model_version: string;
  calibration_trained?: boolean;
  calibration_message?: string;
}

export interface SOPFusionResult {
  raw_score: number;
  calibrated_score: number;
  tier: string;
  contributions: {
    digital: number;
    physical: number;
    context: number;
  };
  cross_border_override: boolean;
  action_description?: string;
  legal_authority_disclaimer?: string;
  case_id?: string;
  calculated_at?: string;
  calibration_trained?: boolean;
  calibration_message?: string;
}

export interface LEAUnt {
  nearest_lea_unit_id: string;
  unit_name: string;
  unit_type: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  beat_code?: string;
  contact_channel?: string;
  contact_phone_synthetic?: number;
  is_active?: number;
  distance_km?: number;
}

export interface OperationalRecommendations {
  recommended_sop_tier: SOPTier;
  action_description: string;
  nearest_lea_unit: LEAUnt;
  target_cashout_node: WithdrawalNode;
  dispatch_pcr_recommended: boolean | number;
  bank_stepup_recommended: boolean | number;
}

export interface CryptographicAuditEvent {
  event_id: string;
  timestamp: string;
  officer_id: string;
  action_type: string;
  target_entity: string;
  payload_hash: string;
  previous_hash: string;
  event_hash: string;
}

export interface VajraCaseAnalysis {
  case_id: string;
  account_id: string;
  digital: {
    digital_risk_score: number;
    mule_probability: number;
    rule_flags?: string[];
  };
  physical: PhysicalPredictionResponse;
  cross_border: CrossBorderRisk;
  sop: SOPEvaluationResponse;
  reason_codes: string[];
  recommendations: OperationalRecommendations;
  audit: CryptographicAuditEvent;
  data_provenance: DataProvenance;
}

export interface HighRiskCorridor {
  corridor_id: string;
  corridor_name: string;
  state: string;
  district: string;
  primary_nodes_count: number;
  vulnerability_level: string;
  risk_score: number;
  start_lat: number;
  start_lon: number;
  end_lat: number;
  end_lon: number;
}

export interface DispatchResponse {
  dispatch_id: string;
  case_id: string;
  prediction_id?: string;
  dispatch_type: 'PCR_PATROL' | 'BANK_STEPUP';
  status: 'REQUESTED' | 'QUEUED' | 'SENT' | 'ACKNOWLEDGED' | 'FAILED' | 'CANCELLED';
  target_node?: WithdrawalNode;
  target_lat?: number;
  target_lon?: number;
  nearest_lea_unit?: LEAUnt;
  requested_by: string;
  created_at: string;
  estimated_arrival_mins?: number;
}

export interface LegalDossierResponse {
  dossier_id: string;
  case_id: string;
  generated_at: string;
  officer_id: string;
  evidence_hash: string;
  document_hash: string;
  audit_event_id: string;
  download_url: string;
  version: number;
  status: 'READY' | 'FAILED' | 'GENERATING' | string;
  integrity_status: 'VERIFIED' | 'FAILED' | string;
  case_summary?: Record<string, unknown>;
  complaint?: Record<string, unknown>;
  prediction?: Record<string, unknown>;
  sop_decision?: Record<string, unknown>;
  data_provenance?: Record<string, unknown>;
}

export interface DossierVerificationResult {
  dossier_id: string;
  verified: boolean;
  stored_hash: string | null;
  actual_hash: string | null;
  integrity_status: string;
}

export interface AuditReverifyResponse {
  verified: boolean;
  events_checked: number;
  first_invalid_event: CryptographicAuditEvent | null;
  failure_reason: string | null;
}

export interface FairnessSummary {
  is_non_scoring_governance_layer: boolean;
  analyzed_groups_count: number;
  disparate_impact_disclaimer: string;
  groups: Array<{
    group_name: string;
    predicted_high_risk_pct: number;
    confirmed_fraud_pct: number;
    disparate_impact_ratio: number;
    status: 'OK' | 'REVIEW' | 'FLAGGED' | 'N/A';
  }>;
}

export interface FairnessRegion {
  region_id: string;
  region_name: string;
  state: string;
  number_of_predictions: number;
  number_of_true_cases: number;
  number_of_false_positives: number;
  number_of_false_negatives: number;
  predicted_high_risk_pct: number | null;
  confirmed_fraud_pct: number | null;
  disparate_impact_ratio: number | null;
  governance_flag: 'OK' | 'REVIEW' | 'FLAGGED' | 'N/A';
  calculated_at: string;
}

export interface FairnessRegionDetail extends FairnessRegion {
  dir_trend_30d: Array<{ date: string; dir: number | null }>;
}

export type FieldStatus = 'DISPATCHED' | 'EN_ROUTE' | 'ON_SITE' | 'ACTION_TAKEN';
export interface FieldDispatch {
  dispatch_id: string;
  alert_id?: string | null;
  case_id?: string;
  prediction_id?: string;
  target_node_id?: string;
  target_coordinates?: { latitude?: number | null; longitude?: number | null };
  node?: WithdrawalNode | null;
  requested_by: string;
  timestamp: string;
  deadline?: string;
  field_status?: FieldStatus;
  field_status_updated_at?: string;
  bank_nodal_phone?: string | null;
  mock_mode?: boolean;
}

export interface FieldDispatchEvent {
  dispatch_id: string;
  officer_id?: string | null;
  node_id?: string | null;
  status: FieldStatus;
  gps_lat?: number | null;
  gps_lon?: number | null;
  status_timestamp?: string | null;
  outcome?: 'intercepted' | 'missed' | 'false_alarm' | null;
  notes?: string | null;
}

export interface SyndicateMatchResponse {
  account_id: string;
  pattern_name: string;
  confidence: number | null;
  matched_tags: Array<{
    tag: string;
    investigative_only: boolean;
  }>;
  summary: string;
}

export interface MuleRingTransaction {
  transaction_id: string | null;
  from_account: string | null;
  to_account: string | null;
  from_bank?: string | null;
  to_bank?: string | null;
  amount: number | null;
  timestamp: string | null;
  channel: string | null;
  location: string | null;
  elapsed_mins: number | null;
  velocity_mins: number | null;
  latitude: number | null;
  longitude: number | null;
}

export interface MuleRingHop {
  role: 'ORIGIN' | 'LAYER_MULE' | 'TERMINAL_MULE';
  step: number;
  account_id: string | null;
  bank: string | null;
  amount: number | null;
  timestamp: string | null;
  location: string | null;
  transaction_id: string | null;
}

export interface MuleRingInvestigationResponse {
  account_id: string;
  status: 'SUCCESS' | 'EMPTY';
  case_context: Record<string, string>;
  account?: Record<string, unknown> | null;
  hops: MuleRingHop[];
  transactions: MuleRingTransaction[];
  kpis: {
    hops_traced: number;
    fan_out_factor: number | null;
    total_stolen: number | null;
    layering_time_mins: number | null;
    terminal_mules: number;
  };
}

export interface SimulationResult {
  simulation_id: string;
  status: string;
  events: Array<{
    step: number;
    timestamp: string;
    from_account: string;
    to_account: string;
    amount: number;
    risk_tier: string;
  }>;
  predicted_cashout: PhysicalPredictionResponse;
}

export interface ModelMetricsResponse {
  models: Record<string, {
    name: string;
    purpose: string;
    algorithm: string;
    status: string;
    version: string;
    metrics: Record<string, number | string>;
    warning_notes?: string[];
  }>;
}

export interface MuleAccountSearchResult {
  account_id: string;
  account_id_masked: string;
  holder_name_masked: string;
  bank: string;
  risk_tier: string | null;
  linked_case_id: string | null;
}

export interface MuleTraceHop {
  role: "layer_mule" | "terminal_mule";
  from_role: "victim" | "layer_mule";
  step: number;
  from_account: string | null;
  from_bank: string | null;
  to_account: string | null;
  to_bank: string | null;
  amount: number | null;
  velocity_min: number | null;
  elapsed_min: number | null;
  layer_number: number;
  transaction_id: string | null;
  location: string | null;
}

export interface MuleTraceResponse {
  case_id: string | null;
  alert_id: string | null;
  account_id: string;
  trace_source?: string;
  graph_status?: string;
  status_reason?: string | null;
  origin: { account_id: string; role: "victim" } | null;
  status: "SUCCESS" | "EMPTY";
  kpis: {
    hops_traced: number;
    fan_out_factor: number | null;
    total_flow_value: number | null;
    layering_time_min: number | null;
    terminal_mule_count: number;
  };
  hops: MuleTraceHop[];
  transactions: MuleRingTransaction[];
  predicted_terminal: { node_id: string; lat: number; lon: number; confidence_pct: number } | null;
}

export interface MuleFingerprintResponse {
  status?: "SUCCESS" | "UNAVAILABLE";
  reason?: string;
  patterns: Array<{
    pattern_name: string;
    match_confidence: number | null;
    matching_features: string[];
  }>;
}

export interface MulePredictedTerminalsResponse {
  status?: "SUCCESS" | "EMPTY" | "UNAVAILABLE";
  reason?: string;
  candidates: Array<{
    rank: number;
    node_id: string;
    distance_from_corridor_km: number | null;
    confidence_pct: number | null;
  }>;
}
