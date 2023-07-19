import { Vector } from '@shopify/react-native-skia';

import { GraphConnections } from '@/types/graphs';
import { AnimatedVectorCoordinates } from '@/types/layout';
import { ForcesSettingsWithDefaults } from '@/types/settings/forces';

import { applyDefaultForces } from './strategies/default.forces';

export const applyForces = (
  connections: GraphConnections,
  lockedVertices: Record<string, boolean>,
  verticesPositions: Record<string, AnimatedVectorCoordinates>,
  settings: ForcesSettingsWithDefaults
): Record<string, Vector> => {
  'worklet';
  switch (settings.strategy) {
    default:
    case 'default':
      return applyDefaultForces(
        connections,
        lockedVertices,
        verticesPositions,
        settings
      );
  }
};
