import 'react-native-reanimated';

import { Vector, vec } from '@shopify/react-native-skia';

import { GraphConnections } from '@/types/graphs';
import { AnimatedPositionCoordinates } from '@/types/layout';
import { CalculatedForces } from '@/types/settings/forces';
import {
  addVectors,
  addVectorsArray,
  animatedVectorToVector,
  calcUnitVector,
  distanceBetweenVectors,
  multiplyVector
} from '@/utils/vectors';

export const applyForces = (
  forces: CalculatedForces,
  verticesPositions: Record<string, AnimatedPositionCoordinates>
) => {
  'worklet';
  Object.entries(verticesPositions).forEach(([vertexKey, vertexPosition]) => {
    const attractionForce = forces.attractionForces[vertexKey] || vec(0, 0);
    const repellingForce = forces.repellingForces[vertexKey] || vec(0, 0);

    const force = addVectors(attractionForce, repellingForce);

    vertexPosition.x.value += force.x;
    vertexPosition.y.value += force.y;
  });
};

const calcResultantAttractionForce = (
  vertexKey: string,
  connections: GraphConnections,
  verticesPositions: Record<string, AnimatedPositionCoordinates>,
  attractionFactorGetter: (distance: number) => number
): Vector => {
  'worklet';
  const vertexConnections = connections[vertexKey];
  if (!vertexConnections) {
    return vec(0, 0);
  }
  return addVectorsArray(
    vertexConnections.map(neighborKey =>
      calcAttractiveForce(
        animatedVectorToVector(verticesPositions[vertexKey]),
        animatedVectorToVector(verticesPositions[neighborKey]),
        attractionFactorGetter
      )
    )
  );
};

const calcResultantRepellingForce = (
  vertexKey: string,
  verticesPositions: Record<string, AnimatedPositionCoordinates>,
  repellingFactorGetter: (distance: number) => number
): Vector => {
  'worklet';
  return addVectorsArray(
    Object.keys(verticesPositions).map(otherVertexKey => {
      if (otherVertexKey === vertexKey) {
        return vec(0, 0);
      }

      return calcRepellingForce(
        animatedVectorToVector(verticesPositions[vertexKey]),
        animatedVectorToVector(verticesPositions[otherVertexKey]),
        repellingFactorGetter
      );
    })
  );
};

export const calcForces = (
  connections: GraphConnections,
  verticesPositions: Record<string, AnimatedPositionCoordinates>,
  attractionFactorGetter: (distance: number) => number,
  repellingFactorGetter: (distance: number) => number
): CalculatedForces => {
  'worklet';

  return {
    attractionForces: Object.fromEntries(
      Object.keys(verticesPositions).map(vertexKey => [
        vertexKey,
        calcResultantAttractionForce(
          vertexKey,
          connections,
          verticesPositions,
          attractionFactorGetter
        )
      ])
    ),
    repellingForces: Object.fromEntries(
      Object.keys(verticesPositions).map(vertexKey => [
        vertexKey,
        calcResultantRepellingForce(
          vertexKey,
          verticesPositions,
          repellingFactorGetter
        )
      ])
    )
  };
};

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

const calcRepellingForce = (
  from: Vector,
  to: Vector,
  repellingFactorGetter: (distance: number) => number
): Vector => {
  'worklet';
  const distance = distanceBetweenVectors(from, to);
  const directionVector = calcUnitVector(from, to);
  const factor = repellingFactorGetter(distance);

  return multiplyVector(directionVector, factor);
};
