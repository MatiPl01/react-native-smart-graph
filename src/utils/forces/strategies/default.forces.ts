import { GraphConnections } from '@/types/graphs';
import { AnimatedVectorCoordinates } from '@/types/layout';
import { DefaultForcesStrategySettings } from '@/types/settings/forces';

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

  // TODO
  // const attractionScale =
  //   settings?.attractionForce?.attractionScale ||
  //   DEFAULT_FORCES_SETTINGS.attractionScale;
  // const attractionForceFactor =
  //   settings?.attractionForce?.attractionForceFactor ||
  //   DEFAULT_FORCES_SETTINGS.attractionForceFactor;
  // const repulsionScale =
  //   settings?.repellingForce?.repulsionScale ||
  //   DEFAULT_FORCES_SETTINGS.repulsionScale;

  // const forces = calcForces(
  //   connections,
  //   verticesPositions,
  //   createAttractionFactorGetter(attractionScale, attractionForceFactor),
  //   createRepellingFactorGetter(repulsionScale)
  // );
  // updateVerticesPositions(forces, verticesPositions);
}
