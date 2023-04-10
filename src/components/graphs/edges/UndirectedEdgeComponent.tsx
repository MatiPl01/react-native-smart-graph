import { UndirectedEdge } from '@/types/graphs';
import { UndirectedEdgeRendererProps } from '@/types/render';

// TODO - add edge label renderer
type UndirectedEdgeComponentProps<E, V> = {
  edge: UndirectedEdge<E, V>;
  vertices: [{ x: number; y: number }, { x: number; y: number }]; // TODO - use animated positions instead of static ones
  edgeRenderer: (props: UndirectedEdgeRendererProps<E, V>) => JSX.Element;
};

export default function UndirectedEdgeComponent<E, V>({
  edge,
  vertices,
  edgeRenderer
}: UndirectedEdgeComponentProps<E, V>) {
  return edgeRenderer({
    key: edge.key,
    data: edge.value,
    vertices
  });
}
