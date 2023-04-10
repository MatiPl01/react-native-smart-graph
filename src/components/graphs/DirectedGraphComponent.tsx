import { useMemo } from 'react';

import { DirectedGraph } from '@/models/graphs';
import { DirectedGraphPlacementSettings } from '@/types/placement';

import GraphComponent, {
  PrivateSharedGraphComponentProps,
  SharedGraphComponentProps
} from './GraphComponent';

type DirectedGraphComponentProps<V, E> = SharedGraphComponentProps<V> & {
  vertices: Array<{ key: string; data: V }>;
  edges: Array<{ key: string; from: string; to: string; data: E }>;
  placementSettings?: DirectedGraphPlacementSettings<V, E>;
};

function DirectedGraphComponent<V, E>({
  vertices,
  edges,
  placementSettings,
  vertexRenderer,
  setAnimatedContentDimensions
}: DirectedGraphComponentProps<V, E> & PrivateSharedGraphComponentProps) {
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
      placementSettings={placementSettings}
      vertexRenderer={vertexRenderer}
      setAnimatedContentDimensions={setAnimatedContentDimensions}
    />
  );
}

export default <V, E>(props: DirectedGraphComponentProps<V, E>) => {
  return (
    <DirectedGraphComponent
      {...(props as DirectedGraphComponentProps<V, E> &
        PrivateSharedGraphComponentProps)}
    />
  );
};
