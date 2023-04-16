import { SharedValue } from 'react-native-reanimated';

import { UndirectedEdge } from '@/types/graphs';
import { UndirectedEdgeRenderers } from '@/types/renderer';
import { UndirectedEdgeSettings } from '@/types/settings';

type UndirectedEdgeComponentProps<E, V> = {
  edge: UndirectedEdge<E, V>;
  points: [
    SharedValue<{ x: number; y: number }>,
    SharedValue<{ x: number; y: number }>
  ];
  renderers: UndirectedEdgeRenderers<E>;
  settings?: UndirectedEdgeSettings;
};

export default function UndirectedEdgeComponent<E, V>({
  edge,
  points,
  renderers: { edge: edgeRenderer, label: edgeLabelRenderer }
}: UndirectedEdgeComponentProps<E, V>) {
  return edgeRenderer({
    key: edge.key,
    data: edge.value,
    points
  });
}
