import { useMemo } from 'react';

import { UndirectedGraph } from '@/models/graphs';
import { UndirectedGraphPlacementSettings } from '@/types/placement';
import { UndirectedEdgeRendererProps } from '@/types/render';

import GraphComponent, {
  SharedGraphComponentProps,
  TempProps
} from './GraphComponent';

type UndirectedGraphComponentProps<V, E> = SharedGraphComponentProps<V> & {
  vertices: Array<{ key: string; data: V }>;
  edges: Array<{ key: string; vertices: [string, string]; data: E }>;
  placementSettings?: UndirectedGraphPlacementSettings<V, E>;
  edgeRenderer: (props: UndirectedEdgeRendererProps<E, V>) => JSX.Element;
};

function UndirectedGraphComponent<V, E>({
  vertices,
  edges,
  onMeasure,
  placementSettings,
  vertexRenderer,
  edgeRenderer
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
      vertexRenderer={vertexRenderer}
      edgeRenderer={edgeRenderer}
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
