import { SharedValue } from 'react-native-reanimated';

import { DirectedEdge } from '@/types/graphs';
import { DirectedEdgeRenderFunction } from '@/types/render';

// TODO - add edge label renderer
type DirectedEdgeComponentProps<E, V> = {
  edge: DirectedEdge<E, V>;
  from: SharedValue<{ x: number; y: number }>;
  to: SharedValue<{ x: number; y: number }>;
  edgeRenderer: DirectedEdgeRenderFunction<E>;
  edgeArrowRenderer: DirectedEdgeRenderFunction<E>;
};

export default function DirectedEdgeComponent<E, V>({
  edge,
  from,
  to,
  edgeRenderer,
  edgeArrowRenderer
}: DirectedEdgeComponentProps<E, V>) {
  const props = {
    key: edge.key,
    data: edge.value,
    from,
    to
  };

  return (
    <>
      {edgeRenderer(props)}
      {edgeArrowRenderer(props)}
    </>
  );
}
