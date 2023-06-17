import { Vector } from '@shopify/react-native-skia';

import { VertexComponentRenderData } from '@/types/components';
import { GraphConnections } from '@/types/graphs';
import { AnimatedVectorCoordinates, BoundingVertices } from '@/types/layout';
import { animatedVectorCoordinatesToVector } from '@/utils/vectors';

const findBoundingVertices = (
  verticesPositions: Record<string, Vector>
): BoundingVertices => {
  'worklet';
  let top: string | undefined;
  let bottom: string | undefined;
  let right: string | undefined;
  let left: string | undefined;

  for (const [key, { x, y }] of Object.entries(verticesPositions)) {
    if (!top || y < (verticesPositions[top]?.y || -Infinity)) {
      top = key;
    }
    if (!bottom || y > (verticesPositions[bottom]?.y || Infinity)) {
      bottom = key;
    }
    if (!right || x > (verticesPositions[right]?.x || Infinity)) {
      right = key;
    }
    if (!left || x < (verticesPositions[left]?.x || -Infinity)) {
      left = key;
    }
  }

  return {
    top,
    bottom,
    left,
    right
  };
};

const placeVertexNearBounds = (
  boundingVertices: BoundingVertices,
  placedVerticesPositions: Record<string, Vector>
): Vector => {
  'worklet';
  // Select a random vertex from the bounding vertices
  const boundingVerticesKeys = Object.keys(boundingVertices);
  const randomBoundingVertexKey =
    boundingVerticesKeys[
      Math.floor(Math.random() * boundingVerticesKeys.length)
    ];

  // TODO
  return {
    x: Math.random() * 1000,
    y: Math.random() * 1000
  };
};

const findForcesPlacementPosition = (
  placedVerticesPositions: Record<string, Vector>,
  neighbors: Array<string>
): Vector => {
  'worklet';
  const boundingVertices = findBoundingVertices(placedVerticesPositions);

  // 1. If there are no neighbors, place the vertex near the bounds of the graph
  if (neighbors.length === 0) {
    // TODO
  }

  return {
    x: Math.random() * 1000,
    y: Math.random() * 1000
  };
};

const findForcesPlacementPositions = (
  placedVerticesPositions: Record<string, AnimatedVectorCoordinates>,
  connections: GraphConnections
): Record<string, Vector> => {
  'worklet';
  const allVerticesPositions = Object.fromEntries(
    Object.entries(placedVerticesPositions).map(([key, value]) => [
      key,
      animatedVectorCoordinatesToVector(value)
    ])
  );

  // Determine which vertices are not placed yet
  const unplacedVertices = Object.keys(connections).filter(
    key => !placedVerticesPositions[key]
  );

  // Place unplaced vertices
  return unplacedVertices.reduce((acc, key) => {
    acc[key] = allVerticesPositions[key] = findForcesPlacementPosition(
      allVerticesPositions,
      connections[key] ?? []
    );
    return acc;
  }, {} as Record<string, Vector>);
};

export const updateNewVerticesPositions = (
  placedVerticesPositions: Record<string, AnimatedVectorCoordinates>,
  verticesRenderData: Record<string, VertexComponentRenderData>,
  connections: GraphConnections
): void => {
  'worklet';
  // Calculate new vertices placement positions
  const newVerticesPositions = findForcesPlacementPositions(
    placedVerticesPositions,
    connections
  );
  // Update positions of new vertices
  Object.entries(newVerticesPositions).forEach(([key, position]) => {
    const vertexPosition = verticesRenderData[key]?.position;
    if (!vertexPosition) {
      return;
    }
    vertexPosition.x.value = position.x;
    vertexPosition.y.value = position.y;
  });
};
