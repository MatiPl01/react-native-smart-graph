import { Vector } from '@shopify/react-native-skia';

import { GraphConnections } from '@/types/graphs';
import { AnimatedVectorCoordinates } from '@/types/layout';
import { DefaultForcesStrategySettingsWithDefaults } from '@/types/settings/forces';
import {
  calcForces,
  calcResultantRepulsiveForceOnCoordinates,
  updateVerticesPositions
} from '@/utils/forces/shared';

const createAttractionFactorGetter = (
  attractionForceFactor: number,
  attractionScale: number
) => {
  'worklet';
  return (distance: number) => {
    'worklet';
    return distance > 0
      ? attractionForceFactor * Math.log(distance / attractionScale)
      : 0;
  };
};

const createRepulsionFactorGetter = (repulsionScale: number) => {
  'worklet';
  return (distance: number) => {
    'worklet';
    return distance > 0 ? -repulsionScale / distance ** 2 : 0;
  };
};

export function applyDefaultForces(
  connections: GraphConnections,
  verticesPositions: Record<string, AnimatedVectorCoordinates>,
  {
    attractionScale,
    attractionForceFactor,
    repulsionScale
  }: DefaultForcesStrategySettingsWithDefaults
): void {
  'worklet';
  const forces = calcForces(
    connections,
    verticesPositions,
    createAttractionFactorGetter(attractionScale, attractionForceFactor),
    createRepulsionFactorGetter(repulsionScale)
  );
  updateVerticesPositions(forces, verticesPositions);
}

export function calcDefaultRepulsiveForceOnCoordinates(
  coordinates: Vector,
  verticesPositions: Record<string, Vector>,
  repulsionScale: number
): Vector {
  'worklet';
  return calcResultantRepulsiveForceOnCoordinates(
    coordinates,
    verticesPositions,
    createRepulsionFactorGetter(repulsionScale)
  );
}
