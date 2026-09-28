import { client } from "./router-DXMls9-H.mjs";
async function review(payload) {
  return client.request({ method: "POST", path: "/api/officer/review", body: payload });
}
async function freeze(payload) {
  return client.request({ method: "POST", path: "/api/officer/freeze", body: payload });
}
async function escalate(payload) {
  return client.request({ method: "POST", path: "/api/officer/escalate", body: payload });
}
async function sar(payload, timeoutMs = 6e4) {
  const caseId = payload?.case_id;
  if (caseId) {
    return client.request({
      method: "POST",
      path: `/api/officer/reports/generate-sar/case/${encodeURIComponent(String(caseId))}`,
      body: payload,
      timeoutMs
    });
  }
  const alertId = payload?.alert_id ?? payload?.alertId ?? payload?.source_alert ?? payload?.sourceAlert;
  if (alertId) {
    return client.request({
      method: "POST",
      path: `/api/officer/reports/generate-sar/alert/${encodeURIComponent(String(alertId))}`,
      body: payload,
      timeoutMs
    });
  }
  return client.request({ method: "POST", path: "/api/officer/sar", body: payload, timeoutMs });
}
async function whitelistOfficer(payload) {
  return client.request({ method: "POST", path: "/api/officer/whitelist", body: payload });
}
export {
  escalate as e,
  freeze as f,
  review as r,
  sar as s,
  whitelistOfficer as w
};
