import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { client, extractList } from "./router-DXMls9-H.mjs";
function normalizeDate$1(raw) {
  if (raw == null) return void 0;
  if (typeof raw === "number" && !Number.isNaN(raw)) return raw;
  if (typeof raw === "string") {
    const parsed = Date.parse(raw);
    return Number.isNaN(parsed) ? void 0 : parsed;
  }
  return void 0;
}
function normalizeAccount(raw) {
  const id = String(raw?.id ?? raw?.account_id ?? raw?.user_id ?? "");
  const openedAt = normalizeDate$1(raw?.openedAt ?? raw?.opened_at ?? raw?.createdAt ?? raw?.created_at) ?? Date.now();
  return {
    id,
    name: raw?.name ?? raw?.customer_name ?? raw?.account_name ?? id,
    country: raw?.country ?? raw?.country_code ?? raw?.residence_country,
    openedAt,
    createdAt: openedAt,
    riskTier: raw?.riskTier ?? raw?.risk_tier ?? raw?.riskLevel ?? raw?.risk_level ?? raw?.tier,
    riskScore: Number(raw?.riskScore ?? raw?.risk_score ?? raw?.onboarding_risk_score ?? raw?.final_risk_score ?? 0),
    deviceTrust: Number(raw?.deviceTrust ?? raw?.device_trust ?? 0),
    onboardingRisk: Number(raw?.onboardingRisk ?? raw?.onboarding_risk ?? 0),
    graphProximity: Number(raw?.graphProximity ?? raw?.graph_proximity ?? 0),
    simRisk: Number(raw?.simRisk ?? raw?.sim_risk ?? 0),
    vpnRisk: Number(raw?.vpnRisk ?? raw?.vpn_risk ?? 0),
    suspiciousTransfers30d: Number(raw?.suspiciousTransfers30d ?? raw?.suspicious_transfers_30d ?? 0),
    sanctionsHit: Boolean(raw?.sanctionsHit ?? raw?.sanctions_hit ?? false),
    pep: Boolean(raw?.pep ?? raw?.pep_hit ?? false),
    balance: raw?.balance != null ? Number(raw.balance) : void 0,
    linkedDeviceId: raw?.linkedDeviceId ?? raw?.linked_device_id,
    lastActivity: raw?.lastActivity ?? raw?.last_activity ? Number(raw.lastActivity ?? raw.last_activity) : void 0,
    kyc_status: raw?.kyc_status ?? raw?.kycStatus,
    kyc_city: raw?.kyc_city ?? raw?.kycCity,
    created_at: raw?.created_at ?? raw?.createdAt,
    device_id: raw?.device_id ?? raw?.deviceId,
    device_model_name: raw?.device_model_name ?? raw?.deviceModelName,
    device_year: Number(raw?.device_year ?? raw?.deviceYear ?? 0) || void 0,
    root_status: raw?.root_status ?? raw?.rootStatus,
    app_cloner_flag: raw?.app_cloner_flag ?? raw?.appClonerFlag,
    ip_address: raw?.ip_address ?? raw?.ipAddress,
    vpn_detected: raw?.vpn_detected ?? raw?.vpnDetected,
    isp_name: raw?.isp_name ?? raw?.ispName,
    registered_imsi: raw?.registered_imsi ?? raw?.registeredImsi,
    current_imsi: raw?.current_imsi ?? raw?.currentImsi,
    sim_present: raw?.sim_present ?? raw?.simPresent,
    sim_slot_count: Number(raw?.sim_slot_count ?? raw?.simSlotCount ?? 0) || void 0,
    biometric_enabled: raw?.biometric_enabled ?? raw?.biometricEnabled,
    onboarding_speed_ms: Number(raw?.onboarding_speed_ms ?? raw?.onboardingSpeedMs ?? 0) || void 0,
    identity_trust_score: Number(raw?.identity_trust_score ?? raw?.identityTrustScore ?? 0) || void 0,
    device_trust_score: Number(raw?.device_trust_score ?? raw?.deviceTrustScore ?? 0) || void 0,
    sim_binding_ok: Number(raw?.sim_binding_ok ?? raw?.simBindingOk ?? 0) || void 0,
    sim_swap_flag: Number(raw?.sim_swap_flag ?? raw?.simSwapFlag ?? 0) || void 0,
    sim_age_days: Number(raw?.sim_age_days ?? raw?.simAgeDays ?? 0) || void 0,
    multi_sim_flag: Number(raw?.multi_sim_flag ?? raw?.multiSimFlag ?? 0) || void 0,
    vpn_flag: Number(raw?.vpn_flag ?? raw?.vpnFlag ?? 0) || void 0,
    ip_risk_score: Number(raw?.ip_risk_score ?? raw?.ipRiskScore ?? 0) || void 0,
    device_age_years: Number(raw?.device_age_years ?? raw?.deviceAgeYears ?? 0) || void 0,
    device_age_days: Number(raw?.device_age_days ?? raw?.deviceAgeDays ?? 0) || void 0,
    device_shared_count: Number(raw?.device_shared_count ?? raw?.deviceSharedCount ?? 0) || void 0,
    emulator_flag: Number(raw?.emulator_flag ?? raw?.emulatorFlag ?? 0) || void 0,
    face_match_score: Number(raw?.face_match_score ?? raw?.faceMatchScore ?? 0) || void 0,
    sanction_hit: Number(raw?.sanction_hit ?? raw?.sanctionHit ?? 0) || void 0,
    pep_hit: Number(raw?.pep_hit ?? raw?.pepHit ?? 0) || void 0,
    typing_speed: Number(raw?.typing_speed ?? raw?.typingSpeed ?? 0) || void 0,
    form_completion_time: Number(raw?.form_completion_time ?? raw?.formCompletionTime ?? 0) || void 0,
    copy_paste_ratio: Number(raw?.copy_paste_ratio ?? raw?.copyPasteRatio ?? 0) || void 0,
    otp_retry_count: Number(raw?.otp_retry_count ?? raw?.otpRetryCount ?? 0) || void 0,
    onboarding_risk_score: Number(raw?.onboarding_risk_score ?? raw?.onboardingRiskScore ?? raw?.final_risk_score ?? 0) || void 0,
    risk_level: raw?.risk_level ?? raw?.riskLevel,
    decision: raw?.decision,
    requires_review: raw?.requires_review ?? raw?.requiresReview,
    requires_block: raw?.requires_block ?? raw?.requiresBlock,
    requires_edd: raw?.requires_edd ?? raw?.requiresEdd,
    explainability: Array.isArray(raw?.explainability) ? raw.explainability : raw?.explainability ? [String(raw.explainability)] : void 0,
    suspicious_relationships: Array.isArray(raw?.suspicious_relationships) ? raw.suspicious_relationships : void 0
  };
}
function extractAccounts(raw) {
  return extractList(raw).map(normalizeAccount);
}
async function fetchAccounts(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.limit != null) searchParams.set("limit", String(params.limit));
  if (params.offset != null) searchParams.set("offset", String(params.offset));
  if (params.search) searchParams.set("search", params.search);
  if (params.risk) searchParams.set("risk", params.risk);
  const path = `/api/accounts${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const raw = await client.request({ path });
  const results = extractAccounts(raw);
  return {
    total: raw?.total ?? results.length,
    count: raw?.count ?? results.length,
    offset: raw?.offset ?? 0,
    limit: raw?.limit ?? results.length,
    results
  };
}
async function fetchAccountById(id) {
  const raw = await client.request({ path: `/api/accounts/${encodeURIComponent(id)}` });
  return normalizeAccountById(raw);
}
function normalizeDate(raw) {
  if (raw == null) return void 0;
  if (typeof raw === "number" && !Number.isNaN(raw)) return raw;
  if (typeof raw === "string") {
    const parsed = Date.parse(raw);
    return Number.isNaN(parsed) ? void 0 : parsed;
  }
  return void 0;
}
function normalizeAccountById(raw) {
  const id = String(raw?.id ?? raw?.account_id ?? raw?.user_id ?? "");
  const createdAtRaw = raw?.openedAt ?? raw?.opened_at ?? raw?.createdAt ?? raw?.created_at;
  const openedAt = normalizeDate(createdAtRaw) ?? Date.now();
  const riskScore = Number(raw?.riskScore ?? raw?.risk_score ?? raw?.onboarding_risk_score ?? raw?.final_risk_score ?? 0);
  return {
    id,
    name: raw?.name ?? raw?.customer_name ?? raw?.account_name ?? id,
    country: raw?.country ?? raw?.country_code ?? raw?.residence_country,
    openedAt,
    createdAt: openedAt,
    riskTier: raw?.riskTier ?? raw?.risk_tier ?? raw?.riskLevel ?? raw?.risk_level,
    riskScore,
    deviceTrust: Number(raw?.deviceTrust ?? raw?.device_trust ?? 0),
    onboardingRisk: Number(raw?.onboardingRisk ?? raw?.onboarding_risk ?? 0),
    graphProximity: Number(raw?.graphProximity ?? raw?.graph_proximity ?? 0),
    simRisk: Number(raw?.simRisk ?? raw?.sim_risk ?? 0),
    vpnRisk: Number(raw?.vpnRisk ?? raw?.vpn_risk ?? 0),
    suspiciousTransfers30d: Number(raw?.suspiciousTransfers30d ?? raw?.suspicious_transfers_30d ?? 0),
    sanctionsHit: Boolean(raw?.sanctionsHit ?? raw?.sanctions_hit ?? false),
    pep: Boolean(raw?.pep ?? raw?.pep_hit ?? false),
    balance: raw?.balance != null ? Number(raw.balance) : void 0,
    linkedDeviceId: raw?.linkedDeviceId ?? raw?.linked_device_id,
    lastActivity: raw?.lastActivity ?? raw?.last_activity ? Number(raw.lastActivity ?? raw.last_activity) : void 0,
    kyc_status: raw?.kyc_status ?? raw?.kycStatus,
    kyc_city: raw?.kyc_city ?? raw?.kycCity,
    created_at: raw?.created_at ?? raw?.createdAt,
    device_id: raw?.device_id ?? raw?.deviceId,
    device_model_name: raw?.device_model_name ?? raw?.deviceModelName,
    device_year: Number(raw?.device_year ?? raw?.deviceYear ?? 0) || void 0,
    root_status: raw?.root_status ?? raw?.rootStatus,
    app_cloner_flag: raw?.app_cloner_flag ?? raw?.appClonerFlag,
    ip_address: raw?.ip_address ?? raw?.ipAddress,
    vpn_detected: raw?.vpn_detected ?? raw?.vpnDetected,
    isp_name: raw?.isp_name ?? raw?.ispName,
    registered_imsi: raw?.registered_imsi ?? raw?.registeredImsi,
    current_imsi: raw?.current_imsi ?? raw?.currentImsi,
    sim_present: raw?.sim_present ?? raw?.simPresent,
    sim_slot_count: Number(raw?.sim_slot_count ?? raw?.simSlotCount ?? 0) || void 0,
    biometric_enabled: raw?.biometric_enabled ?? raw?.biometricEnabled,
    onboarding_speed_ms: Number(raw?.onboarding_speed_ms ?? raw?.onboardingSpeedMs ?? 0) || void 0,
    identity_trust_score: Number(raw?.identity_trust_score ?? raw?.identityTrustScore ?? 0) || void 0,
    device_trust_score: Number(raw?.device_trust_score ?? raw?.deviceTrustScore ?? 0) || void 0,
    sim_binding_ok: Number(raw?.sim_binding_ok ?? raw?.simBindingOk ?? 0) || void 0,
    sim_swap_flag: Number(raw?.sim_swap_flag ?? raw?.simSwapFlag ?? 0) || void 0,
    sim_age_days: Number(raw?.sim_age_days ?? raw?.simAgeDays ?? 0) || void 0,
    multi_sim_flag: Number(raw?.multi_sim_flag ?? raw?.multiSimFlag ?? 0) || void 0,
    vpn_flag: Number(raw?.vpn_flag ?? raw?.vpnFlag ?? 0) || void 0,
    ip_risk_score: Number(raw?.ip_risk_score ?? raw?.ipRiskScore ?? 0) || void 0,
    device_age_years: Number(raw?.device_age_years ?? raw?.deviceAgeYears ?? 0) || void 0,
    device_age_days: Number(raw?.device_age_days ?? raw?.deviceAgeDays ?? 0) || void 0,
    device_shared_count: Number(raw?.device_shared_count ?? raw?.deviceSharedCount ?? 0) || void 0,
    emulator_flag: Number(raw?.emulator_flag ?? raw?.emulatorFlag ?? 0) || void 0,
    face_match_score: Number(raw?.face_match_score ?? raw?.faceMatchScore ?? 0) || void 0,
    sanction_hit: Number(raw?.sanction_hit ?? raw?.sanctionHit ?? 0) || void 0,
    pep_hit: Number(raw?.pep_hit ?? raw?.pepHit ?? 0) || void 0,
    typing_speed: Number(raw?.typing_speed ?? raw?.typingSpeed ?? 0) || void 0,
    form_completion_time: Number(raw?.form_completion_time ?? raw?.formCompletionTime ?? 0) || void 0,
    copy_paste_ratio: Number(raw?.copy_paste_ratio ?? raw?.copyPasteRatio ?? 0) || void 0,
    otp_retry_count: Number(raw?.otp_retry_count ?? raw?.otpRetryCount ?? 0) || void 0,
    onboarding_risk_score: Number(raw?.onboarding_risk_score ?? raw?.onboardingRiskScore ?? raw?.final_risk_score ?? 0) || void 0,
    risk_level: raw?.risk_level ?? raw?.riskLevel,
    decision: raw?.decision,
    requires_review: raw?.requires_review ?? raw?.requiresReview,
    requires_block: raw?.requires_block ?? raw?.requiresBlock,
    requires_edd: raw?.requires_edd ?? raw?.requiresEdd,
    final_risk_score: raw?.final_risk_score != null ? Number(raw.final_risk_score) : raw?.finalRiskScore != null ? Number(raw.finalRiskScore) : raw?.onboarding_risk_score != null ? Number(raw.onboarding_risk_score) : void 0,
    confidence: raw?.confidence != null ? Number(raw.confidence) : raw?.confidence_score != null ? Number(raw.confidence_score) : void 0,
    officer_recommendation: raw?.officer_recommendation ?? raw?.officerRecommendation,
    reasons: raw?.reasons ?? raw?.explainability_reason,
    explainability: Array.isArray(raw?.explainability) ? raw.explainability : raw?.explainability ? [String(raw.explainability)] : void 0,
    suspicious_relationships: Array.isArray(raw?.suspicious_relationships) ? raw.suspicious_relationships : void 0
  };
}
function useAccountList(params = {}) {
  return useQuery({ queryKey: ["accounts", "list", params], queryFn: () => fetchAccounts(params), staleTime: 6e4, retry: 2 });
}
function useAccount(id) {
  return useQuery({ queryKey: ["accounts", id], queryFn: () => fetchAccountById(id), enabled: !!id, staleTime: 6e4 });
}
export {
  useAccountList as a,
  useAccount as u
};
