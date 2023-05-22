import { Vector } from '@shopify/react-native-skia';

import { DirectedEdge, Edge, Graph, UndirectedEdge } from '@/types/graphs';
import { AnimatedVector, AnimatedVectorCoordinates } from '@/types/layout';

import {
  animatedVectorCoordinatesToVector,
  animatedVectorToVector,
  distanceBetweenVectors
} from '../vectors';

export const findClosestVertex = (
  position: Vector,
  animatedVerticesPositions: Record<string, AnimatedVectorCoordinates>
): { key: string | null; distance: number } => {
  let closestVertexKey: string | null = null;
  let closestVertexDistance = Infinity;

  Object.entries(animatedVerticesPositions).forEach(
    ([key, animatedPosition]) => {
      const distance = distanceBetweenVectors(
        position,
        animatedVectorCoordinatesToVector(animatedPosition)
      );
      if (distance < closestVertexDistance) {
        closestVertexKey = key;
        closestVertexDistance = distance;
      }
    }
  );

  return {
    key: closestVertexKey,
    distance: closestVertexDistance
  };
};

export const findPressedVertex = (
  position: Vector,
  vertexRadius: number,
  hitSlop: number,
  animatedVerticesPositions: Record<string, AnimatedVectorCoordinates>
): string | null => {
  const { key: closestVertexKey, distance } = findClosestVertex(
    position,
    animatedVerticesPositions
  );

  if (closestVertexKey && distance <= vertexRadius + hitSlop) {
    return closestVertexKey;
  }

  return null;
};

// TODO - fix edge press handlers
export const findClosestEdgeLabel = <E, V>(
  position: Vector,
  edges: Array<Edge<E, V>>,
  animatedEdgeLabelsPositions: Record<string, AnimatedVector>
): { key: string | null; distance: number } => {
  let closestEdgeLabelKey: string | null = null;
  let closestEdgeLabelDistance = Infinity;

  edges.forEach(edge => {
    const key = edge.key;
    const labelPosition = animatedVectorToVector(
      animatedEdgeLabelsPositions[key]
    );
    const distance = distanceBetweenVectors(position, labelPosition);

    if (distance < closestEdgeLabelDistance) {
      closestEdgeLabelKey = edge.key;
      closestEdgeLabelDistance = distance;
    }
  });

  return {
    key: closestEdgeLabelKey,
    distance: closestEdgeLabelDistance
  };
};

export const findPressedEdgeLabel = <E, V>(
  position: Vector,
  graph: Graph<V, E>,
  hitSlop: number,
  animatedEdgeLabelsPositions: Record<string, AnimatedVector>
): string | null => {
  const { key: closestEdgeLabelKey, distance } = findClosestEdgeLabel(
    position,
    graph.edges,
    animatedEdgeLabelsPositions
  );

  if (closestEdgeKey) {
    const edge = graph.edge(closestEdgeKey);
    if (edge && distance <= hitSlop) {
      return closestEdgeKey;
    }
  }

  return null;
};

const getDirectedEdgeIndex = <E, V>(
  edge: DirectedEdge<E, V>,
  edges: Array<DirectedEdge<E, V>>
): number => {
  let index = 0;
  for (const e of edges) {
    if (e.key === edge.key) {
      break;
    }
    if (e.source.key === edge.source.key && e.target.key === edge.target.key) {
      index++;
    }
  }
  return index;
};

const getUndirectedEdgeIndex = <E, V>(
  edge: UndirectedEdge<E, V>,
  edges: Array<UndirectedEdge<E, V>>
): number => edges.findIndex(e => e.key === edge.key);

export const getEdgeIndex = <E, V, GE extends Edge<E, V>>(
  edge: GE,
  edges: Array<GE>
): number =>
  edge.isDirected()
    ? getDirectedEdgeIndex(
        edge as unknown as DirectedEdge<E, V>,
        edges as unknown as Array<DirectedEdge<E, V>>
      )
    : getUndirectedEdgeIndex(
        edge as unknown as UndirectedEdge<E, V>,
        edges as unknown as Array<UndirectedEdge<E, V>>
      );
