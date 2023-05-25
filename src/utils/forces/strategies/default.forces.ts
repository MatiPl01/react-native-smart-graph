import { merge } from 'lodash-es';

import { DEFAULT_FORCES_SETTINGS } from '@/constants/settings';
import { GraphConnections } from '@/types/graphs';
import { VerticesPositions } from '@/types/layout';
import {
  DefaultForcesStrategySettings,
  ForcesScale
} from '@/types/settings/forces';
import { calcForces, updateVerticesPositions } from '@/utils/forces/shared';

const createAttractionFactorGetter = (
  attractionForceFactor: number,
  attractionScale: number
) => {
  'worklet';
  return (distance: number) => {
    'worklet';
    return (
      attractionForceFactor * Math.log(Math.max(distance, 1) / attractionScale)
    );
  };
};

const createRepellingFactorGetter = (repulsionScale: number) => {
  'worklet';
  return (distance: number) => {
    'worklet';
    return -repulsionScale / Math.max(distance, 1) ** 2;
  };
};

export default function applyDefaultForces(
  connections: GraphConnections,
  verticesPositions: VerticesPositions,
  forcesScale: ForcesScale,
  settings?: DefaultForcesStrategySettings
): void {
  'worklet';
  const {
    forces: {
      attraction: { targetPositions, edges },
      repelling: { vertices }
    }
  } = merge({}, DEFAULT_FORCES_SETTINGS, settings);

  const forces = calcForces(
    connections,
    verticesPositions,
    forcesScale,
    createRepellingFactorGetter(vertices.scale),
    createAttractionFactorGetter(edges.factor, edges.scale),
    createAttractionFactorGetter(targetPositions.factor, targetPositions.scale)
  );
  updateVerticesPositions(forces, verticesPositions);
}
