/* eslint-disable @typescript-eslint/no-non-null-assertion */
import 'react-native-reanimated';

import { Vector } from '@shopify/react-native-skia';

import { GraphConnections } from '@/types/graphs';
import { VerticesPositions } from '@/types/layout';
import { ForcesScale } from '@/types/settings/forces';
import {
  addVectors,
  addVectorsArray,
  animatedVectorCoordinatesToVector,
  calcUnitVector,
  distanceBetweenVectors,
  multiplyVector
} from '@/utils/vectors';

export const updateVerticesPositions = (
  forces: Record<string, Vector>,
  verticesPositions: VerticesPositions
) => {
  'worklet';
  Object.entries(verticesPositions).forEach(([vertexKey, { displayed }]) => {
    const force = forces[vertexKey] as Vector;
    displayed.x.value += force.x;
    displayed.y.value += force.y;
  });
};

const calcForce = (
  from: Vector,
  to: Vector,
  factorGetter: (distance: number) => number
): Vector => {
  'worklet';
  const distance = distanceBetweenVectors(from, to);
  const directionVector = calcUnitVector(from, to);
  const factor = factorGetter(distance);

  return multiplyVector(directionVector, factor);
};

const calcEdgesAttractionForce = (
  vertexKey: string,
  connections: GraphConnections,
  verticesPositions: VerticesPositions,
  edgesAttractionForce: (distance: number) => number
): Vector => {
  'worklet';
  const vertexConnections = connections[vertexKey];
  if (!vertexConnections) {
    return { x: 0, y: 0 };
  }
  return addVectorsArray(
    vertexConnections.map(neighborKey => {
      const vertexPosition = verticesPositions[vertexKey]?.displayed;
      const neighborPosition = verticesPositions[neighborKey]?.displayed;

      if (!vertexPosition || !neighborPosition) {
        return { x: 0, y: 0 };
      }
      return calcForce(
        animatedVectorCoordinatesToVector(vertexPosition),
        animatedVectorCoordinatesToVector(neighborPosition),
        edgesAttractionForce
      );
    })
  );
};

const calcVerticesRepellingForce = (
  vertexKey: string,
  verticesPositions: VerticesPositions,
  verticesRepellingFactorGetter: (distance: number) => number
): Vector => {
  'worklet';
  return addVectorsArray(
    Object.keys(verticesPositions).map(otherVertexKey => {
      if (otherVertexKey === vertexKey) {
        return { x: 0, y: 0 };
      }

      const vertexPosition = verticesPositions[vertexKey]?.displayed;
      const otherVertexPosition = verticesPositions[otherVertexKey]?.displayed;

      if (!vertexPosition || !otherVertexPosition) {
        return { x: 0, y: 0 };
      }

      return calcForce(
        animatedVectorCoordinatesToVector(vertexPosition),
        animatedVectorCoordinatesToVector(otherVertexPosition),
        verticesRepellingFactorGetter
      );
    })
  );
};

const calcTargetAttractionForce = (
  vertexKey: string,
  verticesPositions: VerticesPositions,
  targetAttractionFactorGetter: (distance: number) => number
): Vector => {
  'worklet';
  if (!verticesPositions[vertexKey]) {
    return { x: 0, y: 0 };
  }

  const { displayed: displayedPosition, target: targetPosition } =
    verticesPositions[vertexKey]!;
  const displayedPositionVector =
    animatedVectorCoordinatesToVector(displayedPosition);
  const targetPositionVector =
    animatedVectorCoordinatesToVector(targetPosition);

  return calcForce(
    displayedPositionVector,
    targetPositionVector,
    targetAttractionFactorGetter
  );
};

export const calcForces = (
  connections: GraphConnections,
  verticesPositions: VerticesPositions,
  forcesScale: ForcesScale,
  verticesRepellingFactorGetter: (distance: number) => number,
  edgesAttractionFactorGetter: (distance: number) => number,
  targetAttractionFactorGetter: (distance: number) => number
): Record<string, Vector> => {
  'worklet';
  return Object.fromEntries(
    Object.keys(verticesPositions).map(vertexKey => {
      const verticesRepellingForce = calcVerticesRepellingForce(
        vertexKey,
        verticesPositions,
        verticesRepellingFactorGetter
      );
      const targetAttractionForce = calcTargetAttractionForce(
        vertexKey,
        verticesPositions,
        targetAttractionFactorGetter
      );
      const edgesAttractionForce = calcEdgesAttractionForce(
        vertexKey,
        connections,
        verticesPositions,
        edgesAttractionFactorGetter
      );

      // Calculate graph force
      const graphForce = addVectors(
        verticesRepellingForce,
        edgesAttractionForce
      );
      // Calculate the resulting force
      return [
        vertexKey,
        addVectors(
          multiplyVector(graphForce, forcesScale.graph.value),
          multiplyVector(targetAttractionForce, forcesScale.target.value)
        )
      ];
    })
  );
};
