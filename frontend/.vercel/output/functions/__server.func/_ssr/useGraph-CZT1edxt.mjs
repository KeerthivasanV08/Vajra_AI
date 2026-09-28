import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { client, extractGraphPayload } from "./router-DXMls9-H.mjs";
function safeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}
function assignCoordinates(nodes) {
  const count = nodes.length;
  if (!count) return nodes;
  const centerX = 500;
  const centerY = 300;
  const radius = 200;
  return nodes.map((node, index) => {
    if (typeof node.x === "number" && typeof node.y === "number") return node;
    const angle = index / count * Math.PI * 2;
    return {
      ...node,
      x: typeof node.x === "number" ? node.x : Math.round(centerX + radius * Math.cos(angle)),
      y: typeof node.y === "number" ? node.y : Math.round(centerY + radius * Math.sin(angle))
    };
  });
}
function normalizeGraph(raw) {
  const payload = extractGraphPayload(raw);
  const nodes = payload.nodes.map((node) => ({
    id: String(node?.id ?? node?.node_id ?? node?.entity_id ?? node?.label ?? ""),
    label: node?.label ?? node?.name ?? String(node?.id ?? node?.node_id ?? node?.entity_id ?? ""),
    type: node?.type ?? node?.node_type ?? node?.entity_type,
    role: node?.role ?? node?.network_role ?? node?.category,
    risk: safeNumber(node?.risk ?? node?.risk_level ?? node?.riskScore ?? node?.score ?? 0),
    riskScore: safeNumber(node?.riskScore ?? node?.risk ?? node?.risk_level ?? node?.score ?? 0),
    riskLevel: node?.riskLevel ?? node?.risk_level,
    x: node?.x != null ? safeNumber(node.x) : void 0,
    y: node?.y != null ? safeNumber(node.y) : void 0,
    volume: node?.volume != null ? safeNumber(node.volume) : void 0,
    cluster: node?.cluster != null ? safeNumber(node.cluster) : void 0
  }));
  const positioned = assignCoordinates(nodes);
  const edges = payload.edges.map((edge) => ({
    source: String(edge?.source ?? edge?.from ?? edge?.source_id ?? edge?.from_id ?? ""),
    target: String(edge?.target ?? edge?.to ?? edge?.target_id ?? edge?.to_id ?? ""),
    weight: edge?.weight != null ? safeNumber(edge.weight) : void 0,
    amount: edge?.amount != null ? safeNumber(edge.amount) : void 0,
    suspicious: Boolean(edge?.suspicious ?? false)
  })).filter((edge) => edge.source && edge.target);
  const circularFlows = Array.isArray(payload.circularFlows) ? payload.circularFlows.map((flow) => ({
    path: Array.isArray(flow?.path) ? flow.path.map((item) => String(item)) : [],
    score: flow?.score != null ? safeNumber(flow.score) : void 0,
    label: flow?.label ? String(flow.label) : void 0
  })).filter((flow) => flow.path.length > 0) : [];
  const clusterSummaries = Array.isArray(payload.clusterSummaries) ? payload.clusterSummaries.map((summary) => ({
    id: safeNumber(summary?.id, 0),
    name: summary?.name ? String(summary.name) : `Cluster ${safeNumber(summary?.id, 0)}`,
    accounts: safeNumber(summary?.accounts, 0),
    totalRiskScore: safeNumber(summary?.totalRiskScore, 0),
    avgRisk: safeNumber(summary?.avgRisk, 0),
    hasCircularFlow: Boolean(summary?.hasCircularFlow ?? false),
    color: summary?.color ? String(summary.color) : void 0
  })) : [];
  return {
    nodes: positioned,
    edges,
    circularFlows,
    clusterSummaries,
    selectedAccount: typeof payload.selectedAccount === "string" ? payload.selectedAccount : void 0,
    updatedAt: typeof payload.updatedAt === "string" ? payload.updatedAt : void 0,
    metadata: payload.metadata && typeof payload.metadata === "object" ? payload.metadata : void 0
  };
}
async function fetchGraph() {
  return fetchGraphNetwork();
}
async function fetchGraphNetwork() {
  const raw = await client.request({ path: "/api/graph/network" });
  return normalizeGraph(raw);
}
async function fetchAccountGraph(id) {
  try {
    const raw = await client.request({ path: `/api/graph/account/${encodeURIComponent(id)}` });
    return normalizeGraph(raw);
  } catch {
    return fetchGraphNetwork();
  }
}
function useGraph() {
  return useQuery({ queryKey: ["graph", "network"], queryFn: fetchGraphNetwork, staleTime: 3e4, retry: 2 });
}
function useGraphSnapshot() {
  return useQuery({ queryKey: ["graph", "snapshot"], queryFn: fetchGraph, staleTime: 6e4 });
}
function useAccountGraph(id) {
  return useQuery({ queryKey: ["graph", "account", id], queryFn: () => fetchAccountGraph(id), enabled: !!id, staleTime: 3e4 });
}
export {
  useGraph as a,
  useGraphSnapshot as b,
  useAccountGraph as u
};
