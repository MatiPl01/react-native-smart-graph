import { Vector } from '@shopify/react-native-skia';

import { Edge, Graph } from '@/types/graphs';
import { AnimatedVector, AnimatedVectorCoordinates } from '@/types/layout';
import {
  animatedVectorCoordinatesToVector,
  animatedVectorToVector,
  distanceBetweenVectors
} from '@/utils/vectors';

export const findClosestVertex = (
  position: Vector,
  animatedVerticesPositions: Record<string, AnimatedVectorCoordinates>
): { distance: number; key: null | string } => {
  let closestVertexKey: null | string = null;
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
    distance: closestVertexDistance,
    key: closestVertexKey
  };
};

export const findPressedVertex = (
  position: Vector,
  vertexRadius: number,
  hitSlop: number,
  animatedVerticesPositions: Record<string, AnimatedVectorCoordinates>
): null | string => {
  const { distance, key: closestVertexKey } = findClosestVertex(
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
): { distance: number; key: null | string } => {
  let closestEdgeLabelKey: null | string = null;
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
    distance: closestEdgeLabelDistance,
    key: closestEdgeLabelKey
  };
};

export const findPressedEdgeLabel = <E, V>(
  position: Vector,
  graph: Graph<V, E>,
  hitSlop: number,
  animatedEdgeLabelsPositions: Record<string, AnimatedVector>
): null | string => {
  const { distance, key: closestEdgeLabelKey } = findClosestEdgeLabel(
    position,
    graph.edges,
    animatedEdgeLabelsPositions
  );

  if (closestEdgeLabelKey) {
    const edge = graph.getEdge(closestEdgeLabelKey);
    if (edge && distance <= hitSlop) {
      return closestEdgeLabelKey;
    }
  }

  return null;
};
