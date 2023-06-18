/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Vector } from '@shopify/react-native-skia';

import { VertexComponentRenderData } from '@/types/components';
import { GraphConnections } from '@/types/graphs';
import { AnimatedVectorCoordinates } from '@/types/layout';
import { ForcesSettingsWithDefaults } from '@/types/settings';
import { grahamScan } from '@/utils/algorithms';
import {
  animatedVectorCoordinatesToVector,
  calcUnitVector,
  distanceBetweenVectors,
  getLineCenter,
  translateAlongVector
} from '@/utils/vectors';

const placeVertexOnCircle = (
  centerPosition: Vector,
  vertexRadius: number
): Vector => {
  'worklet';
  const angle = Math.random() * 2 * Math.PI;
  const radius = 4 * vertexRadius + Math.random() * 2 * vertexRadius;
  return {
    x: centerPosition.x + radius * Math.cos(angle),
    y: centerPosition.y + radius * Math.sin(angle)
  };
};

const placeVertexOnConvexHull = (
  placedVerticesPositions: Record<string, Vector>,
  vertexRadius: number
): Vector => {
  'worklet';
  // Find the convex hull of the placed vertices
  const hull = grahamScan(Object.values(placedVerticesPositions));

  // Find 2 random neighboring vertices on the hull and place the
  // new vertex near the center of the line between them
  const center: { x: number; y: number } = hull.reduce(
    (acc: { x: number; y: number }, vertex) => {
      acc.x += vertex.x;
      acc.y += vertex.y;
      return acc;
    },
    { x: 0, y: 0 }
  );
  center.x /= hull.length;
  center.y /= hull.length;

  // Find the two vertices on the hull that are closest to the center
  let closestVertex = getLineCenter(hull[0]!, hull[1]!);
  const closestDistance = distanceBetweenVectors(closestVertex, center);
  for (let i = 1; i < hull.length; i++) {
    const vertex = getLineCenter(hull[i]!, hull[(i + 1) % hull.length]!);
    const distance = distanceBetweenVectors(vertex, center);
    if (distance < closestDistance) {
      closestVertex = vertex;
    }
  }

  // Move the vertex a bit away from the center of the hull
  const directionVector = calcUnitVector(center, closestVertex);
  return translateAlongVector(closestVertex, directionVector, 2 * vertexRadius);
};

const findForcesPlacementPosition = (
  placedVerticesPositions: Record<string, Vector>,
  neighbors: Array<string>,
  vertexRadius: number,
  settings: ForcesSettingsWithDefaults
): Vector => {
  'worklet';
  const placedVerticesCount = Object.keys(placedVerticesPositions).length;

  // If there are no vertices placed yet, place the vertex in the
  // center of the canvas
  if (placedVerticesCount === 0) {
    return { x: 0, y: 0 };
  }
  // If there is only one vertex placed, place the vertex randomly on
  // the circle around the placed vertex
  if (placedVerticesCount === 1) {
    return placeVertexOnCircle(
      Object.values(placedVerticesPositions)[0]!,
      vertexRadius
    );
  }
  // If the current vertex is disjoint, find the convex hull of the placed
  // vertices and place the vertex near the hull
  if (neighbors.length === 0) {
    return placeVertexOnConvexHull(placedVerticesPositions, vertexRadius);
  }
  // If the current vertex is connected to only one other vertex,
  // place a vertex based on repulsion force from other vertices
  // TODO
  // If the current vertex is connected to many other vertices,
  // place a vertex in the center of the placed vertices translated
  // based on the repulsion force from other vertices
  // TODO

  return {
    x: Math.random() * 1000,
    y: Math.random() * 1000
  };
};

const findForcesPlacementPositions = (
  placedVerticesPositions: Record<string, AnimatedVectorCoordinates>,
  connections: GraphConnections,
  vertexRadius: number,
  settings: ForcesSettingsWithDefaults
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
      connections[key] ?? [],
      vertexRadius,
      settings
    );
    return acc;
  }, {} as Record<string, Vector>);
};

export const updateNewVerticesPositions = (
  placedVerticesPositions: Record<string, AnimatedVectorCoordinates>,
  verticesRenderData: Record<string, VertexComponentRenderData>,
  connections: GraphConnections,
  vertexRadius: number,
  settings: ForcesSettingsWithDefaults
): void => {
  'worklet';
  // Calculate new vertices placement positions
  const newVerticesPositions = findForcesPlacementPositions(
    placedVerticesPositions,
    connections,
    vertexRadius,
    settings
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
