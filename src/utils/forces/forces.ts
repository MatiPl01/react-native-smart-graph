import { Vector } from '@shopify/react-native-skia';

import { GraphConnections } from '@/types/graphs';
import { AnimatedVectorCoordinates } from '@/types/layout';
import { ForcesSettingsWithDefaults } from '@/types/settings/forces';

import {
  applyDefaultForces,
  calcDefaultRepulsiveForceOnCoordinates
} from './strategies/default.forces';

export const applyForces = (
  connections: GraphConnections,
  verticesPositions: Record<string, AnimatedVectorCoordinates>,
  settings: ForcesSettingsWithDefaults
): void => {
  'worklet';
  switch (settings.strategy) {
    default:
    case 'default':
      applyDefaultForces(connections, verticesPositions, settings);
      break;
  }
};

export const calcRepulsiveForce = (
  coordinates: Vector,
  verticesPositions: Record<string, Vector>,
  settings: ForcesSettingsWithDefaults
): Vector => {
  'worklet';
  switch (settings.strategy) {
    default:
    case 'default':
      return calcDefaultRepulsiveForceOnCoordinates(
        coordinates,
        verticesPositions,
        settings.repulsionScale
      );
  }
};
