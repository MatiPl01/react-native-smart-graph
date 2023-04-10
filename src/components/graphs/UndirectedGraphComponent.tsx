import { useMemo } from 'react';

import { UndirectedGraph } from '@/models/graphs';
import { UndirectedGraphPlacementSettings } from '@/types/placement';

import GraphComponent, {
  PrivateSharedGraphComponentProps,
  SharedGraphComponentProps
} from './GraphComponent';

type UndirectedGraphComponentProps<V, E> = SharedGraphComponentProps<V> & {
  vertices: Array<{ key: string; data: V }>;
  edges: Array<{ key: string; vertices: [string, string]; data: E }>;
  placementSettings?: UndirectedGraphPlacementSettings<V, E>;
};

function UndirectedGraphComponent<V, E>({
  vertices,
  edges,
  placementSettings,
  vertexRenderer,
  setAnimatedContentDimensions
}: UndirectedGraphComponentProps<V, E> & PrivateSharedGraphComponentProps) {
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
      placementSettings={placementSettings}
      vertexRenderer={vertexRenderer}
      setAnimatedContentDimensions={setAnimatedContentDimensions}
    />
  );
}

export default <V, E>(props: UndirectedGraphComponentProps<V, E>) => {
  return (
    <UndirectedGraphComponent
      {...(props as UndirectedGraphComponentProps<V, E> &
        PrivateSharedGraphComponentProps)}
    />
  );
};
