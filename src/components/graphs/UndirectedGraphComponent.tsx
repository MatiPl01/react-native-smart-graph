import UndirectedGraph from '@/models/graphs/UndirectedGraph.model';
import { useMemo } from 'react';
import {placeVertices} from '@/utils/placement.utils';

type UndirectedGraphComponentProps<V, E> = {
  vertices: Array<{ key: string; data: V }>;
  edges: Array<{ key: string, vertices: [string, string]; data: E }>;
  placementStrategy?: 'random' | 'circular' | 'rings' | 'tree';
};

export default function UndirectedGraphComponent<V, E>({vertices, edges}: UndirectedGraphComponentProps<V, E>) {
  const graph = useMemo(() => {
    const g = new UndirectedGraph<V, E>();

    vertices.forEach(({key, data}) => {
      g.insertVertex(key, data);
    });

    edges.forEach(({key, vertices: [v1, v2], data}) => {
      g.insertEdge(v1, v2, key, data);
    });

    return g;
  }, [vertices, edges]);


  const positions = useMemo(
    () => placeVertices(graph, 200, 200, 'random'),
    [graph]
  );

  console.log(positions);

  return null;
}
