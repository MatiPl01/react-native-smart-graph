import { useMemo } from 'react';
import { SharedValue } from 'react-native-reanimated';

import { DirectedGraph } from '@/models/graphs';
import { PlacementStrategy } from '@/types/placement';

type DirectedGraphComponentProps<V, E> = {
  vertices: Array<{ key: string; data: V }>;
  edges: Array<{ from: string; to: string; data: E }>;
  placementStrategy?: PlacementStrategy;
};

export default function DirectedGraphComponent<V, E>({
  vertices,
  edges
}: DirectedGraphComponentProps<V, E>) {
  const graph = useMemo(() => {
    const g = new DirectedGraph<V, E>();

    vertices.forEach(({ key, data }) => {
      g.insertVertex(key, data);
    });

    edges.forEach(({ from, to, data }) => {
      g.insertEdge(from, to, `${from}-${to}`, data);
    });
    return g;
  }, [vertices, edges]);

  const positions: Record<
    string,
    { x: SharedValue<number>; y: SharedValue<number> }
  > = {};

  return null;
}
