import { client } from "./router-DXMls9-H.mjs";
import { e as extractCases, n as normalizeCase } from "./caseNormalizer-BzVobBFG.mjs";
async function fetchCases() {
  const raw = await client.request({ path: "/api/cases" });
  return extractCases(raw);
}
async function createCase(payload) {
  const raw = await client.request({ method: "POST", path: "/api/cases/create", body: payload });
  return normalizeCase(raw);
}
async function assignCase(id, officerId) {
  return client.request({ method: "POST", path: `/api/cases/${encodeURIComponent(id)}/assign`, body: { officerId } });
}
async function freezeCase(id) {
  return client.request({ method: "POST", path: `/api/cases/${encodeURIComponent(id)}/freeze` });
}
async function sarCase(id) {
  return client.request({ method: "POST", path: `/api/cases/${encodeURIComponent(id)}/sar`, body: { evidence: "SAR_REQUESTED" } });
}
export {
  assignCase as a,
  freezeCase as b,
  createCase as c,
  fetchCases as f,
  sarCase as s
};
