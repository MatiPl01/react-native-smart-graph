/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { VertexComponentData } from '@/types/data';
import {
  AnimatedVectorCoordinates,
  BoundingRect,
  Dimensions,
  Vector
} from '@/types/layout';
import { GraphConnections } from '@/types/models';
import {
  AllAnimationSettings,
  AllGraphPlacementSettings
} from '@/types/settings';
import { grahamScan } from '@/utils/algorithms';
import { animateVerticesToFinalPositions } from '@/utils/animations';
import { findCenterOfPoints } from '@/utils/layout';
import { placeVertices } from '@/utils/placement';
import {
  animatedVectorCoordinatesToVector,
  calcOrthogonalUnitVector,
  calcUnitVector,
  distanceBetweenVectors,
  getLineCenter,
  translateAlongVector
} from '@/utils/vectors';

const getRandomDistance = (vertexRadius: number): number => {
  'worklet';
  return 6 * vertexRadius + Math.random() * 4 * vertexRadius;
};

const placeVertexOnCircle = (
  centerPosition: Vector,
  vertexRadius: number
): Vector => {
  'worklet';
  const angle = Math.random() * 2 * Math.PI;
  const radius = getRandomDistance(vertexRadius);
  return {
    x: centerPosition.x + radius * Math.cos(angle),
    y: centerPosition.y + radius * Math.sin(angle)
  };
};

const placceVertexOnPerpendicularLine = (
  placedVerticesPositions: Record<string, Vector>,
  vertexRadius: number
): Vector => {
  'worklet';
  const verticesPositions = Object.values(placedVerticesPositions);
  const lineCenter = getLineCenter(
    verticesPositions[0]!,
    verticesPositions[1]!
  );
  const orthogonalVector = calcOrthogonalUnitVector(
    verticesPositions[0]!,
    verticesPositions[1]!
  );
  const distance = getRandomDistance(vertexRadius);
  return translateAlongVector(lineCenter, orthogonalVector, distance);
};

const placeVertexOnConvexHull = (
  placedVerticesPositions: Record<string, Vector>,
  vertexRadius: number,
  closestTo?: Vector
): Vector => {
  'worklet';
  let closestVertex = closestTo;
  // Find the convex hull of the placed vertices
  const hull = grahamScan(Object.values(placedVerticesPositions));

  // Get the center point of the hull if the closest vertex to the
  // new vertex was not provided
  if (!closestVertex) {
    closestVertex = findCenterOfPoints(hull) ?? { x: 0, y: 0 };
  }

  // Find the center of the line between the two neighboring vertices
  // on the hull that is closest to the closestVertex position
  let lineCenter = getLineCenter(hull[0]!, hull[1]!);
  const closestDistance = distanceBetweenVectors(closestVertex, lineCenter);
  for (let i = 1; i < hull.length; i++) {
    const vertex = getLineCenter(hull[i]!, hull[(i + 1) % hull.length]!);
    const distance = distanceBetweenVectors(vertex, lineCenter);
    if (distance < closestDistance) {
      lineCenter = vertex;
    }
  }

  // Move the vertex a bit away from the center of the hull
  const directionVector = calcUnitVector(closestVertex, lineCenter);
  return translateAlongVector(
    lineCenter,
    directionVector,
    getRandomDistance(vertexRadius)
  );
};

const findForcesPlacementPosition = (
  placedVerticesPositions: Record<string, Vector>,
  neighbors: Array<string>,
  vertexRadius: number
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
  // If there are only 2 vertices placed, place the vertex on the
  // line perpendicular to the line between the two vertices
  if (placedVerticesCount === 2) {
    return placceVertexOnPerpendicularLine(
      placedVerticesPositions,
      vertexRadius
    );
  }
  // Otherwise, find the convex hull of placed vertices and place the
  // vertex closest to the center of its neighbors that are already
  // placed (if there are no placed vertices, place the vertex near
  // the center of the hull)
  const neighborsPositions = neighbors
    .map(key => placedVerticesPositions[key])
    .filter(Boolean) as Array<Vector>;
  const neighborsCenter = findCenterOfPoints(neighborsPositions)!;

  return placeVertexOnConvexHull(
    placedVerticesPositions,
    vertexRadius,
    neighborsCenter
  );
};

const findForcesPlacementPositions = (
  placedVerticesPositions: Record<string, AnimatedVectorCoordinates>,
  connections: GraphConnections,
  vertexRadius: number
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
    const neighbors = [];
    if (connections[key]?.incoming) {
      neighbors.push(...connections[key]!.incoming);
    }
    if (connections[key]?.outgoing) {
      neighbors.push(...connections[key]!.outgoing);
    }
    acc[key] = allVerticesPositions[key] = findForcesPlacementPosition(
      allVerticesPositions,
      neighbors,
      vertexRadius
    );
    return acc;
  }, {} as Record<string, Vector>);
};

export const updateInitialVerticesPositions = (
  animatedVerticesPositions: Record<string, AnimatedVectorCoordinates>,
  connections: GraphConnections,
  canvasDimensions: Dimensions,
  placementSettings: AllGraphPlacementSettings,
  animationSettings: AllAnimationSettings,
  onRender: (boundingRect: BoundingRect) => void
): void => {
  'worklet';
  const { boundingRect, verticesPositions } = placeVertices(
    connections,
    canvasDimensions,
    placementSettings
  );

  animateVerticesToFinalPositions(
    animatedVerticesPositions,
    verticesPositions,
    animationSettings
  );

  onRender(boundingRect);
};

export const updateNewVerticesPositions = <V>(
  placedVerticesPositions: Record<string, AnimatedVectorCoordinates>,
  verticesData: Record<string, VertexComponentData<V>>,
  connections: GraphConnections,
  vertexRadius: number
): void => {
  'worklet';
  // Filter out vertices that were removed from the graph
  const filteredVertices = Object.fromEntries(
    Object.entries(placedVerticesPositions).filter(
      ([key]) => verticesData[key]?.displayed.value
    )
  );
  // Calculate new vertices placement positions
  const newVerticesPositions = findForcesPlacementPositions(
    filteredVertices,
    connections,
    vertexRadius
  );
  // Update positions of new vertices
  for (const key in newVerticesPositions) {
    const position = newVerticesPositions[key]!;
    const vertexPosition = verticesData[key]?.position;
    if (!vertexPosition) {
      return;
    }
    vertexPosition.x.value = position.x;
    vertexPosition.y.value = position.y;
  }
};
