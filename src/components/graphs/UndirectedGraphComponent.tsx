import { useMemo } from 'react';

import { UndirectedGraph } from '@/models/graphs';
import { PlacementSettings } from '@/types/placement';
import { placeVertices } from '@/utils/placement';

type UndirectedGraphComponentProps<V, E> = {
  vertices: Array<{ key: string; data: V }>;
  edges: Array<{ key: string; vertices: [string, string]; data: E }>;
  placementSettings?: PlacementSettings<V, E>;
};

export default function UndirectedGraphComponent<V, E>({
  vertices,
  edges,
  placementSettings
}: UndirectedGraphComponentProps<V, E>) {
  const graph = useMemo(() => {
    const g = new UndirectedGraph<V, E>();

    vertices.forEach(({ key, data }) => {
      g.insertVertex(key, data);
    });

    edges.forEach(({ key, vertices: [v1, v2], data }) => {
      g.insertEdge(v1, v2, key, data);
    });

    return g;
  }, [vertices, edges]);

  const positions = useMemo(
    () => placeVertices(graph, 200, 200, 5, placementSettings),
    [graph]
  );

  return null;
}
