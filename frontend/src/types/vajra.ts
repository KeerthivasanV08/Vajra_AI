"""
VAJRA Platform Core TypeScript Interfaces & Schemas
"""

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
  created_at: string;
  issuing_officer: string;
  evidence_sha256: string;
  integrity_verified: boolean;
  sections: {
    complaint: Record<string, any>;
    transaction_trail: Record<string, any>;
    prediction: Record<string, any>;
    preservation_directives: Record<string, any>;
  };
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
    status: 'REVIEW' | 'WITHIN THRESHOLD' | 'REQUIRES INVESTIGATION';
  }>;
}

export interface SyndicateMatchResponse {
  account_id: string;
  pattern_name: string;
  confidence: number;
  matched_tags: Array<{
    tag: string;
    investigative_only: boolean;
  }>;
  summary: string;
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
