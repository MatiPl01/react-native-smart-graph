/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Vector } from '@shopify/react-native-skia';

import { EdgeComponentData, VertexComponentData } from '@/types/data';
import { BoundingRect, Dimensions } from '@/types/layout';
import { GraphConnections } from '@/types/models';
import {
  AllAnimationSettings,
  AllGraphPlacementSettings
} from '@/types/settings';
import { grahamScan } from '@/utils/algorithms';
import { findCenterOfPoints } from '@/utils/layout';
import { placeVertices } from '@/utils/placement';
import {
  setVerticesPositions,
  updateComponentsTransform
} from '@/utils/transform';
import {
  calcOrthogonalUnitVector,
  calcUnitVector,
  distanceBetweenVectors,
  getLineCenter,
  translateAlongVector
} from '@/utils/vectors';
import { calcTranslationOnProgress } from '@/utils/views';

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
  placedVerticesPositions: Record<string, Vector>,
  connections: GraphConnections,
  vertexRadius: number
): Record<string, Vector> => {
  'worklet';
  // Determine which vertices are not placed yet
  const unplacedVertices = Object.keys(connections).filter(
    key => !placedVerticesPositions[key]
  );
  // Place unplaced vertices
  return unplacedVertices.reduce(
    (acc, key) => {
      const neighbors = [];
      if (connections[key]?.incoming) {
        neighbors.push(...connections[key]!.incoming);
      }
      if (connections[key]?.outgoing) {
        neighbors.push(...connections[key]!.outgoing);
      }
      acc[key] = placedVerticesPositions[key] = findForcesPlacementPosition(
        placedVerticesPositions,
        neighbors,
        vertexRadius
      );
      return acc;
    },
    {} as Record<string, Vector>
  );
};

export const updateInitialPlacement = <V, E>(
  verticesData: Record<string, VertexComponentData<V>>,
  edgesData: Record<string, EdgeComponentData<E>>,
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

  updateComponentsTransform(
    verticesData,
    edgesData,
    verticesPositions,
    animationSettings
  );

  onRender(boundingRect);
};

export const updateNextPlacement = <V, E>(
  placedVerticesData: Record<string, VertexComponentData<V>>,
  verticesData: Record<string, VertexComponentData<V>>,
  edgesData: Record<string, EdgeComponentData<E>>,
  connections: GraphConnections,
  vertexRadius: number
): void => {
  'worklet';
  // Filter out vertices that were removed from the graph
  // and calculate vertices positions
  const verticesPositions = Object.fromEntries(
    Object.entries(placedVerticesData)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, { removed }]) => !removed)
      .map(
        ([
          key,
          {
            points: {
              value: { source, target }
            },
            transformProgress: { value: progress }
          }
        ]) => [key, calcTranslationOnProgress(progress, source, target)]
      )
  );

  // Calculate new vertices placement positions
  const newVerticesPositions = findForcesPlacementPositions(
    verticesPositions,
    connections,
    vertexRadius
  );
  // Update positions of new vertices
  setVerticesPositions(newVerticesPositions, verticesData, edgesData);
};
