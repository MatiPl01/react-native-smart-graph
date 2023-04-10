import { memo } from 'react';

import { Edge } from '@/types/graphs';
import { PlacedVerticesPositions } from '@/types/placement';
import {
  DirectedEdgeRendererProps,
  EdgeRendererProps,
  UndirectedEdgeRendererProps
} from '@/types/render';
import { isEdgeDirected, isUndirectedEdge } from '@/utils/graphs';

import DirectedEdgeComponent from './DirectedEdgeComponent';
import UndirectedEdgeComponent from './UndirectedEdgeComponent';

type EdgeComponentProps<E, V, R extends EdgeRendererProps<E, V>> = {
  edge: Edge<E, V>;
  verticesPositions: PlacedVerticesPositions; // TODO - use animated positions instead of static ones
  edgeRenderer: (props: R) => JSX.Element;
};

// TODO - check if memoization works
function EdgeComponent<E, V, R extends EdgeRendererProps<E, V>>({
  edge,
  verticesPositions,
  edgeRenderer
}: EdgeComponentProps<E, V, R>) {
  if (isEdgeDirected(edge)) {
    return (
      <DirectedEdgeComponent
        edge={edge}
        source={verticesPositions[edge.source.key] as { x: number; y: number }}
        target={verticesPositions[edge.target.key] as { x: number; y: number }}
        edgeRenderer={
          edgeRenderer as (
            props: DirectedEdgeRendererProps<E, V>
          ) => JSX.Element
        }
      />
    );
  }
  if (isUndirectedEdge(edge)) {
    return (
      <UndirectedEdgeComponent
        edge={edge}
        vertices={[
          verticesPositions[edge.vertices[0].key] as { x: number; y: number },
          verticesPositions[edge.vertices[1].key] as { x: number; y: number }
        ]}
        edgeRenderer={
          edgeRenderer as (
            props: UndirectedEdgeRendererProps<E, V>
          ) => JSX.Element
        }
      />
    );
  }
  // this should never happen
  return null;
}

export default memo(EdgeComponent) as <E, V, R extends EdgeRendererProps<E, V>>(
  props: EdgeComponentProps<E, V, R>
) => JSX.Element;
