import { useMemo } from 'react';

import { DirectedGraph } from '@/models/graphs';
import { DirectedGraphPlacementSettings } from '@/types/placement';

import GraphComponent, { TempProps } from './GraphComponent';

type DirectedGraphComponentProps<V, E> = {
  vertices: Array<{ key: string; data: V }>;
  edges: Array<{ key: string; from: string; to: string; data: E }>;
  placementSettings?: DirectedGraphPlacementSettings<V, E>;
};

function DirectedGraphComponent<V, E>({
  vertices,
  edges,
  placementSettings,
  onMeasure
}: DirectedGraphComponentProps<V, E> & TempProps) {
  const graph = useMemo(() => {
    const g = new DirectedGraph<V, E>();

    vertices.forEach(({ key, data }) => {
      g.insertVertex(key, data);
    });

    edges.forEach(({ key, from, to, data }) => {
      g.insertEdge(from, to, key, data);
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

export default <V, E>(props: DirectedGraphComponentProps<V, E>) => {
  return (
    <DirectedGraphComponent
      {...(props as DirectedGraphComponentProps<V, E> & TempProps)}
    />
  );
};
