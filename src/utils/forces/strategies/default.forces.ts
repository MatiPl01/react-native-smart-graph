import { GraphConnections } from '@/types/graphs';
import { AnimatedVectorCoordinates } from '@/types/layout';
import { DefaultForcesStrategySettingsWithDefaults } from '@/types/settings';
import { calcForces, updateVerticesPositions } from '@/utils/forces/shared';

const createAttractionFactorGetter = (
  attractionForceFactor: number,
  attractionScale: number
) => {
  'worklet';
  return (distance: number) => {
    'worklet';
    return attractionForceFactor * Math.log(distance / attractionScale);
  };
};

const createRepellingFactorGetter = (repulsionScale: number) => {
  'worklet';
  return (distance: number) => {
    'worklet';
    return -repulsionScale / distance ** 2;
  };
};

export default function applyDefaultForces(
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
    createRepellingFactorGetter(repulsionScale)
  );
  updateVerticesPositions(forces, verticesPositions);
}
