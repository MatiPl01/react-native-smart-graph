import { GraphConnections } from '@/types/graphs';
import { AnimatedVectorCoordinates } from '@/types/layout';
import { DefaultForcesStrategySettingsWithDefaults } from '@/types/settings/forces';
import { calcForces, updateVerticesPositions } from '@/utils/forces/shared';

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

export const applyDefaultForces = (
  connections: GraphConnections,
  lockedVertices: Record<string, boolean>,
  verticesPositions: Record<string, AnimatedVectorCoordinates>,
  {
    attractionForceFactor,
    attractionScale,
    repulsionScale
  }: DefaultForcesStrategySettingsWithDefaults
) => {
  'worklet';
  const forces = calcForces(
    connections,
    lockedVertices,
    verticesPositions,
    createAttractionFactorGetter(attractionScale, attractionForceFactor),
    createRepulsionFactorGetter(repulsionScale)
  );
  updateVerticesPositions(forces, lockedVertices, verticesPositions);
};
