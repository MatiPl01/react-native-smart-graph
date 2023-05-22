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

  if (closestEdgeLabelKey) {
    const edge = graph.edge(closestEdgeLabelKey);
    if (edge && distance <= hitSlop) {
      return closestEdgeLabelKey;
    }
  }

  return null;
};
