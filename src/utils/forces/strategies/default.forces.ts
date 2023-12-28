import { Vector } from '@shopify/react-native-skia';

import { GraphConnections } from '@/types/models';
import { AllForceLayoutSettings } from '@/types/settings';
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
  verticesPositions: Record<string, Vector>,
  {
    attractionForceFactor,
    attractionScale,
    minUpdateDistance,
    repulsionScale
  }: Omit<AllForceLayoutSettings, 'refreshInterval'>
): {
  keys: Array<string>;
  positions: Record<string, Vector>;
} => {
  'worklet';
  const forces = calcForces(
    connections,
    lockedVertices,
    verticesPositions,
    createAttractionFactorGetter(attractionScale, attractionForceFactor),
    createRepulsionFactorGetter(repulsionScale)
  );
  return updateVerticesPositions(
    forces,
    lockedVertices,
    verticesPositions,
    minUpdateDistance
  );
};
