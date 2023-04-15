import { useMemo } from 'react';

import { DirectedGraph } from '@/models/graphs';
import { DirectedGraphPlacementSettings } from '@/types/placement';
import {
  DirectedEdgeRenderFunction,
  EdgeArrowRenderFunction
} from '@/types/render';
import { SHARED as SHARED_PLACEMENT_SETTINGS } from '@/utils/placement/constants';

import GraphComponent, {
  SharedGraphComponentProps,
  TempProps
} from './GraphComponent';

type DirectedGraphComponentProps<V, E> = SharedGraphComponentProps<V> & {
  vertices: Array<{ key: string; data: V }>;
  edges: Array<{ key: string; from: string; to: string; data: E }>;
  placementSettings?: DirectedGraphPlacementSettings<V, E>;
  edgeRenderer?: DirectedEdgeRenderFunction<E>;
  edgeArrowRenderer?: EdgeArrowRenderFunction<E>;
  edgeLabelRenderer?: DirectedEdgeRenderFunction<E>;
};

function DirectedGraphComponent<V, E>({
  vertices,
  edges,
  ...restProps
}: DirectedGraphComponentProps<V, E> & TempProps) {
  const vertexRadius =
    restProps.placementSettings?.vertexRadius ??
    SHARED_PLACEMENT_SETTINGS.vertexRadius;

  const graph = useMemo(() => {
    const g = new DirectedGraph<V, E>();

    vertices.forEach(({ key, data }) => {
      g.insertVertex(key, data, vertexRadius);
    });

    edges.forEach(({ key, from, to, data }) => {
      g.insertEdge(from, to, key, data);
    });
    return g;
  }, [vertices, edges]);

  return <GraphComponent graph={graph} {...restProps} />;
}

export default <V, E>(props: DirectedGraphComponentProps<V, E>) => {
  return (
    <DirectedGraphComponent
      {...(props as DirectedGraphComponentProps<V, E> & TempProps)}
    />
  );
};
