/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Vector } from '@shopify/react-native-skia';

import { AnimatedVectorCoordinates } from '@/types/layout';
import { GraphConnections } from '@/types/models';
import {
  addVectors,
  addVectorsArray,
  animatedVectorCoordinatesToVector,
  calcUnitVector,
  distanceBetweenVectors,
  multiplyVector,
  vectorLength
} from '@/utils/vectors';

const calcAttractiveForce = (
  from: Vector,
  to: Vector,
  attractionFactorGetter: (distance: number) => number
): Vector => {
  'worklet';
  const distance = distanceBetweenVectors(from, to);
  const directionVector = calcUnitVector(from, to);
  const factor = attractionFactorGetter(distance);

  return multiplyVector(directionVector, factor);
};

const calcRepulsiveForce = (
  from: Vector,
  to: Vector,
  repulsiveFactorGetter: (distance: number) => number
): Vector => {
  'worklet';
  const distance = distanceBetweenVectors(from, to);
  const directionVector = calcUnitVector(from, to);
  const factor = repulsiveFactorGetter(distance);

  return multiplyVector(directionVector, factor);
};

const calcResultantAttractiveForce = (
  vertexKey: string,
  connections: GraphConnections,
  lockedVertices: Record<string, boolean>,
  verticesPositions: Record<string, AnimatedVectorCoordinates>,
  attractionFactorGetter: (distance: number) => number
): Vector => {
  'worklet';
  const vertexConnections = connections[vertexKey];
  if (!vertexConnections) {
    return { x: 0, y: 0 };
  }
  return addVectorsArray(
    [...vertexConnections.outgoing, ...vertexConnections.incoming]
      .filter(neighborKey => !lockedVertices[neighborKey])
      .map(neighborKey =>
        calcAttractiveForce(
          animatedVectorCoordinatesToVector(verticesPositions[vertexKey]),
          animatedVectorCoordinatesToVector(verticesPositions[neighborKey]),
          attractionFactorGetter
        )
      )
  );
};

const calcResultantRepulsiveForce = (
  vertexKey: string,
  lockedVertices: Record<string, boolean>,
  verticesPositions: Record<string, AnimatedVectorCoordinates>,
  repulsiveFactorGetter: (distance: number) => number
): Vector => {
  'worklet';
  return addVectorsArray(
    Object.keys(verticesPositions)
      .filter(
        otherVertexKey =>
          !lockedVertices[otherVertexKey] && otherVertexKey !== vertexKey
      )
      .map(otherVertexKey =>
        calcRepulsiveForce(
          animatedVectorCoordinatesToVector(verticesPositions[vertexKey]),
          animatedVectorCoordinatesToVector(verticesPositions[otherVertexKey]),
          repulsiveFactorGetter
        )
      )
  );
};

export const calcForces = (
  connections: GraphConnections,
  lockedVertices: Record<string, boolean>,
  verticesPositions: Record<string, AnimatedVectorCoordinates>,
  attractionFactorGetter: (distance: number) => number,
  repulsiveFactorGetter: (distance: number) => number
): Record<string, Vector> => {
  'worklet';
  const forces: Record<string, Vector> = {};
  for (const vertexKey in verticesPositions) {
    const attractiveForce = calcResultantAttractiveForce(
      vertexKey,
      connections,
      lockedVertices,
      verticesPositions,
      attractionFactorGetter
    );
    const repulsiveForce = calcResultantRepulsiveForce(
      vertexKey,
      lockedVertices,
      verticesPositions,
      repulsiveFactorGetter
    );
    forces[vertexKey] = addVectors(attractiveForce, repulsiveForce);
  }
  return forces;
};

export const updateVerticesPositions = (
  forces: Record<string, Vector>,
  lockedVertices: Record<string, boolean>,
  verticesPositions: Record<string, AnimatedVectorCoordinates>,
  minUpdateDistance: number
): {
  keys: Array<string>;
  positions: Record<string, Vector>;
} => {
  'worklet';
  const updatedVerticesPositions: Record<string, Vector> = {};
  const updatedVerticesKeys: Array<string> = [];

  for (const vertexKey in verticesPositions) {
    const force = forces[vertexKey]!;
    if (lockedVertices[vertexKey]) {
      continue;
    }
    const vertexPosition = animatedVectorCoordinatesToVector(
      verticesPositions[vertexKey]
    );
    if (vectorLength(force) < minUpdateDistance) {
      updatedVerticesPositions[vertexKey] = vertexPosition;
    } else {
      updatedVerticesPositions[vertexKey] = addVectors(vertexPosition, force);
      updatedVerticesKeys.push(vertexKey);
    }
  }

  return {
    keys: updatedVerticesKeys,
    positions: updatedVerticesPositions
  };
};
