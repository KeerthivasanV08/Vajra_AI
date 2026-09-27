import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import { createClientOnlyFn } from '@tanstack/react-start';
import type { WithdrawalNode, HighRiskCorridor } from '@/types/vajra';

interface OperationsMapCanvasProps {
  nodes?: WithdrawalNode[];
  corridors?: HighRiskCorridor[];
  selectedNode?: WithdrawalNode | null;
  onSelectNode?: (node: WithdrawalNode) => void;
  center?: [number, number];
  zoom?: number;
  className?: string;
  officerPosition?: [number, number];
}

type ClientMapProps = OperationsMapCanvasProps;
const loadClientMap = createClientOnlyFn(() => import('./OperationsMapCanvas.client'));

export function OperationsMapCanvas(props: OperationsMapCanvasProps) {
  const [ClientMap, setClientMap] = useState<ComponentType<ClientMapProps> | null>(null);

  useEffect(() => {
    let active = true;
    void loadClientMap()?.then(({ OperationsMapCanvasClient }) => {
      if (active) setClientMap(() => OperationsMapCanvasClient);
    });
    return () => { active = false; };
  }, []);

  if (!ClientMap) {
    return <div className={`relative flex h-full min-h-[450px] items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-sm text-slate-300 ${props.className || ''}`}>Initializing map...</div>;
  }
  return <ClientMap {...props} />;
}
