import { Vector } from '@shopify/react-native-skia';

import { Edge, Graph } from '@/types/graphs';
import { AnimatedVectorCoordinates } from '@/types/layout';

import {
  animatedVectorToVector,
  distanceBetweenPointAndLine,
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
        animatedVectorToVector(animatedPosition)
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
  animatedVerticesPositions: Record<string, AnimatedVectorCoordinates>
): string | null => {
  const { key: closestVertexKey, distance } = findClosestVertex(
    position,
    animatedVerticesPositions
  );

  if (closestVertexKey && distance <= vertexRadius) {
    return closestVertexKey;
  }

  return null;
};

// TODO - fix edge press handlers
export const findClosestEdge = <E, V>(
  position: Vector,
  edges: Array<Edge<E, V>>,
  animatedVerticesPositions: Record<string, AnimatedVectorCoordinates>
): { key: string | null; distance: number } => {
  let closestEdgeKey: string | null = null;
  let closestEdgeDistance = Infinity;

  edges.forEach(edge => {
    const [vertex1, vertex2] = edge.vertices;
    const vertex1Position = animatedVectorToVector(
      animatedVerticesPositions[vertex1.key]
    );
    const vertex2Position = animatedVectorToVector(
      animatedVerticesPositions[vertex2.key]
    );

    const distance = distanceBetweenPointAndLine(
      position,
      vertex1Position,
      vertex2Position
    );

    if (distance < closestEdgeDistance) {
      closestEdgeKey = edge.key;
      closestEdgeDistance = distance;
    }
  });

  return {
    key: closestEdgeKey,
    distance: closestEdgeDistance
  };
};

export const findPressedEdge = <E, V>(
  position: Vector,
  graph: Graph<V, E>,
  pressDistance: number,
  animatedVerticesPositions: Record<string, AnimatedVectorCoordinates>
): string | null => {
  const { key: closestEdgeKey, distance } = findClosestEdge(
    position,
    graph.edges,
    animatedVerticesPositions
  );

  if (closestEdgeKey) {
    const edge = graph.edge(closestEdgeKey);
    if (edge && distance <= pressDistance) {
      return closestEdgeKey;
    }
  }

  return null;
};
