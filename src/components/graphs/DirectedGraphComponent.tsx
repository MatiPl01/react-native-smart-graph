import { useMemo } from 'react';

import { DirectedGraph } from '@/models/graphs';
import { DirectedGraphPlacementSettings } from '@/types/placement';
import { DirectedEdgeRendererProps } from '@/types/render';

import GraphComponent, {
  SharedGraphComponentProps,
  TempProps
} from './GraphComponent';

type DirectedGraphComponentProps<V, E> = SharedGraphComponentProps<V> & {
  vertices: Array<{ key: string; data: V }>;
  edges: Array<{ key: string; from: string; to: string; data: E }>;
  placementSettings?: DirectedGraphPlacementSettings<V, E>;
  edgeRenderer: (props: DirectedEdgeRendererProps<E, V>) => JSX.Element;
};

function DirectedGraphComponent<V, E>({
  vertices,
  edges,
  placementSettings,
  onMeasure,
  vertexRenderer,
  edgeRenderer
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
      vertexRenderer={vertexRenderer}
      edgeRenderer={edgeRenderer}
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
