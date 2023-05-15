import { UndirectedEdge } from '@/types/graphs';
import { AnimatedVector } from '@/types/layout';
import {
  SharedRenderersProps,
  UndirectedEdgeRenderers
} from '@/types/renderer';
import { UndirectedGraphComponentsSettingsWithDefaults } from '@/types/settings';

type UndirectedEdgeComponentProps<E, V> = SharedRenderersProps & {
  edge: UndirectedEdge<E, V>;
  points: [AnimatedVector, AnimatedVector];
  renderers: UndirectedEdgeRenderers<E>;
  settings?: UndirectedGraphComponentsSettingsWithDefaults['edge'];
};

export default function UndirectedEdgeComponent<E, V>({
  edge,
  renderers: { edge: edgeRenderer },
  ...restProps
}: UndirectedEdgeComponentProps<E, V>) {
  return edgeRenderer({
    key: edge.key,
    data: edge.value,
    ...restProps
  });
}
