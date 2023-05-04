import { DEFAULT_FORCES_SETTINGS } from '@/constants/forces';
import { GraphConnections } from '@/types/graphs';
import { AnimatedVectorCoordinates } from '@/types/layout';
import { DefaultForcesStrategySettings } from '@/types/settings/forces';
import { applyForces, calcForces } from '@/utils/forces/shared';

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
  settings?: DefaultForcesStrategySettings
): void {
  'worklet';
  const attractionScale =
    settings?.attractionForce?.attractionScale ||
    DEFAULT_FORCES_SETTINGS.attractionScale;
  const attractionForceFactor =
    settings?.attractionForce?.attractionForceFactor ||
    DEFAULT_FORCES_SETTINGS.attractionForceFactor;
  const repulsionScale =
    settings?.repellingForce?.repulsionScale ||
    DEFAULT_FORCES_SETTINGS.repulsionScale;

  const forces = calcForces(
    connections,
    verticesPositions,
    createAttractionFactorGetter(attractionScale, attractionForceFactor),
    createRepellingFactorGetter(repulsionScale)
  );
  applyForces(forces, verticesPositions);
}
