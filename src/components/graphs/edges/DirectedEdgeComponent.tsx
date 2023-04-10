import { DirectedEdge } from '@/types/graphs';
import { DirectedEdgeRendererProps } from '@/types/render';

// TODO - add edge arrow renderer and edge label renderer
type DirectedEdgeComponentProps<E, V> = {
  edge: DirectedEdge<E, V>;
  source: { x: number; y: number }; // TODO - use animated positions instead of static ones
  target: { x: number; y: number };
  edgeRenderer: (props: DirectedEdgeRendererProps<E, V>) => JSX.Element;
};

export default function DirectedEdgeComponent<E, V>({
  edge,
  source,
  target,
  edgeRenderer
}: DirectedEdgeComponentProps<E, V>) {
  return edgeRenderer({
    key: edge.key,
    data: edge.value,
    from: source,
    to: target
  });
}
