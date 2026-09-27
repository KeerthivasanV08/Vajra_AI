import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { WithdrawalNode, HighRiskCorridor } from '@/types/vajra';

// Custom Map Marker Icons using Leaflet divIcon
const createCustomIcon = (type: string, riskLevel: string = 'NORMAL') => {
  let color = '#10b981'; // Green
  if (riskLevel === 'IMMINENT' || riskLevel === 'CRITICAL') color = '#f43f5e'; // Red
  else if (riskLevel === 'WATCHLIST') color = '#f59e0b'; // Amber

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="
      background-color: ${color};
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid #0f172a;
      box-shadow: 0 0 10px ${color};
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

interface OperationsMapCanvasProps {
  nodes?: WithdrawalNode[];
  corridors?: HighRiskCorridor[];
  selectedNode?: WithdrawalNode | null;
  onSelectNode?: (node: WithdrawalNode) => void;
  center?: [number, number];
  zoom?: number;
  className?: string;
}

export function OperationsMapCanvas({
  nodes = [],
  corridors = [],
  selectedNode,
  onSelectNode,
  center = [28.6139, 77.2090], // Delhi NCR default
  zoom = 11,
  className = '',
}: OperationsMapCanvasProps) {
  // Defensive filter: Only render corridors with valid finite numerical coordinates
  const validCorridors = corridors.filter((corr) => {
    const sLat = Number(corr.start_lat);
    const sLon = Number(corr.start_lon);
    const eLat = Number(corr.end_lat);
    const eLon = Number(corr.end_lon);
    return Number.isFinite(sLat) && Number.isFinite(sLon) && Number.isFinite(eLat) && Number.isFinite(eLon);
  });

  // Defensive filter: Only render nodes with valid finite coordinates
  const validNodes = nodes.filter((node) => {
    const lat = Number(node.latitude);
    const lon = Number(node.longitude);
    return Number.isFinite(lat) && Number.isFinite(lon);
  });

  return (
    <div className={`relative w-full h-full min-h-[450px] rounded-xl overflow-hidden border border-slate-800 ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', background: '#090d16' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* High Risk Corridors Vector Polylines */}
        {validCorridors.map((corr, idx) => (
          <Polyline
            key={`corridor-poly-${corr.corridor_id || 'corr'}-${idx}`}
            positions={[
              [Number(corr.start_lat), Number(corr.start_lon)],
              [Number(corr.end_lat), Number(corr.end_lon)],
            ]}
            pathOptions={{
              color: '#f43f5e',
              weight: 3,
              dashArray: '6, 8',
              opacity: 0.8,
            }}
          >
            <Popup>
              <div className="font-mono text-xs">
                <strong>{corr.corridor_name}</strong>
                <div>Risk Score: {((corr.risk_score ?? 0.8) * 100).toFixed(0)}%</div>
                <div>Primary Nodes: {corr.primary_nodes_count ?? 'N/A'}</div>
              </div>
            </Popup>
          </Polyline>
        ))}

        {/* Withdrawal Node Markers */}
        {validNodes.map((node, idx) => {
          const vuln = node.vulnerability_score_reference ?? node.node_vulnerability_score ?? 0.35;
          let riskBand = 'NORMAL';
          if (vuln >= 0.70) riskBand = 'IMMINENT';
          else if (vuln >= 0.50) riskBand = 'WATCHLIST';

          return (
            <Marker
              key={`node-marker-${node.node_id || 'node'}-${idx}`}
              position={[Number(node.latitude), Number(node.longitude)]}
              icon={createCustomIcon(node.node_type, riskBand)}
              eventHandlers={{
                click: () => onSelectNode?.(node),
              }}
            >
              <Popup>
                <div className="font-mono text-xs p-1 space-y-1">
                  <div className="font-bold text-slate-900">{node.node_id} ({node.node_type})</div>
                  <div>Bank: {node.bank_name || 'Aggregator'}</div>
                  <div>District: {node.district || 'Delhi'}</div>
                  <div>Vulnerability: {(vuln * 100).toFixed(1)}%</div>
                  <button
                    onClick={() => onSelectNode?.(node)}
                    className="mt-1 px-2 py-0.5 rounded bg-blue-600 text-white font-sans text-[10px] w-full"
                  >
                    Open Tactical Brief
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
