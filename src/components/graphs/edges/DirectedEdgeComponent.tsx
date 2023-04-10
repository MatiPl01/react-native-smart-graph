import { SharedValue } from 'react-native-reanimated';

import { DirectedEdge } from '@/types/graphs';
import { DirectedEdgeRendererProps } from '@/types/render';

// TODO - add edge arrow renderer and edge label renderer
type DirectedEdgeComponentProps<E, V> = {
  edge: DirectedEdge<E, V>;
  from: SharedValue<{ x: number; y: number }>;
  to: SharedValue<{ x: number; y: number }>;
  edgeRenderer: (props: DirectedEdgeRendererProps<E, V>) => JSX.Element;
};

export default function DirectedEdgeComponent<E, V>({
  edge,
  from,
  to,
  edgeRenderer
}: DirectedEdgeComponentProps<E, V>) {
  return edgeRenderer({
    key: edge.key,
    data: edge.value,
    from,
    to
  });
}
