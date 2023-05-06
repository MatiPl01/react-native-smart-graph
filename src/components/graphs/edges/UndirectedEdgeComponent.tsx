import { UndirectedEdge } from '@/types/graphs';
import { AnimatedVector } from '@/types/layout';
import { UndirectedEdgeRenderers } from '@/types/renderer';
import { UndirectedGraphComponentsSettingsWithDefaults } from '@/types/settings';

type UndirectedEdgeComponentProps<E, V> = {
  edge: UndirectedEdge<E, V>;
  points: [AnimatedVector, AnimatedVector];
  renderers: UndirectedEdgeRenderers<E>;
  settings?: UndirectedGraphComponentsSettingsWithDefaults['edge'];
};

export default function UndirectedEdgeComponent<E, V>({
  edge,
  points,
  renderers: { edge: edgeRenderer }
}: UndirectedEdgeComponentProps<E, V>) {
  return edgeRenderer({
    key: edge.key,
    data: edge.value,
    points
  });
}
