import { useMemo } from 'react';

import { UndirectedGraph } from '@/models/graphs';
import { UndirectedGraphPlacementSettings } from '@/types/placement';

import GraphComponent, { TempProps } from './GraphComponent';

type UndirectedGraphComponentProps<V, E> = {
  vertices: Array<{ key: string; data: V }>;
  edges: Array<{ key: string; vertices: [string, string]; data: E }>;
  placementSettings?: UndirectedGraphPlacementSettings<V, E>;
};

function UndirectedGraphComponent<V, E>({
  vertices,
  edges,
  placementSettings,
  onMeasure
}: UndirectedGraphComponentProps<V, E> & TempProps) {
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

  return (
    <GraphComponent
      graph={graph}
      onMeasure={onMeasure}
      placementSettings={placementSettings}
    />
  );
}

export default <V, E>(props: UndirectedGraphComponentProps<V, E>) => {
  return (
    <UndirectedGraphComponent
      {...(props as UndirectedGraphComponentProps<V, E> & TempProps)}
    />
  );
};
