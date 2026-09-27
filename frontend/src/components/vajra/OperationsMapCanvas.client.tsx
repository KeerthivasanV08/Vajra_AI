import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { HighRiskCorridor, WithdrawalNode } from '@/types/vajra';

interface Props {
  nodes?: WithdrawalNode[];
  corridors?: HighRiskCorridor[];
  selectedNode?: WithdrawalNode | null;
  onSelectNode?: (node: WithdrawalNode) => void;
  center?: [number, number];
  zoom?: number;
  className?: string;
}

export function OperationsMapCanvasClient({ nodes = [], selectedNode, onSelectNode, center, zoom = 6, className = '' }: Props) {
  const fallback: [number, number] = [20.5937, 78.9629];
  const selected = selectedNode && Number.isFinite(selectedNode.latitude) && Number.isFinite(selectedNode.longitude)
    ? [selectedNode.latitude, selectedNode.longitude] as [number, number] : undefined;
  const mapCenter = center || selected || fallback;
  const validNodes = nodes.filter((node) => Number.isFinite(node.latitude) && Number.isFinite(node.longitude));
  return <MapContainer center={mapCenter} zoom={selected ? 12 : zoom} className={`h-full min-h-[450px] w-full rounded-xl ${className}`}>
    <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    {validNodes.map((node) => <Marker key={node.node_id} position={[node.latitude, node.longitude]} eventHandlers={{ click: () => onSelectNode?.(node) }}><Popup><strong>{node.node_id}</strong><br />{node.node_type || 'Withdrawal node'}</Popup></Marker>)}
  </MapContainer>;
}
