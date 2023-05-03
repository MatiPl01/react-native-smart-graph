import 'react-native-reanimated';

import { Vector, vec } from '@shopify/react-native-skia';

import { GraphConnections } from '@/types/graphs';
import { AnimatedPositionCoordinates } from '@/types/layout';
import {
  addVectors,
  addVectorsArray,
  animatedVectorToVector,
  calcUnitVector,
  distanceBetweenVectors,
  multiplyVector
} from '@/utils/vectors';

export const applyForces = (
  forces: Record<string, Vector>,
  verticesPositions: Record<string, AnimatedPositionCoordinates>
) => {
  'worklet';
  Object.entries(verticesPositions).forEach(([vertexKey, vertexPosition]) => {
    const force = forces[vertexKey] as Vector;
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
  return addVectorsArray(
    (connections[vertexKey] as string[]).map(neighbourKey =>
      calcAttractiveForce(
        animatedVectorToVector(
          verticesPositions[vertexKey] as AnimatedPositionCoordinates
        ),
        animatedVectorToVector(
          verticesPositions[neighbourKey] as AnimatedPositionCoordinates
        ),
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
        animatedVectorToVector(
          verticesPositions[vertexKey] as AnimatedPositionCoordinates
        ),
        animatedVectorToVector(
          verticesPositions[otherVertexKey] as AnimatedPositionCoordinates
        ),
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
): Record<string, Vector> => {
  'worklet';
  const forces: Record<string, Vector> = {};
  for (const vertexKey in verticesPositions) {
    const attractionForce = calcResultantAttractionForce(
      vertexKey,
      connections,
      verticesPositions,
      attractionFactorGetter
    );
    const repellingForce = calcResultantRepellingForce(
      vertexKey,
      verticesPositions,
      repellingFactorGetter
    );
    forces[vertexKey] = addVectors(attractionForce, repellingForce);
  }
  return forces;
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
