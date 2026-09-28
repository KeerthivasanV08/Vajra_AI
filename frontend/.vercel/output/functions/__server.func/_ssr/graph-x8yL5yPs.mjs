import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { P as Panel } from "./Panel-CZ70JnZT.mjs";
import { useStore } from "./router-DXMls9-H.mjs";
import { a as useGraph } from "./useGraph-CZT1edxt.mjs";
import "../_libs/sonner.mjs";
import { J as Network, _ as ShieldAlert, a5 as TriangleAlert, U as RefreshCw } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
const ANIMATION_TIMING = {
  ZOOM_MIN: 0.3,
  ZOOM_MAX: 2
};
const HIGH_RISK_CLUSTER_THRESHOLD = 70;
function toFiniteNumber(value, fallback = 0) {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
function getRiskScore(node) {
  return toFiniteNumber(node.risk ?? node.riskScore ?? 0, 0);
}
function getRiskLevel(node) {
  const explicit = typeof node.riskLevel === "string" ? node.riskLevel.toLowerCase() : "";
  if (explicit === "high" || explicit === "medium" || explicit === "low") {
    return explicit;
  }
  const score = getRiskScore(node);
  if (score >= 75) return "high";
  if (score >= 45) return "medium";
  return "low";
}
function getNodeRadius(riskLevel) {
  if (riskLevel === "high") return 28;
  if (riskLevel === "medium") return 18;
  return 15;
}
function getNodeFill(riskLevel) {
  if (riskLevel === "high") return "#ef4444";
  if (riskLevel === "medium") return "#f59e0b";
  return "#22c55e";
}
function getNodeGlow(riskLevel) {
  if (riskLevel === "high") return "drop-shadow(0 0 12px rgba(239,68,68,0.75))";
  if (riskLevel === "medium") return "drop-shadow(0 0 10px rgba(245,158,11,0.45))";
  return "drop-shadow(0 0 8px rgba(34,197,94,0.35))";
}
function normalizeCluster(summary) {
  return {
    ...summary,
    id: toFiniteNumber(summary.id, 0),
    accounts: toFiniteNumber(summary.accounts, 0),
    totalRiskScore: toFiniteNumber(summary.totalRiskScore, 0),
    avgRisk: toFiniteNumber(summary.avgRisk, 0)
  };
}
function layoutNodes(nodes, width, height) {
  if (!nodes.length) {
    return [];
  }
  const safeWidth = Math.max(width, 1);
  const safeHeight = Math.max(height, 1);
  const withCoords = nodes.filter((node) => Number.isFinite(node.x) && Number.isFinite(node.y));
  if (withCoords.length > 0) {
    const xs = withCoords.map((node) => toFiniteNumber(node.x, 0));
    const ys = withCoords.map((node) => toFiniteNumber(node.y, 0));
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const spanX = Math.max(maxX - minX, 1);
    const spanY = Math.max(maxY - minY, 1);
    const padding = Math.max(96, Math.min(safeWidth, safeHeight) * 0.12);
    const scale = Math.min((safeWidth - padding * 2) / spanX, (safeHeight - padding * 2) / spanY);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    return nodes.map((node, index) => {
      if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) {
        return placeFallbackNode(node, index, nodes.length, safeWidth, safeHeight);
      }
      const riskLevel = getRiskLevel(node);
      let x = (toFiniteNumber(node.x, 0) - centerX) * scale + safeWidth / 2;
      let y = (toFiniteNumber(node.y, 0) - centerY) * scale + safeHeight / 2;
      const offsetX = x - safeWidth / 2;
      const offsetY = y - safeHeight / 2;
      const distance = Math.hypot(offsetX, offsetY) || 1;
      const pull = riskLevel === "high" ? -0.12 : riskLevel === "medium" ? -0.05 : 0.04;
      const nudge = Math.min(safeWidth, safeHeight) * 0.08 * pull;
      x += offsetX / distance * nudge;
      y += offsetY / distance * nudge;
      return {
        ...node,
        x: clamp(x, 56, safeWidth - 56),
        y: clamp(y, 56, safeHeight - 56)
      };
    });
  }
  return nodes.slice().sort((left, right) => getRiskScore(right) - getRiskScore(left)).map((node, index, ordered) => placeFallbackNode(node, index, ordered.length, safeWidth, safeHeight));
}
function placeFallbackNode(node, index, total, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;
  const baseRadius = Math.min(width, height) * 0.46;
  const riskLevel = getRiskLevel(node);
  const radiusMultiplier = riskLevel === "high" ? 0.42 : riskLevel === "medium" ? 0.68 : 0.92;
  const radius = baseRadius * radiusMultiplier;
  const angle = Math.PI * 2 * index / Math.max(total, 1) - Math.PI / 2;
  return {
    ...node,
    x: clamp(centerX + Math.cos(angle) * radius, 56, width - 56),
    y: clamp(centerY + Math.sin(angle) * radius, 56, height - 56)
  };
}
function buildAdjacency(edges) {
  const adjacency = /* @__PURE__ */ new Map();
  for (const edge of edges) {
    const sourceNeighbors = adjacency.get(edge.source) ?? /* @__PURE__ */ new Set();
    sourceNeighbors.add(edge.target);
    adjacency.set(edge.source, sourceNeighbors);
    const targetNeighbors = adjacency.get(edge.target) ?? /* @__PURE__ */ new Set();
    targetNeighbors.add(edge.source);
    adjacency.set(edge.target, targetNeighbors);
  }
  return adjacency;
}
function buildCircularEdgeKeys(circularFlows) {
  const keys = /* @__PURE__ */ new Set();
  for (const flow of circularFlows) {
    for (let index = 0; index < flow.path.length - 1; index += 1) {
      keys.add(`${flow.path[index]}->${flow.path[index + 1]}`);
    }
  }
  return keys;
}
function useViewportSize() {
  const ref = reactExports.useRef(null);
  const [size, setSize] = reactExports.useState({ width: 1200, height: 680 });
  reactExports.useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setSize({ width: Math.round(rect.width), height: Math.round(rect.height) });
      }
    };
    updateSize();
    const observer = new ResizeObserver(() => updateSize());
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, size };
}
function NetworkGraph({
  nodes,
  edges,
  circularFlows,
  clusterSummaries,
  onSelectNode,
  selectedNodeId,
  riskFilter,
  showCircularOnly,
  showHighRiskClusters
}) {
  const { ref, size } = useViewportSize();
  const [hoveredNodeId, setHoveredNodeId] = reactExports.useState(null);
  const [localSelectedNodeId, setLocalSelectedNodeId] = reactExports.useState(null);
  const [zoom, setZoom] = reactExports.useState(1);
  const [pan, setPan] = reactExports.useState({ x: 0, y: 0 });
  const [dragging, setDragging] = reactExports.useState(false);
  const [dragStart, setDragStart] = reactExports.useState({ x: 0, y: 0 });
  reactExports.useEffect(() => {
    if (selectedNodeId) {
      setLocalSelectedNodeId(selectedNodeId);
    }
  }, [selectedNodeId]);
  const normalizedClusters = reactExports.useMemo(() => clusterSummaries.map(normalizeCluster), [clusterSummaries]);
  const laidOutNodes = reactExports.useMemo(() => {
    return layoutNodes(
      nodes.map((node) => ({
        ...node,
        volume: toFiniteNumber(node.volume, 0),
        cluster: toFiniteNumber(node.cluster, 0)
      })),
      size.width,
      size.height
    ).map((node) => ({
      ...node,
      riskLevel: getRiskLevel(node)
    }));
  }, [nodes, size.width, size.height]);
  const circularNodeIds = reactExports.useMemo(() => new Set(circularFlows.flatMap((flow) => flow.path)), [circularFlows]);
  const circularEdgeKeys = reactExports.useMemo(() => buildCircularEdgeKeys(circularFlows), [circularFlows]);
  const visibleNodes = reactExports.useMemo(() => {
    let nextNodes = riskFilter && riskFilter !== "all" ? laidOutNodes.filter((node) => node.riskLevel === riskFilter) : [...laidOutNodes];
    if (showHighRiskClusters) {
      const highRiskClusterIds = new Set(
        normalizedClusters.filter((summary) => summary.avgRisk >= HIGH_RISK_CLUSTER_THRESHOLD).map((summary) => summary.id)
      );
      nextNodes = nextNodes.filter((node) => highRiskClusterIds.has(toFiniteNumber(node.cluster, 0)));
    }
    if (showCircularOnly) {
      nextNodes = nextNodes.filter((node) => circularNodeIds.has(node.id));
    }
    return nextNodes;
  }, [laidOutNodes, riskFilter, showHighRiskClusters, showCircularOnly, circularNodeIds, normalizedClusters]);
  const visibleNodeIds = reactExports.useMemo(() => new Set(visibleNodes.map((node) => node.id)), [visibleNodes]);
  const visibleEdges = reactExports.useMemo(() => {
    return edges.filter((edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target));
  }, [edges, visibleNodeIds]);
  const adjacency = reactExports.useMemo(() => buildAdjacency(visibleEdges), [visibleEdges]);
  const focusNodeId = hoveredNodeId ?? localSelectedNodeId ?? selectedNodeId ?? null;
  const activeNode = reactExports.useMemo(() => {
    if (!focusNodeId) {
      return null;
    }
    return visibleNodes.find((node) => node.id === focusNodeId) ?? null;
  }, [focusNodeId, visibleNodes]);
  reactExports.useMemo(() => {
    if (!activeNode) {
      return null;
    }
    const related = /* @__PURE__ */ new Set([activeNode.id]);
    for (const neighbor of adjacency.get(activeNode.id) ?? []) {
      related.add(neighbor);
    }
    return related;
  }, [activeNode, adjacency]);
  const selectedNode = activeNode ?? null;
  const tooltipNode = hoveredNodeId ? visibleNodes.find((node) => node.id === hoveredNodeId) ?? null : null;
  const tooltipPosition = tooltipNode ? {
    left: clamp(toFiniteNumber(tooltipNode.x, 0) * zoom + pan.x + 18, 16, Math.max(16, size.width - 220)),
    top: clamp(toFiniteNumber(tooltipNode.y, 0) * zoom + pan.y - 74, 16, Math.max(16, size.height - 120))
  } : null;
  const handleNodeClick = reactExports.useCallback((node) => {
    setLocalSelectedNodeId(node.id);
    onSelectNode?.(node);
  }, [onSelectNode]);
  const handleMouseDown = (event) => {
    const target = event.target;
    if (target === event.currentTarget || target.tagName === "svg") {
      setDragging(true);
      setDragStart({ x: event.clientX - pan.x, y: event.clientY - pan.y });
    }
  };
  const handleMouseMove = (event) => {
    if (dragging) {
      setPan({ x: event.clientX - dragStart.x, y: event.clientY - dragStart.y });
    }
  };
  const handleMouseUp = () => setDragging(false);
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  const activeConnectedNodeIds = reactExports.useMemo(() => {
    if (!selectedNode) {
      return null;
    }
    const ids = /* @__PURE__ */ new Set([selectedNode.id]);
    for (const neighbor of adjacency.get(selectedNode.id) ?? []) {
      ids.add(neighbor);
    }
    return ids;
  }, [selectedNode, adjacency]);
  if (nodes.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full w-full items-center justify-center text-sm text-muted-foreground", children: "No graph data available yet" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref, className: "relative h-full w-full overflow-hidden bg-[#111821]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "pointer-events-none absolute inset-0",
        style: {
          backgroundImage: [
            "radial-gradient(circle at center, rgba(59,130,246,0.10), transparent 34%)",
            "linear-gradient(180deg, rgba(15,23,42,0.96), rgba(2,6,23,0.99))",
            "linear-gradient(rgba(148,163,184,0.05) 1px, transparent 1px)",
            "linear-gradient(90deg, rgba(148,163,184,0.05) 1px, transparent 1px)"
          ].join(", "),
          backgroundSize: "100% 100%, 100% 100%, 64px 64px, 64px 64px",
          backgroundPosition: "center"
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-3 top-3 z-20 flex flex-col gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => setZoom((next) => Math.min(ANIMATION_TIMING.ZOOM_MAX, next + 0.12)),
          className: "flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-slate-950/75 text-lg font-semibold text-slate-100 shadow-lg backdrop-blur-sm transition hover:border-slate-400/50 hover:bg-slate-900",
          "aria-label": "Zoom in",
          children: "+"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => setZoom((next) => Math.max(ANIMATION_TIMING.ZOOM_MIN, next - 0.12)),
          className: "flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-slate-950/75 text-lg font-semibold text-slate-100 shadow-lg backdrop-blur-sm transition hover:border-slate-400/50 hover:bg-slate-900",
          "aria-label": "Zoom out",
          children: "-"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: resetView,
          className: "flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-slate-950/75 text-xs font-semibold uppercase tracking-[0.18em] text-slate-100 shadow-lg backdrop-blur-sm transition hover:border-slate-400/50 hover:bg-slate-900",
          "aria-label": "Reset zoom",
          children: "R"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "svg",
      {
        width: "100%",
        height: "100%",
        viewBox: `0 0 ${size.width} ${size.height}`,
        preserveAspectRatio: "xMidYMid meet",
        className: "absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing",
        onMouseDown: handleMouseDown,
        onMouseMove: handleMouseMove,
        onMouseUp: handleMouseUp,
        onMouseLeave: handleMouseUp,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("defs", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("pattern", { id: "graph-grid", width: "64", height: "64", patternUnits: "userSpaceOnUse", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M 64 0 L 0 0 0 64", fill: "none", stroke: "rgba(148,163,184,0.10)", strokeWidth: "1" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("radialGradient", { id: "graph-halo", cx: "50%", cy: "50%", r: "50%", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "rgba(59,130,246,0.16)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "70%", stopColor: "rgba(59,130,246,0.06)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "rgba(59,130,246,0)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "edge-muted", x1: "0%", y1: "0%", x2: "100%", y2: "0%", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "rgba(51,65,85,0.22)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "rgba(71,85,105,0.55)" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: 0, y: 0, width: size.width, height: size.height, fill: "#111821" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: 0, y: 0, width: size.width, height: size.height, fill: "url(#graph-grid)", opacity: 0.45 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ellipse", { cx: size.width / 2, cy: size.height / 2, rx: Math.min(size.width, size.height) * 0.42, ry: Math.min(size.width, size.height) * 0.34, fill: "url(#graph-halo)", opacity: 0.9 }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { transform: `translate(${pan.x}, ${pan.y}) scale(${zoom})`, children: [
            normalizedClusters.map((cluster) => {
              const clusterNodes = visibleNodes.filter((node) => toFiniteNumber(node.cluster, 0) === cluster.id);
              if (clusterNodes.length < 2) {
                return null;
              }
              const centerX = clusterNodes.reduce((sum, node) => sum + toFiniteNumber(node.x, 0), 0) / clusterNodes.length;
              const centerY = clusterNodes.reduce((sum, node) => sum + toFiniteNumber(node.y, 0), 0) / clusterNodes.length;
              const distances = clusterNodes.map((node) => Math.hypot(toFiniteNumber(node.x, 0) - centerX, toFiniteNumber(node.y, 0) - centerY));
              const spread = (distances.length ? Math.max(...distances) : 0) + 64;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                "ellipse",
                {
                  cx: centerX,
                  cy: centerY,
                  rx: spread * 1.16,
                  ry: spread * 0.86,
                  fill: cluster.color ?? "rgba(148,163,184,0.12)",
                  fillOpacity: 0.04,
                  stroke: cluster.color ?? "rgba(148,163,184,0.22)",
                  strokeOpacity: 0.2,
                  strokeWidth: 1.4,
                  strokeDasharray: "6 4"
                },
                cluster.id
              );
            }),
            visibleEdges.map((edge, index) => {
              const source = visibleNodes.find((node) => node.id === edge.source);
              const target = visibleNodes.find((node) => node.id === edge.target);
              if (!source || !target) {
                return null;
              }
              const isSuspicious = edge.suspicious || circularEdgeKeys.has(`${edge.source}->${edge.target}`);
              const isFocused = !selectedNode || edge.source === selectedNode.id || edge.target === selectedNode.id || activeConnectedNodeIds?.has(edge.source) && activeConnectedNodeIds?.has(edge.target);
              const stroke = isSuspicious ? "#ef4444" : "url(#edge-muted)";
              const strokeWidth = isSuspicious ? 2.5 : 1.4;
              const strokeOpacity = selectedNode ? isFocused ? isSuspicious ? 0.95 : 0.78 : 0.14 : isSuspicious ? 0.9 : 0.45;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                "line",
                {
                  x1: toFiniteNumber(source.x, 0),
                  y1: toFiniteNumber(source.y, 0),
                  x2: toFiniteNumber(target.x, 0),
                  y2: toFiniteNumber(target.y, 0),
                  stroke,
                  strokeWidth,
                  strokeOpacity,
                  strokeDasharray: isSuspicious ? "6 5" : void 0,
                  strokeLinecap: "round"
                },
                `${edge.source}-${edge.target}-${index}`
              );
            }),
            visibleNodes.map((node) => {
              const riskLevel = getRiskLevel(node);
              const radius = getNodeRadius(riskLevel);
              const isHovered = hoveredNodeId === node.id;
              const isSelected = selectedNode?.id === node.id;
              const isConnected = !selectedNode || selectedNode.id === node.id || activeConnectedNodeIds?.has(node.id);
              const connectedCount = adjacency.get(node.id)?.size ?? 0;
              const opacity = selectedNode ? isConnected ? 1 : 0.25 : hoveredNodeId && !isHovered ? 0.78 : 1;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { transform: `translate(${toFiniteNumber(node.x, 0)}, ${toFiniteNumber(node.y, 0)})`, opacity, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "circle",
                  {
                    r: radius + (isHovered || isSelected ? 9 : 6),
                    fill: "none",
                    stroke: riskLevel === "high" ? "rgba(239,68,68,0.34)" : riskLevel === "medium" ? "rgba(245,158,11,0.26)" : "rgba(34,197,94,0.22)",
                    strokeWidth: 2
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "circle",
                  {
                    r: radius + (riskLevel === "high" ? 16 : 12),
                    fill: riskLevel === "high" ? "rgba(239,68,68,0.12)" : riskLevel === "medium" ? "rgba(245,158,11,0.10)" : "rgba(34,197,94,0.08)"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "circle",
                  {
                    r: radius,
                    fill: getNodeFill(riskLevel),
                    stroke: isSelected ? "#f8fafc" : riskLevel === "high" ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.12)",
                    strokeWidth: isSelected ? 3 : 1.4,
                    style: { filter: getNodeGlow(riskLevel) },
                    className: "cursor-pointer transition-transform duration-150",
                    transform: isHovered ? "scale(1.08)" : isSelected ? "scale(1.05)" : "scale(1)",
                    onMouseEnter: () => setHoveredNodeId(node.id),
                    onMouseLeave: () => setHoveredNodeId(null),
                    onClick: () => handleNodeClick(node)
                  }
                ),
                riskLevel === "high" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "circle",
                  {
                    r: radius + 11,
                    fill: "none",
                    stroke: "rgba(239,68,68,0.95)",
                    strokeWidth: 1.5,
                    strokeDasharray: "4 3",
                    opacity: 0.72
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "text",
                  {
                    x: 0,
                    y: radius + 18,
                    textAnchor: "middle",
                    fill: "#cbd5e1",
                    stroke: "#020617",
                    strokeWidth: 3,
                    paintOrder: "stroke fill",
                    fontSize: 11,
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace",
                    fontWeight: 600,
                    opacity: selectedNode && !isConnected ? 0.45 : 1,
                    children: node.label ?? node.id
                  }
                ),
                isHovered && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "text",
                  {
                    x: 0,
                    y: -radius - 16,
                    textAnchor: "middle",
                    fill: "#dbeafe",
                    stroke: "#020617",
                    strokeWidth: 3,
                    paintOrder: "stroke fill",
                    fontSize: 10,
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace",
                    children: [
                      connectedCount,
                      " connections"
                    ]
                  }
                )
              ] }, node.id);
            })
          ] })
        ]
      }
    ),
    tooltipNode && tooltipPosition && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "pointer-events-none absolute z-20 w-[220px] rounded-lg border border-white/10 bg-slate-950/92 p-3 text-[11px] text-slate-100 shadow-2xl backdrop-blur-md",
        style: { left: tooltipPosition.left, top: tooltipPosition.top },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-[0.2em] text-slate-400", children: "Node inspection" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 font-semibold text-slate-50", children: tooltipNode.label ?? tooltipNode.id }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 font-mono text-[10px] text-slate-400", children: tooltipNode.id }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 grid grid-cols-2 gap-2 text-[10px] text-slate-300", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Risk: ",
              getRiskLevel(tooltipNode).toUpperCase()
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Score: ",
              Math.round(getRiskScore(tooltipNode))
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Role: ",
              tooltipNode.role ?? tooltipNode.type ?? "unknown"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Connected: ",
              adjacency.get(tooltipNode.id)?.size ?? 0
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pointer-events-none absolute bottom-3 left-3 z-20 flex flex-wrap gap-2 rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-[11px] text-slate-200 shadow-xl backdrop-blur-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LegendSwatch, { label: "High", color: "#ef4444" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LegendSwatch, { label: "Medium", color: "#f59e0b" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LegendSwatch, { label: "Low", color: "#22c55e" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2 text-slate-300", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-0.5 w-5 rounded-full bg-[#ef4444]", style: { boxShadow: "0 0 10px rgba(239,68,68,0.6)" } }),
        "Suspicious"
      ] })
    ] })
  ] });
}
function LegendSwatch({ label, color }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2 text-slate-300", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2.5 w-2.5 rounded-full", style: { backgroundColor: color, boxShadow: `0 0 10px ${color}66` } }),
    label
  ] });
}
const MAX_GRAPH_EDGES = 25;
function GraphPage() {
  const liveTransactions = useStore((state) => state.liveTransactions);
  const connected = useStore((state) => state.connected);
  const graphQ = useGraph();
  const restGraph = graphQ.data ?? null;
  const sseGraph = reactExports.useMemo(() => buildInvestigationGraph(liveTransactions), [liveTransactions]);
  const investigationGraph = reactExports.useMemo(() => {
    if (sseGraph.nodes.length > 0) return sseGraph;
    if (restGraph && restGraph.nodes && restGraph.nodes.length > 0) return restGraph;
    return sseGraph;
  }, [sseGraph, restGraph]);
  const [selectedNode, setSelectedNode] = reactExports.useState(null);
  const [riskFilter, setRiskFilter] = reactExports.useState("all");
  const [showCircularOnly, setShowCircularOnly] = reactExports.useState(false);
  const [showHighRiskClusters, setShowHighRiskClusters] = reactExports.useState(false);
  const [hydrated, setHydrated] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setHydrated(true);
  }, []);
  const summary = reactExports.useMemo(() => {
    const nodes = investigationGraph.nodes ?? [];
    const edges = investigationGraph.edges ?? [];
    const clusterSummaries = investigationGraph.clusterSummaries ?? [];
    const maxClusterRisk = clusterSummaries.length ? Math.max(...clusterSummaries.map((cluster) => cluster.avgRisk || 0)) : 0;
    return {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      clusterCount: clusterSummaries.length,
      circularCount: investigationGraph.circularFlows?.length ?? 0,
      maxClusterRisk
    };
  }, [investigationGraph]);
  const selected = selectedNode ?? (investigationGraph.selectedAccount ? investigationGraph.nodes.find((node) => node.id === investigationGraph.selectedAccount) ?? null : null);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-full space-y-4 bg-gradient-to-br from-background via-background to-background/90 p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Network, { className: "h-3.5 w-3.5 text-primary" }),
          "Neo4j Graph Intelligence"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 text-2xl font-semibold tracking-tight", children: "Investigation Graph" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Latest 25 transaction-linked Neo4j nodes for mule-ring, layering, shared infrastructure, and fraud proximity investigation." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs sm:grid-cols-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Nodes", value: summary.nodeCount }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Edges", value: summary.edgeCount }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Clusters", value: summary.clusterCount }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Circular", value: summary.circularCount, tone: "critical" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid min-h-0 gap-4 xl:grid-cols-[260px_minmax(760px,1fr)_320px] 2xl:grid-cols-[280px_minmax(900px,1fr)_360px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Filters", className: "min-h-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground", children: "Risk level" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: ["all", "high", "medium", "low"].map((level) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setRiskFilter(level), className: `h-8 rounded-md border px-2 text-[10px] uppercase tracking-[0.16em] transition ${riskFilter === level ? "border-primary bg-primary/15 text-primary" : "border-border bg-card/60 text-foreground"}`, children: level }, level)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Circular flows only", value: showCircularOnly, onChange: setShowCircularOnly }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "High-risk clusters only", value: showHighRiskClusters, onChange: setShowHighRiskClusters }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 border-t border-border pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-[0.18em] text-muted-foreground", children: "Graph Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-md border border-border bg-card/60 px-3 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-4 w-4 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: hydrated ? connected ? "SSE Connected" : "SSE Waiting" : "SSE Waiting" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: sseGraph.nodes.length > 0 ? `Live SSE graph (${sseGraph.nodes.length} nodes)` : restGraph?.nodes?.length ? `REST snapshot (${restGraph.nodes.length} nodes)` : "Awaiting graph data" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-md border border-border bg-card/60 px-3 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 text-warning" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium", children: [
                "Max cluster risk ",
                Math.round(summary.maxClusterRisk),
                "%"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: "Derived from latest 25 SSE transaction-linked nodes" })
            ] })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Mule Network Graph Explorer", subtitle: "Interactive transaction network · Click nodes to inspect accounts", className: "min-h-0", dense: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative h-[720px] min-h-[720px] w-full overflow-hidden rounded-xl border border-border bg-[#111821] xl:h-[calc(100vh-190px)] xl:min-h-[680px]", children: investigationGraph.nodes.length ? /* @__PURE__ */ jsxRuntimeExports.jsx(NetworkGraph, { nodes: investigationGraph.nodes, edges: investigationGraph.edges, circularFlows: investigationGraph.circularFlows ?? [], clusterSummaries: investigationGraph.clusterSummaries ?? [], selectedNodeId: selected?.id, onSelectNode: setSelectedNode, riskFilter, showCircularOnly, showHighRiskClusters }) : graphQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full items-center justify-center gap-3 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4 animate-spin" }),
        " Loading graph from backend…"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground", children: "No graph data available. Waiting for live SSE transactions or backend graph snapshot." }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Node Detail", className: "min-h-0", children: selected ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-[0.18em] text-muted-foreground", children: "Selected Node" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-lg font-semibold", children: selected.label ?? selected.id }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: selected.id })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Metric, { label: "Risk", value: Math.round(selected.risk ?? selected.riskScore ?? 0), tone: (selected.risk ?? selected.riskScore ?? 0) >= 75 ? "critical" : "warning" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Metric, { label: "Cluster", value: selected.cluster ?? 0 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Metric, { label: "Volume", value: Math.round(selected.volume ?? 0) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Metric, { label: "Role", value: selected.role ?? selected.type ?? "unknown" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-card/60 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-[0.18em] text-muted-foreground", children: "Graph Interpretation" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[12px] leading-5 text-muted-foreground", children: "This node is rendered from live Neo4j account and transfer data. Risk is derived from fraud proximity, layering, shared infrastructure, and community structure." })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full min-h-[18rem] items-center justify-center text-sm text-muted-foreground", children: "Select a node to inspect its graph signals." }) })
    ] })
  ] });
}
function buildInvestigationGraph(transactions) {
  if (!transactions.length) {
    return {
      nodes: [],
      edges: [],
      circularFlows: [],
      clusterSummaries: [],
      metadata: {
        status: "degraded",
        source: "sse-realtime"
      }
    };
  }
  const latestTransactions = [...transactions].sort((left, right) => getTransactionTime(right) - getTransactionTime(left)).slice(0, MAX_GRAPH_EDGES);
  const latestEdges = latestTransactions.map((transaction) => ({
    source: transaction.sender,
    target: transaction.receiver,
    amount: transaction.amount,
    weight: transaction.amount,
    suspicious: transaction.decision === "BLOCK" || transaction.riskScore >= 75,
    timestamp: transaction.createdAt ?? transaction.ts
  }));
  const nodesById = /* @__PURE__ */ new Map();
  const visibleNodeIds = /* @__PURE__ */ new Set();
  const visibleNodes = [];
  for (const transaction of latestTransactions) {
    const senderNode = buildTransactionNode(transaction, "sender");
    const receiverNode = buildTransactionNode(transaction, "receiver");
    for (const node of [senderNode, receiverNode]) {
      if (!node || visibleNodeIds.has(node.id)) continue;
      nodesById.set(node.id, node);
      visibleNodeIds.add(node.id);
      visibleNodes.push(node);
    }
  }
  for (const edge of latestEdges) {
    for (const nodeId of [edge.source, edge.target]) {
      if (visibleNodeIds.has(nodeId)) continue;
      const fallbackNode = nodesById.get(nodeId);
      if (!fallbackNode) continue;
      visibleNodeIds.add(nodeId);
      visibleNodes.push(fallbackNode);
    }
  }
  const filteredEdges = latestEdges.filter((edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target));
  const clusterSummaries = summarizeClusters(visibleNodes);
  const circularFlows = latestEdges.filter((edge) => edge.suspicious).map((edge) => ({
    path: [edge.source, edge.target],
    score: edge.amount
  })).filter((flow) => flow.path.every((nodeId) => visibleNodeIds.has(nodeId)));
  return {
    nodes: visibleNodes,
    edges: filteredEdges,
    circularFlows,
    clusterSummaries,
    metadata: {
      displayedNodeLimit: visibleNodes.length,
      displayedEdgeLimit: filteredEdges.length,
      displayMode: "latest-25-sse-transactions",
      source: "sse-realtime"
    }
  };
}
function buildTransactionNode(transaction, side) {
  const id = side === "sender" ? transaction.sender : transaction.receiver;
  const label = side === "sender" ? transaction.senderName ?? transaction.sender : transaction.receiverName ?? transaction.receiver;
  const riskScore = Number(transaction.riskScore ?? 0) || 0;
  const riskLevel = riskScore >= 75 ? "high" : riskScore >= 45 ? "medium" : "low";
  return {
    id,
    label,
    type: side,
    role: side === "sender" ? "SENDER" : "RECEIVER",
    risk: riskScore,
    riskScore,
    riskLevel,
    volume: transaction.amount,
    cluster: riskLevel === "high" ? 1 : riskLevel === "medium" ? 2 : 3
  };
}
function getTransactionTime(transaction) {
  const candidate = transaction.createdAt ?? transaction.ts;
  const parsed = candidate ? Number(candidate) : NaN;
  return Number.isFinite(parsed) ? parsed : 0;
}
function summarizeClusters(nodes) {
  const clusters = /* @__PURE__ */ new Map();
  for (const node of nodes) {
    const clusterId = Number.isFinite(Number(node.cluster)) ? Number(node.cluster) : 0;
    const clusterNodes = clusters.get(clusterId) ?? [];
    clusterNodes.push(node);
    clusters.set(clusterId, clusterNodes);
  }
  return [...clusters.entries()].map(([id, items]) => {
    const totalRiskScore = items.reduce((sum, item) => sum + (Number(item.risk ?? item.riskScore ?? 0) || 0), 0);
    const avgRisk = items.length ? totalRiskScore / items.length : 0;
    return {
      id,
      name: `Cluster ${id}`,
      accounts: items.length,
      totalRiskScore: Number(totalRiskScore.toFixed(2)),
      avgRisk: Number(avgRisk.toFixed(2)),
      hasCircularFlow: avgRisk >= 70,
      color: avgRisk >= 70 ? "#ef4444" : avgRisk >= 45 ? "#f59e0b" : "#22c55e"
    };
  }).sort((left, right) => left.id - right.id);
}
function Stat({
  label,
  value,
  tone = "default"
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-card/60 px-3 py-2 text-right", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-[0.18em] text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mt-1 text-lg font-semibold ${tone === "critical" ? "text-critical" : "text-foreground"}`, children: value })
  ] });
}
function Toggle({
  label,
  value,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => onChange(!value), className: `flex w-full items-center justify-between rounded-md border px-3 py-2 text-left transition ${value ? "border-primary bg-primary/15" : "border-border bg-card/60"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-4 w-8 rounded-full border transition ${value ? "border-primary bg-primary/60" : "border-border bg-muted"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `block h-3 w-3 translate-y-0.5 rounded-full bg-background transition ${value ? "translate-x-4" : "translate-x-0.5"}` }) })
  ] });
}
function Metric({
  label,
  value,
  tone = "default"
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-card/60 px-3 py-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-[0.18em] text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mt-1 text-sm font-medium ${tone === "critical" ? "text-critical" : tone === "warning" ? "text-warning" : "text-foreground"}`, children: value })
  ] });
}
export {
  GraphPage as component
};
