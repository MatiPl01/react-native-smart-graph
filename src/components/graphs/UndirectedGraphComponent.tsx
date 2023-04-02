import UndirectedGraph from '@/models/graphs/UndirectedGraph.model';
import { useMemo } from 'react';
import { SharedValue } from 'react-native-reanimated';

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

  const verticesPositions: Record<string, {x: SharedValue<number>; y: SharedValue<number>}> = {};

  graph.vertices.forEach((v) => {
    // TODO - use placementStrategy
  });


  return null;
}
