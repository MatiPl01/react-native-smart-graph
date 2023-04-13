import { memo } from 'react';
import { SharedValue, useDerivedValue } from 'react-native-reanimated';

import { Edge } from '@/types/graphs';
import {
  DirectedEdgeRenderFunction,
  EdgeRendererProps,
  UndirectedEdgeRendererProps
} from '@/types/render';
import { isEdgeDirected, isUndirectedEdge } from '@/utils/graphs';

import DirectedEdgeComponent from './DirectedEdgeComponent';
import UndirectedEdgeComponent from './UndirectedEdgeComponent';

type EdgeComponentProps<E, V, R extends EdgeRendererProps<E>> = {
  edge: Edge<E, V>;
  verticesPositions: Record<
    string,
    { x: SharedValue<number>; y: SharedValue<number> }
  >;
  edgeRenderer: (props: R) => JSX.Element | null;
  edgeArrowRenderer?: DirectedEdgeRenderFunction<E>;
};

// TODO - check if memoization works
function EdgeComponent<E, V, R extends EdgeRendererProps<E>>({
  edge,
  verticesPositions,
  edgeRenderer,
  edgeArrowRenderer
}: EdgeComponentProps<E, V, R>) {
  const [v1, v2] = edge.vertices;
  const v1Position = verticesPositions[v1.key];
  const v2Position = verticesPositions[v2.key];

  const p1 = useDerivedValue(
    () => ({ x: v1Position?.x.value || 0, y: v1Position?.y.value || 0 }),
    [v1Position?.x, v1Position?.y]
  );

  const p2 = useDerivedValue(
    () => ({ x: v2Position?.x.value || 0, y: v2Position?.y.value || 0 }),
    [v2Position?.x, v2Position?.y]
  );

  if (isEdgeDirected(edge)) {
    return (
      <DirectedEdgeComponent<E, V>
        edge={edge}
        from={p1}
        to={p2}
        edgeRenderer={edgeRenderer as DirectedEdgeRenderFunction<E>}
        edgeArrowRenderer={edgeArrowRenderer as DirectedEdgeRenderFunction<E>}
      />
    );
  }
  if (isUndirectedEdge(edge)) {
    return (
      <UndirectedEdgeComponent<E, V>
        edge={edge}
        points={[p1, p2]}
        edgeRenderer={
          edgeRenderer as (props: UndirectedEdgeRendererProps<E>) => JSX.Element
        }
      />
    );
  }
  // this should never happen
  return null;
}

export default memo(EdgeComponent) as <E, V, R extends EdgeRendererProps<E>>(
  props: EdgeComponentProps<E, V, R>
) => JSX.Element;
