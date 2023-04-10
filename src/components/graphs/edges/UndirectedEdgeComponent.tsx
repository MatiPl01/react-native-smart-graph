import { SharedValue } from 'react-native-reanimated';

import { UndirectedEdge } from '@/types/graphs';
import { UndirectedEdgeRendererProps } from '@/types/render';

// TODO - add edge label renderer
type UndirectedEdgeComponentProps<E, V> = {
  edge: UndirectedEdge<E, V>;
  points: [
    SharedValue<{ x: number; y: number }>,
    SharedValue<{ x: number; y: number }>
  ];
  edgeRenderer: (props: UndirectedEdgeRendererProps<E, V>) => JSX.Element;
};

export default function UndirectedEdgeComponent<E, V>({
  edge,
  points,
  edgeRenderer
}: UndirectedEdgeComponentProps<E, V>) {
  return edgeRenderer({
    key: edge.key,
    data: edge.value,
    points
  });
}
