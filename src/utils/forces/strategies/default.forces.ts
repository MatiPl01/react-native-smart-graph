import { DEFAULT_FORCES_SETTINGS } from '@/constants/forces';
import { GraphConnections } from '@/types/graphs';
import { AnimatedPositionCoordinates } from '@/types/layout';
import {
  CalculatedForces,
  DefaultForcesStrategySettings
} from '@/types/settings/forces';
import { calcForces } from '@/utils/forces/shared';

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

export default function calcDefaultForces(
  connections: GraphConnections,
  verticesPositions: Record<string, AnimatedPositionCoordinates>,
  settings?: DefaultForcesStrategySettings
): CalculatedForces {
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

  return calcForces(
    connections,
    verticesPositions,
    createAttractionFactorGetter(attractionScale, attractionForceFactor),
    createRepellingFactorGetter(repulsionScale)
  );
}
